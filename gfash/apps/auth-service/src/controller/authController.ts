import { NextFunction, Request, Response } from "express";
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyOtp,
} from "../utils/auth.helper";
import { ValidationError } from "../../../../packages/error-handler";
import prisma from "../../../../packages/libs/Prisma";
import bcrypt from "bcryptjs";

// register a user and send OTP for email verification
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "user");
    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return next(
        new ValidationError("Un utilisateur existe déjà avec cet email")
      );
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "user-activation-mail");

    res.status(200).json({
      message:
        "Un code OTP a été envoyé à votre email. Veuillez vérifier votre boîte de réception.",
    });
  } catch (error) {
    return next(error);
  }
};

// verify a user
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, name, password, otp } = req.body;
    if (!name || !email || !password || !otp) {
      return next(new ValidationError("Tous les champs sont requis !"));
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return next(
        new ValidationError("Un utilisateur exist déja avec cet email")
      );
    }

    // call of verifyotp function
    await verifyOtp(email, otp, next);

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.users.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(201).json({
      success: true,
      message: "Bienvenue à bord ! Votre compte a été créé avec succès.",
    });
  } catch (error) {
    return next(error);
  }
};

// login user
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("Email et mot de passe sont requis "));
    }
  } catch (error) {
    return next(error);
  }
};
