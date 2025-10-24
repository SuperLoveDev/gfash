import express, { Router } from "express";
import {
  createProduct,
  createPromoCode,
  deleteProduct,
  deleteProductImage,
  deletePromoCode,
  getBoutiqueProducts,
  getCategories,
  getPromoCode,
  uploadProductImage,
} from "../controllers/product.controllers";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";

const router: Router = express.Router();

router.get("/categories", getCategories);
router.post("/creer-code-promo", isAuthenticated, createPromoCode);
router.get("/code-promo", isAuthenticated, getPromoCode);
router.delete("/supprimer-code-promo/:id", isAuthenticated, deletePromoCode);
router.post("/televerser-image-produit", isAuthenticated, uploadProductImage);
router.delete("/supprimer-image-produit", isAuthenticated, deleteProductImage);
router.post("/creer-un-produit", isAuthenticated, createProduct);
router.get(
  "/recuperer-produits-boutique",
  isAuthenticated,
  getBoutiqueProducts
);
router.delete("/supprimer-produit/:productId", isAuthenticated, deleteProduct);

export default router;
