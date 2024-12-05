import { Router } from "express";
import { authValidation, createUserValidation, updateUserValidation } from "../middleware/userValidation";
import { authentication, createUser, deleteUser, readUser, updateUser } from "../controller/userController";

const router = Router();

router.post(`/user`, [createUserValidation], createUser);
router.get(`/user`, readUser);
router.put(`/user/:id`, [updateUserValidation], updateUser);
router.delete(`/user/:id`, deleteUser);
router.post(`/auth/login`, [authValidation], authentication);

export default router;
