import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient({ errorFormat: "minimal" });

const createInventory = async (req: Request, res: Response): Promise<any> => {
  try {
    const name: string = req.body.name
    const category: string = req.body.category
    const location: string = req.body.location
    const quantity: number = Number(req.body.quantity);

    const newInventory = await prisma.inventory.create({
      data: {
        name,
        category, 
        location,
        quantity
      },
    });

    return res.status(201).json({ 
        status : "success",
        message: "New item has been added successfully", 
        data: newInventory });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

const readInventory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const findInventory = await prisma.inventory.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!findInventory) {
      return res.status(400).json({
        message: `Item is not found`,
      });
    }

    return res.status(200).json({
      message: `All items have been retrieved`,
      data: findInventory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error,
    });
  }
};

const updateInventory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const findInventory = await prisma.inventory.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!findInventory) {
      return res.status(400).json({
        message: `Item is not found`,
      });
    }

    const { name, category, location, quantity } = req.body;

    const saveInventory = await prisma.inventory.update({
      where: {
        id: Number(id),
      },
      data: {
        name: name ?? findInventory?.name,
        category: category ?? findInventory?.category,
        location: location ?? findInventory?.location,
        quantity: quantity ? Number(quantity) : findInventory.quantity,
      },
    });

    return res.status(200).json({ 
        message: "New item has been updated",
        data: saveInventory
     });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

const deleteInventory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const findInventory = await prisma.inventory.findFirst({
      where: {
        id: Number(id),
      },
    });

    if (!findInventory) {
      return res.status(400).json({
        message: `Item is not found`,
      });
    }

    await prisma.inventory.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      message: `Item has been removed`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

export { createInventory, readInventory, updateInventory, deleteInventory };
