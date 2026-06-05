import { Router } from "express";
import {
  loginController,
  verifyUserController,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/auth.controllers";
import { asyncHandler } from "../../shared/middelwares/asyncHandler";
import {
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from "../middelwares/validators/auth.validators";

const router = Router();

router.post("/login", loginValidator, asyncHandler(loginController));
router.post("/verify-user", asyncHandler(verifyUserController));
router.post(
  "/forgot-password",
  forgotPasswordValidator,
  asyncHandler(forgotPasswordController)
);
router.post(
  "/reset-password",
  resetPasswordValidator,
  asyncHandler(resetPasswordController)
);





export {router};