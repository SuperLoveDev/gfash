import express, { Router } from "express";
import { userRegistration, verifyUser } from "../controller/authController";

const router: Router = express.Router();

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUser);

export default router;
