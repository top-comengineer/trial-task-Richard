// pages/api/layout-config/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getSession, useSession } from "next-auth/react";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = await getToken({ req });
  // General authorization check (adjust as necessary)
  if (!token || typeof token.userId !== 'number') {
    return res.status(401).json({ error: "You must be logged in." });
  }

  switch (req.method) {
    case "POST":
      await handleCreate(req, res, token.userId);
      break;
    case "GET":
      await handleRead(req, res, token.userId);
      break;
    case "PUT":
      await handleUpdate(req, res, token.userId);
      break;
    case "DELETE":
      await handleDelete(req, res, token.userId);
      break;
    default:
      res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handleCreate(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
) {
  const { layout_id, user_id, layout_json } = req.body;

  // Here, you can add authentication and authorization checks as necessary
  const session = await getSession({ req });
  if (!session || session.user.userId !== user_id) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const newLayoutConfig = await prisma.layoutConfig.create({
      data: {
        layout_id,
        user_id,
        layout_json,
      },
    });
    return res.status(200).json(newLayoutConfig);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create layout config" });
  }
}

async function handleRead(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
) {
  const { layout_id } = req.query;

  // Optional: Add session check for user authentication

  try {
    console.log("layout_id=======", layout_id);

    const layoutConfig = await prisma.layoutConfig.findFirst({
      where: {
        user_id: userId,
        layout_id: Number(layout_id),
      },
    });

    const userLayout = JSON.parse(String(layoutConfig?.layout_json)) ?? [];
    console.log(userLayout);
    /*
    [
        { i: 'stockmini-01', x: 0, y: 0, w: 1, h: 1 },
        { i: 'rssreader-01', x: 0, y: 1, w: 1, h: 2 },
        { i: 'stock-01', x: 1, y: 0, w: 1, h: 2 },
        { i: 'embed-01', x: 1, y: 2, w: 1, h: 2 },
        { i: 'analogclock-01', x: 2, y: 0, w: 1, h: 1 },
        { i: 'quote-01', x: 2, y: 1, w: 1, h: 1 }
        ]
    */
    console.log(userLayout.length);

    const userWidgets = userLayout.map((item: any) => ({ wid: item.i })) ?? [];

    return res.status(200).json({
      userLayout,
      userWidgets,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch layout configs" });
  }
}

async function handleUpdate(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
) {
  const { layout_id, layout_json } = req.body;

  // Assuming `userId` comes from session validation or similar authentication mechanism
  // and is already available in the function's scope

  try {
    console.log(layout_id, layout_json, userId);
    if (layout_id == 0) return res.status(200).json({});

    const updatedOrInsertedLayoutConfig = await prisma.layoutConfig.upsert({
      where: {
        // This assumes there's a unique constraint or combination on `userId` and `layout_id`
        // You might need to adjust based on your actual schema and constraints
        layout_user_unique: {
          user_id: userId,
          layout_id: layout_id,
        },
      },
      update: {
        layout_json,
      },
      create: {
        user_id: userId,
        layout_id: layout_id,
        layout_json,
      },
    });
    return res.status(200).json(updatedOrInsertedLayoutConfig);
  } catch (error) {
    console.error("Failed to upsert layout config", error);
    return res
      .status(500)
      .json({ error: "Failed to update or insert layout config" });
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
) {
  const { id } = req.query;

  // Add authentication checks as necessary
  try {
    await prisma.layoutConfig.delete({
      where: { id: Number(id) },
    });
    return res.status(204).send({});
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete layout config" });
  }
}
