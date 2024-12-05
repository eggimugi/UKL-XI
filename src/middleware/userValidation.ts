import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const createUserSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  role: Joi.string().valid("Admin", "User").required(),
});

const createUserValidation = (req: Request, res: Response, next: NextFunction): any => {
  const validate = createUserSchema.validate(req.body);
  if (validate.error) {
    return res.status(400).json({
      message: validate.error.details.map((it) => it.message).join(),
    });
  }
  next();
};

const updateUserSchema = Joi.object({
  username: Joi.string().optional(),
  password: Joi.string().optional(),
  role: Joi.string().valid("Admin", "User").required(),
});

const updateUserValidation = (req: Request, res: Response, next: NextFunction): any => {
  const validate = updateUserSchema.validate(req.body);
  if (validate.error) {
    return res.status(400).json({
      message: validate.error.details.map((it) => it.message).join(),
    });
  }
  next();
};

const authScheme = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const authValidation = (req: Request, res: Response, next: NextFunction): any => {
  const validate = authScheme.validate(req.body);
  if (validate.error) {
    return res.status(400).json({
      message: validate.error.details.map((it) => it.message).join(),
    });
  }
  next();
};

export { createUserValidation, updateUserValidation, authValidation };
