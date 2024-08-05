import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";
import { registerValidationRules,loginValidationRules,validate } from "../middlewares/validation.middlewares.js";

const router =Router()

router.route("/register").post(registerValidationRules, validate, registerUser)


export default router