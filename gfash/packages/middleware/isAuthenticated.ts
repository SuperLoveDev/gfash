import { NextFunction, Response } from "express";
import { ValidationError } from "../error-handler";
import jwt from "jsonwebtoken";
import prisma from "../libs/Prisma";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies.access_token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return next(new ValidationError("Accès non autorisé : token manquant."));
    }

    // verify token
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as { id: string; role: "user" | "seller" };
    if (!decoded) {
      return res.status(401).json({
        message: "Unauthoriezd invalid token",
      });
    }

    const account = await prisma.users.findUnique({
      where: { id: decoded.id },
    });
    req.user = account;
    if (!account) {
      return res.status(401).json({ message: "Compte introuvable!" });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

export default isAuthenticated;
