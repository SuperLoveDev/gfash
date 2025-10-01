import { NextFunction, Request, Response } from "express";
import { AppError } from "./index";

export const errorMiddleware = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    console.log(`Error ${req.method} ${req.url} - ${err.message}`);

    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  console.log("Unhandle error:", err);

  return res.status(500).json({
    err: "Une erreur est survenue, veuillez réessayer plus tard",
  });
};
