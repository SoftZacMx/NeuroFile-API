import { Router } from "express";
import { loginController, verifyUserController } from "../controllers/auth.controllers";
import { asyncHandler } from "../../shared/middelwares/asyncHandler";
import { loginValidator } from "../middelwares/validators/auth.validators";

const router = Router();

router.post("/login", loginValidator, asyncHandler(loginController));
router.post("/verify-user", asyncHandler(verifyUserController));





export {router};