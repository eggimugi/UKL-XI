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

    if (findItem.quantity < 1) {
      return res.status(400).json({
        message: `Item with id ${item_id} is out of stock.`,
      });
    }

    const ongoingBorrow = await prisma.borrow.findFirst({
      where: {
        item_id,
        returnBorrow: {
          none: {},
        },
      },
    });

    if (ongoingBorrow) {
      return res.status(400).json({
        message: `Item with id ${item_id} is already borrowed and not yet returned.`,
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
      const borrow_id = req.body.borrow_id

      const findBorrow = await prisma.borrow.findFirst({
          where: { id: Number(borrow_id) }
      })

      if(!findBorrow) {
          return res.status(404).json({
              message: "Peminjaman not found"
          })
      }

      const return_date : Date = new Date(req.body.return_date)

      const createReturn = await prisma.returnBorrow.create({
          data: {
              borrow_id: Number(borrow_id),
              actual_return_date: return_date,
              user_id: findBorrow.user_id,
              item_id: findBorrow.item_id
          }
      })

      res.status(200).json({
          status: `succes`,
          message: `Pengembalian berhasil`,
          data: createReturn
      })
  } catch (error) {
      res.status(500).json(error)
      console.log(error)
  }
}

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
      include: { borrow_detail: { include: { inventory_detail: true } } },
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
      const key = ret.borrow_detail.inventory_detail[group_by]?.toString() ?? "unknown";
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

const borrowAnalysis = async (req: Request, res: Response): Promise<any> => {
  try {
    const { start_date, end_date } = req.body;

    if (!start_date || !end_date) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    const frequentlyBorrowed = await prisma.borrow.groupBy({
      by: ["item_id"],
      _count: { item_id: true },
      where: {
        borrow_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        _count: { item_id: "desc" },
      },
      take: 5,
    });

    const frequentlyBorrowedItems = await Promise.all(
      frequentlyBorrowed.map(async (borrow) => {
        const item = await prisma.inventory.findUnique({
          where: { id: borrow.item_id },
        });
        return {
          item_id: borrow.item_id,
          name: item?.name || "Unknown",
          category: item?.category || "Unknown",
          total_borrowed: borrow._count.item_id,
        };
      })
    );

    const inefficientItems = await prisma.returnBorrow.groupBy({
      by: ["item_id"],
      _count: { item_id: true },
      where: {
        actual_return_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        _count: { item_id: "desc" },
      },
    });

    const inefficientItemDetails = await Promise.all(
      inefficientItems.map(async (borrow) => {
        const item = await prisma.inventory.findUnique({
          where: { id: borrow.item_id },
        });
        return {
          item_id: borrow.item_id,
          name: item?.name || "Unknown",
          category: item?.category || "Unknown",
          total_borrowed: borrow._count.item_id,
          total_late_returns: borrow._count.item_id,
        };
      })
    );

    res.status(200).json({
      status: "success",
      data: {
        analysis_period: {
          start_date,
          end_date,
        },
        frequently_borrowed_items: frequentlyBorrowedItems,
        inefficient_items: inefficientItemDetails,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export { createBorrow, returnItem, usageReport, borrowAnalysis };
