import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const createBorrowSchema = Joi.object({
  user_id: Joi.number().required(),
  item_id: Joi.number().required(),
  borrow_date: Joi.date().required(),
  return_date: Joi.date().required(),
});

const createBorrowValidation = (req: Request, res: Response, next: NextFunction): any => {
  const validate = createBorrowSchema.validate(req.body);
  if (validate.error) {
    return res.status(400).json({
      message: validate.error.details.map((it) => it.message).join(),
    });
  }
  next();
};

const createReturnSchema = Joi.object({
  borrow_id: Joi.number().optional(),
  return_date: Joi.date().optional(),
});

const createReturnValidation = (req: Request, res: Response, next: NextFunction): any => {
  const validate = createReturnSchema.validate(req.body);
  if (validate.error) {
    return res.status(400).json({
      message: validate.error.details.map((it) => it.message).join(),
    });
  }
  next();
};

export { createBorrowValidation, createReturnValidation };
