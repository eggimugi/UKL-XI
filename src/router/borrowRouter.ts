import { Router } from "express";
import { verifyToken } from "../middleware/authorization";
import { createBorrowValidation, createReturnValidation } from "../middleware/borrowValidation";
import { borrowAnalysis, createBorrow, returnItem, usageReport } from "../controller/borrowController";

const router = Router();

router.post(`/inventory/borrow`, [createBorrowValidation], createBorrow);
router.post(`/inventory/return`, [createReturnValidation], returnItem);
router.post(`/inventory/usage-report`, [verifyToken], usageReport);
router.post(`/inventory/borrow-analysis`, [verifyToken], borrowAnalysis);

export default router;
