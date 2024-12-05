import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient({ errorFormat: "minimal" });

type GroupByKeys = "id" | "name" | "category" | "location" | "quantity";

const createBorrow = async (req: Request, res: Response): Promise<any> => {
  try {
    const user_id: number = Number(req.body.user_id);
    const item_id: number = Number(req.body.item_id);
    const borrow_date: Date = new Date(req.body.borrow_date);
    const return_date: Date = new Date(req.body.return_date);

    const findUser = await prisma.user.findUnique({
      where: {
        id: user_id,
      },
    });

    if (!findUser) {
      return res.status(404).json({
        message: `User with id ${user_id} not found`,
      });
    }

    const findItem = await prisma.inventory.findUnique({
      where: {
        id: item_id,
      },
    });

    if (!findItem) {
      return res.status(404).json({
        message: `Item with id ${item_id} not found`,
      });
    }

    const newBorrow = await prisma.borrow.create({
      data: {
        user_id,
        item_id,
        borrow_date,
        return_date,
      },
    });

    return res.status(200).json({
      message: `New borrow has been created`,
      data: newBorrow,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

const returnItem = async (req: Request, res: Response): Promise<any> => {
  try {
    const { borrow_id, return_date } = req.body;

    const borrowing = await prisma.borrow.findUnique({
      where: {
        id: Number(borrow_id),
      },
    });

    if (!borrowing) {
      return res.status(404).json({
        message: `Borrowing record with id ${borrow_id} not found`,
      });
    }

    const returnBorrowing = await prisma.returnBorrow.create({
      data: {
        borrow_id: Number(borrow_id),
        actual_return_date: new Date(return_date),
      },
    });

    return res.status(200).json({
      message: `Item has been successfully returned`,
      data: returnBorrowing,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json(error);
  }
};

const usageReport = async (req: Request, res: Response): Promise<any> => {
  const { start_date, end_date, group_by } = req.body as {
    start_date: string;
    end_date: string;
    group_by: GroupByKeys;
  };

  if (!start_date || !end_date || !group_by) {
    return res.status(400).json({ error: "Start date, end date, and group_by are required" });
  }

  try {
    const borrows = await prisma.borrow.findMany({
      where: {
        borrow_date: { gte: new Date(start_date), lte: new Date(end_date) },
      },
      include: { inventory_detail: true },
    });

    const returns = await prisma.returnBorrow.findMany({
      where: {
        actual_return_date: { gte: new Date(start_date), lte: new Date(end_date) },
      },
      include: { return_detail: { include: { inventory_detail: true } } },
    });

    const groupedData: Record<string, { total_borrowed: number; total_returned: number; items_in_use: number }> = {};

    borrows.forEach((borrow) => {
      const key = borrow.inventory_detail[group_by]?.toString() ?? "unknown";
      if (!groupedData[key]) {
        groupedData[key] = { total_borrowed: 0, total_returned: 0, items_in_use: 0 };
      }
      groupedData[key].total_borrowed++;
      groupedData[key].items_in_use++;
    });

    returns.forEach((ret) => {
      const key = ret.return_detail.inventory_detail[group_by]?.toString() ?? "unknown";
      if (groupedData[key]) {
        groupedData[key].total_returned++;
        groupedData[key].items_in_use--;
      }
    });

    const usageAnalysis = Object.entries(groupedData).map(([key, value]) => ({
      group: key,
      ...value,
    }));

    return res.status(200).json({
      status: "success",
      data: {
        analysis_period: { start_date, end_date },
        usage_analysis: usageAnalysis,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ error: "Internal server error" });
  }
};

const borrowAnalysis = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.body;

    const borrowData = await prisma.borrow.findMany({
      where: {
        borrow_date: {
          gte: new Date(start_date),
          lte: new Date(end_date),
        },
      },
      include: {
        inventory_detail: true,
        returnBorrow: true,
      },
    });

    const frequentlyBorrowedItems = borrowData.reduce((acc, item) => {
      const id = item.item_id;
      if (!acc[id]) {
        acc[id] = {
          item_id: id,
          name: item.inventory_detail.name,
          category: item.inventory_detail.category,
          total_borrowed: 0,
        };
      }
      acc[id].total_borrowed++;
      return acc;
    }, {} as Record<number, any>);

    const inefficientItems = borrowData
      .filter((item) => {
        return item.returnBorrow.some((ret) => ret.actual_return_date > item.return_date);
      })
      .map((item) => ({
        item_id: item.item_id,
        name: item.inventory_detail.name,
        category: item.inventory_detail.category,
        total_borrowed: frequentlyBorrowedItems[item.item_id].total_borrowed,
        total_late_returns: item.returnBorrow.filter((ret) => ret.actual_return_date > item.return_date).length,
      }));

    res.json({
      status: "success",
      data: {
        analysis_period: {
          start_date,
          end_date,
        },
        frequently_borrowed_items: Object.values(frequentlyBorrowedItems),
        inefficient_items: inefficientItems,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error" });
  }
};

export { createBorrow, returnItem, usageReport, borrowAnalysis };
