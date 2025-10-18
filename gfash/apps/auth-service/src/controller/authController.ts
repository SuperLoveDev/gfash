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
import { AuthError, ValidationError } from "../../../../packages/error-handler";
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
      message: "Bienvenue ! Votre compte a été créé avec succès.",
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

    res.clearCookie("seller-acces-token");
    res.clearCookie("seller-refresh-token");

    // generate access and refresh token
    const accessToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.REFESH_TOKEN_SECRET as string,
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

// refesh token user  and generate a new access token when the current one expires
export const refreshToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken =
      req.cookies["refresh_token"] ||
      req.cookies["seller-refesh-token"] ||
      req.headers.authorization?.split(" ")[1];

    if (!refreshToken) {
      return next(
        new ValidationError(
          "Non autorisé — aucun jeton de rafraîchissement fourni."
        )
      );
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { id: string; role: string };
    if (!decoded || !decoded.id || !decoded.role) {
      return next(
        new AuthError("Accès refusé : utilisateur ou vendeur introuvable.")
      );
    }

    let account;
    if (decoded.role === "user") {
      account = await prisma.users.findUnique({ where: { id: decoded.id } });
    } else if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
    }

    if (!account) {
      return new AuthError("utilisateur/Vendeur non trouvé");
    }

    // user verification
    const user = await prisma.users.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return next(new ValidationError("Utilisateur introuvable."));
    }

    // genertae new access token for the user every 15min
    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m",
      }
    );
    if (decoded.role === "user") {
      setCookie(res, "access_token", newAccessToken);
    } else if (decoded.role === "seller") {
      setCookie(res, "seller-access-token", newAccessToken);
    }

    req.role = decoded.role;

    return res.status(201).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

// logged in user function
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    res.status(201).json({
      success: true,
      user,
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

// create a boutique
export const createBoutique = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      bio,
      category,
      address,
      shop_contact,
      opening_hours,
      website,
      sellerId,
    } = req.body;

    if (
      !name ||
      !bio ||
      !category ||
      !address ||
      !shop_contact ||
      !opening_hours ||
      !sellerId
    ) {
      return next(new ValidationError("Tous les champs sont requis !"));
    }

    const existingSeller = await prisma.sellers.findUnique({
      where: { id: sellerId },
    });
    if (!existingSeller) {
      return next(new ValidationError("vendeur introuvable"));
    }

    const shopData: any = {
      name,
      bio,
      category,
      address,
      shop_contact,
      opening_hours,
      sellerId,
    };

    // add website when correctly added and to avoid unnecessary space
    if (website && website.trim() !== "") {
      shopData.website = website;
    }

    // create the boutique in the database
    const boutique = await prisma.shops.create({
      data: shopData,
    });
    res.status(201).json({
      success: true,
      boutique,
    });
  } catch (error) {
    return next(error);
  }
};

// logged in user
export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("L'email et mot de passe sont requis !"));
    }

    const seller = await prisma.sellers.findUnique({ where: { email } });
    if (!seller) {
      return next(new ValidationError("Un vendeur existe déja avec cet email"));
    }

    // hashed password
    const isMatch = await bcrypt.compare(password, seller.password!);
    if (!isMatch) {
      return next(new ValidationError("Email / mot de passe invalide"));
    }

    res.clearCookie("acces-token");
    res.clearCookie("refresh-token");

    // generate access and refresh token
    const accessToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    //store both access and refresh token
    setCookie(res, "seller-access-token", accessToken);
    setCookie(res, "seller-refresh-token", refreshToken);

    res.status(200).json({
      message: "Login succesfull",
      seller: { id: seller.id, email: seller.email, name: seller.name },
    });
  } catch (error) {
    return next(error);
  }
};

// get logged in seller
export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: "Vendeur non authentifié",
      });
    }

    res.status(200).json({
      success: true,
      seller,
    });
  } catch (error) {
    return next(error);
  }
};

// PAYSTACK CONNECTION
export const createPaystackLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { sellerId } = req.body;
  if (!sellerId) {
    return next(new ValidationError("Seller ID is required"));
  }

  const boutique = await prisma.sellers.findUnique({ where: { id: sellerId } });
  if (!boutique) {
    return next(new ValidationError("Aucune boutique n'est associé a cet ID"));
  }
};
