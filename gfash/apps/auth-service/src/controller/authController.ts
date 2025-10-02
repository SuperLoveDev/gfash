import { NextFunction, Request, Response } from "express";
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
} from "../utils/auth.helper";

import { ValidationError } from "../../../../packages/error-handler";
import prisma from "../../../../packages/libs/Prisma";

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
