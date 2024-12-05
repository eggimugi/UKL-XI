import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const createInventorySchema = Joi.object({
  name: Joi.string().required(),
  category: Joi.string().required(),
  location: Joi.string().required(),
  quantity: Joi.number().required(),
});

const createInventoryValidation = (req: Request, res: Response, next: NextFunction): any => {
  const validate = createInventorySchema.validate(req.body);
  if (validate.error) {
    return res.status(400).json({
      message: validate.error.details.map((it) => it.message).join(),
    });
  }
  next();
};

const updateInventorySchema = Joi.object({
  name: Joi.string().optional(),
  category: Joi.string().optional(),
  location: Joi.string().optional(),
  quantity: Joi.number().optional(),
});

const updateInventoryValidation = (req: Request, res: Response, next: NextFunction): any => {
  const validate = updateInventorySchema.validate(req.body);
  if (validate.error) {
    return res.status(400).json({
      message: validate.error.details.map((it) => it.message).join(),
    });
  }
  next();
};

export { createInventoryValidation, updateInventoryValidation };
