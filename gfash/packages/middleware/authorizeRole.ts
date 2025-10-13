import { NextFunction, Response } from "express";
import { ValidationError } from "../error-handler";

export const isSeller = async (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "seller") {
    return next(new ValidationError("Access non autorisé: uniquement vendeur"));
  }
  next();
};

export const isUser = async (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "user") {
    return next(new ValidationError("Access non autorisé: uniquement vendeur"));
  }
  next();
};
