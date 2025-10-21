import express, { Router } from "express";
import {
  createPromoCode,
  deletePromoCode,
  getCategories,
  getPromoCode,
} from "../controllers/product.controllers";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";

const router: Router = express.Router();

router.get("/categories", getCategories);
router.post("/creer-code-promo", isAuthenticated, createPromoCode);
router.get("/code-promo", isAuthenticated, getPromoCode);
router.delete("/supprimer-code-promo/:id", isAuthenticated, deletePromoCode);

export default router;
