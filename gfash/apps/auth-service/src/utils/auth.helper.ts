import crypto from "crypto";
import { ValidationError } from "../../../../packages/error-handler";
import { NextFunction } from "express";
import redis from "../../../../packages/libs/Redis";
import { sendEmail } from "./sendMail";

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
