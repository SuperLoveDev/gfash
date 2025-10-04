import crypto from "crypto";
import { ValidationError } from "../../../../packages/error-handler";
import { NextFunction, Request, Response } from "express";
import redis from "../../../../packages/libs/Redis";
import { sendEmail } from "./sendMail";
import prisma from "../../../../packages/libs/Prisma";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// validate registration data for required fields and email
export const validateRegistrationData = async (
  data: any,
  userType: "user" | "seller"
) => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === "seller" && (!phone_number || !country))
  ) {
    throw new ValidationError("Champs requis manquants !");
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError("Format d'email invalide");
  }
};

// check user otp restriction
export const checkOtpRestrictions = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    return next(
      new ValidationError(
        "Compte verrouillé après plusieurs tentatives échouées ! Réessayez dans 30 minutes"
      )
    );
  }

  if (await redis.get(`otp_spam_lock:${email}`)) {
    return next(
      new ValidationError(
        "Trop de demandes d’OTP, veuillez patienter une heure avant de réessayer."
      )
    );
  }

  if (await redis.get(`otp_cooldown:${email}`)) {
    return next(
      new ValidationError(
        "Votre compte est temporairement bloqué, réessayez dans 30 minutes"
      )
    );
  }
};

// and then track the otp to see how many times it was sent
export const trackOtpRequests = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  const otpRequest = await redis.incr(otpRequestKey);

  if (otpRequest === 1) {
    await redis.expire(otpRequestKey, 60);
  }

  if (otpRequest >= 2) {
    await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600); //1hr
    return next(
      new ValidationError(
        "Vous avez demandé trop de codes. Réessayez dans une heure."
      )
    );
  }
};

// finally generate and send otp via email
export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  await sendEmail(email, "Verifié votre email", template, { name, otp });
  await redis.set(`otp:${email}`, otp, "EX", 300);
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);
};

// verify user otp with redis
export const verifyOtp = async (
  email: string,
  otp: string,
  next: NextFunction
) => {
  try {
    const storedOtp = await redis.get(`otp:${email}`);
    if (!storedOtp) {
      throw new ValidationError("OTP invalide ou expiré");
    }

    const failedAttemptKey = `otp_attempts:${email}`;
    const failedAttempt = parseInt((await redis.get(failedAttemptKey)) || "0");

    //block the otp after 2 demand & if the otp does not match the otp req.
    if (storedOtp !== otp) {
      if (failedAttempt >= 2) {
        await redis.set(`otp_lock:${email}`, "locked", "EX", 1800); //30min
        await redis.del(`otp:${email}`, failedAttemptKey);

        throw new ValidationError(
          "Trop de tentatives, compte verrouillé pendant 30 minutes"
        );
      }
      await redis.set(failedAttemptKey, failedAttempt + 1, "EX", 300);

      throw new ValidationError(`OTP incorrect. ${2 - failedAttempt} attempts`);
    }

    await redis.del(`otp:${email}`, failedAttemptKey);
  } catch (error) {
    return next(error);
  }
};

// user forgot password handler
export const handleForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
  userType: "user" | "seller"
) => {
  try {
    const { email } = req.body;
    if (!email) throw new ValidationError("L'email est requis !");

    // find the user or seller in database
    const user =
      userType === "user"
        ? await prisma.users.findUnique({ where: { email } })
        : await prisma.sellers.findUnique({ where: { email } });
    if (!user) throw new ValidationError(`${userType} not found`);

    // chec the otp and track
    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    // generate or provide otp for the user to reset password
    await sendOtp(
      user.name,
      email,
      userType === "user"
        ? "forgot-password-user-mail"
        : "forgot-password-seller-mail"
    );

    //response
    res.status(200).json({
      message:
        "Un code de réinitialisation a été envoyé à votre adresse e-mail.",
    });
  } catch (error) {
    return next(error);
  }
};

// verify user forgot password otp
export const verifyForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      throw new ValidationError(
        "L'email et nouveau mot de passe sont requis !"
      );
    }

    await verifyOtp(email, otp, next);

    res.status(200).json({
      message: "OTP verified. You can now reset your password",
    });
  } catch (error) {
    return next(error);
  }
};
