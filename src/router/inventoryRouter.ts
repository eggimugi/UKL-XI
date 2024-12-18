import { Router } from "express";
import { createInventoryValidation, updateInventoryValidation } from "../middleware/inventoryValidation";
import { createInventories, deleteInventories, readInventories, updateInventories } from "../controller/inventoryController";
import { verifyToken } from "../middleware/authorization";

const router = Router();

router.post(`/inventory`, [verifyToken, createInventoryValidation], createInventories);
router.get(`/inventory/:id`, readInventories);
router.put(`/inventory/:id`, [verifyToken,updateInventoryValidation], updateInventories);
router.delete(`/inventory/:id`, [verifyToken], deleteInventories);

export default router;
