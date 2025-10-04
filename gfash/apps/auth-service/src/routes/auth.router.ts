import express, { Router } from "express";
import {
  loginUser,
  resetUserPassword,
  userForgotPassword,
  userRegistration,
  verifyUser,
  verifyUserForgotPassword,
} from "../controller/authController";

const router: Router = express.Router();

router.post("/inscription-utilisateur", userRegistration);
router.post("/verification-utilisateur", verifyUser);
router.post("/connexion-utilisateur", loginUser);
router.post("/mot-de-passe-utili-oublie", userForgotPassword);
router.post("/verif-mdp-utili-oublie", verifyUserForgotPassword);
router.post("/reset-user-password", resetUserPassword);

export default router;
