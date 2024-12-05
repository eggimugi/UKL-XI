import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const header = req.headers.authorization;
    const [type, token] = header ? header.split(" ") : [];

    const signature = process.env.SECRET || "";
    const isVerified = jwt.verify(token, signature);
    if (!isVerified) {
      return res.status(401).json({
        messgae: `Unauthorized`,
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({ messege: error });
  }
};

export { verifyToken };