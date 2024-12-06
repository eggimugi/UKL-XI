import { Router } from "express";
import { createInventoryValidation, updateInventoryValidation } from "../middleware/inventoryValidation";
import { createInventory, deleteInventory, readInventory, updateInventory } from "../controller/inventoryController";
import { verifyToken } from "../middleware/authorization";

const router = Router();

router.post(`/inventory`, [verifyToken, createInventoryValidation], createInventory);
router.get(`/inventory/:id`, readInventory);
router.put(`/inventory/:id`, [verifyToken,updateInventoryValidation], updateInventory);
router.delete(`/inventory/:id`, [verifyToken], deleteInventory);

export default router;
