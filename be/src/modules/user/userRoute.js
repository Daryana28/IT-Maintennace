// be/src/modules/user/userRoute.js
import { Router } from "express";

import authMiddleware from "../../middlewares/authMiddleware.js";
import roleMiddleware from "../../middlewares/roleMiddleware.js";
import userController from "./userController.js";
import roleController from "./roleController.js";

const router = Router();

const ADMIN_ROLES = ["SUPERADMIN", "ADMIN"];

router.get(
    "/roles",
    authMiddleware,
    roleController.getAll
);

router.get(
    "/",
    authMiddleware,
    roleMiddleware(...ADMIN_ROLES),
    userController.getAll
);

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware(...ADMIN_ROLES),
    userController.getById
);

router.post(
    "/",
    authMiddleware,
    roleMiddleware(...ADMIN_ROLES),
    userController.create
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(...ADMIN_ROLES),
    userController.update
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(...ADMIN_ROLES),
    userController.remove
);

export default router;