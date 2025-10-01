export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this);
  }
}

// not found error
export class NotFoundError extends AppError {
  constructor(message = "Ressources non trouvées") {
    super(message, 404);
  }
}

// form validation error
export class ValidationError extends AppError {
  constructor(message = "Données de requête invalides", details?: any) {
    super(message, 400, true, details);
  }
}

// authentication error
export class AuthError extends AppError {
  constructor(message = "Non autorisé") {
    super(message, 401);
  }
}

// forbidden access
export class ForbiddenError extends AppError {
  constructor(message = "Accès interdit") {
    super(message, 403);
  }
}

// databse error for mongodb or any db
export class DatabaseError extends AppError {
  constructor(message = "Erreur de base de données", details?: any) {
    super(message, 500, true, details);
  }
}

// rate limit error
export class RateLimitError extends AppError {
  constructor(message = "Trop de requêtes, veuillez réessayer plus tard") {
    super(message, 429);
  }
}
