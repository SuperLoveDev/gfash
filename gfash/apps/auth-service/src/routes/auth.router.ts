import express, { Router } from "express";
import {
  createBoutique,
  getSeller,
  getUser,
  loginSeller,
  loginUser,
  refreshToken,
  resetUserPassword,
  sellerRegistration,
  userForgotPassword,
  userRegistration,
  verifySeller,
  verifyUser,
  verifyUserForgotPassword,
} from "../controller/authController";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";
import { isSeller } from "../../../../packages/middleware/authorizeRole";

const router: Router = express.Router();

router.post("/inscription-utilisateur", userRegistration);
router.post("/verification-utilisateur", verifyUser);
router.post("/connexion-utilisateur", loginUser);
router.post("/rafraichir-token", refreshToken);
router.get("/utilisateur-connecte", isAuthenticated, getUser);
router.post("/mot-de-passe-utili-oublie", userForgotPassword);
router.post("/verif-mdp-utili-oublie", verifyUserForgotPassword);
router.post("/reset-user-password", resetUserPassword);
// seller routes
router.post("/inscription-vendeur", sellerRegistration);
router.post("/verification-vendeur", verifySeller);
router.post("/connexion-vendeur", loginSeller);
router.get("/vendeur-connecte", isAuthenticated, isSeller, getSeller);
router.post("/creation-boutique", createBoutique);

export default router;
