import { NextFunction, Request, Response } from "express";
import {
  checkOtpRestrictions,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyForgotPasswordOtp,
  verifyOtp,
} from "../utils/auth.helper";
import { ValidationError } from "../../../../packages/error-handler";
import prisma from "../../../../packages/libs/Prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { setCookie } from "../utils/Cookies/setCookie";

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

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return next(new ValidationError("Utilisateur introuvable"));
    }

    //verify password
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return next(new ValidationError("Email ou Mot de passe invalide"));
    }

    // generate access and refresh token
    const accessToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.PROCESS_SECRET_TOKEN as string,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.PROCESS_SECRET_TOKEN as string,
      {
        expiresIn: "7d",
      }
    );
    setCookie(res, "access_token", accessToken);
    setCookie(res, "refresh_token", refreshToken);

    res.status(201).json({
      message: "Login successfully",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    return next(error);
  }
};

// user forgot password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await handleForgotPassword(req, res, next, "user");
};

// verify user forgot password
export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await verifyForgotPasswordOtp(req, res, next);
};

// reset user password
export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return next(
        new ValidationError(
          "Merci d’indiquer votre email et un nouveau mot de passe."
        )
      );
    }
    //checking if the user exist
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return next(
        new ValidationError("Cet email n’est associé à aucun compte.")
      );
    }

    // check the new password and old one
    const isSamePassword = await bcrypt.compare(newPassword, user.password!);
    if (isSamePassword) {
      return next(
        new ValidationError(
          "Le nouveau mot de passe ne peut pas être identique à l'ancien 8 Merci de choisir un autre mot de passe."
        )
      );
    }

    // hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      message: "Mot de passe réinitialiser avec success !",
    });
  } catch (error) {
    return next(error);
  }
};

// **** SELLER ****

// register a new seller
export const sellerRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "seller");
    const { name, email } = req.body;

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });
    if (existingSeller) {
      throw new ValidationError("Seller already exist with this email");
    }

    // check and track seller otp
    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    // then send otp to the seller
    await sendOtp(name, email, "seller-email-activation");

    res.status(200).json({
      success: true,
      message: "Votre compte vendeur a été créé avec succès !",
    });
  } catch (error) {
    return next(error);
  }
};

// verify seller
export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, phone_number, country, otp } = req.body;
    if (!name || !email || !password || !phone_number || !country || !otp) {
      return next(new ValidationError("Tous les champs sont requis !"));
    }

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });
    if (existingSeller) {
      return next(new ValidationError("Un vendeur existe déja avec cet email"));
    }

    // verify otp
    await verifyOtp(email, otp, next);
    // hash the seller password
    const hashedPassword = await bcrypt.hash(password, 10);
    const seller = await prisma.sellers.create({
      data: { name, email, password: hashedPassword, phone_number, country },
    });

    res.status(200).json({
      seller,
      message: "Boutique créé avec success !",
    });
  } catch (error) {
    return next(error);
  }
};
