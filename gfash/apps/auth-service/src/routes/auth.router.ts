import express, { Router } from "express";
import {
  createBoutique,
  getUser,
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

const router: Router = express.Router();

router.post("/inscription-utilisateur", userRegistration);
router.post("/verification-utilisateur", verifyUser);
router.post("/connexion-utilisateur", loginUser);
router.post("/utilisateur-rafraichir-token", refreshToken);
router.get("/utilisateur-connecte", isAuthenticated, getUser);
router.post("/mot-de-passe-utili-oublie", userForgotPassword);
router.post("/verif-mdp-utili-oublie", verifyUserForgotPassword);
router.post("/reset-user-password", resetUserPassword);
router.post("/inscription-boutique", sellerRegistration);
router.post("/verification-vendeur", verifySeller);
router.post("/creation-boutique", createBoutique);

export default router;
