// pages/api/tabs/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getSession, useSession } from "next-auth/react";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

declare module "next-auth" {
  // This extends the built-in session and user model with additional fields.
  interface Session {
    user: {
      email: string;
      userId: number;
      address?: string;
      token?: string; // Optionally add token
    };
  }

  interface User {
    userId: number;
    address?: string;
  }

  interface JWT {
    userId?: number;
    token?: string;
  }
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = await getToken({ req });
  console.log("token::::::::::", token);
  // General authorization check (adjust as necessary)
  if (!token) {
    return res.status(401).json({ error: "You must be logged in." });
  }

  switch (req.method) {
    case "POST":
      await createLayout(req, res, token.userId);
      break;
    case "GET":
      await getLayouts(req, res, token.userId);
      break;
    case "PUT":
      await updateLayout(req, res, token.userId);
      break;
    case "DELETE":
      await deleteLayout(req, res, token.userId);
      break;
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function createLayout(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
) {
  const { layout_name } = req.body;

  try {
    const newTab = await prisma.layout.create({
      data: {
        user_id: userId,
        layout_name: layout_name,
        // Add other fields here as necessary
      },
    });

    const layouts = await prisma.layout.findMany({
      where: {
        user_id: userId, // Filter layouts by userId
      },
    });

    res.status(200).json(layouts);
  } catch (error) {
    console.error("Request error", error);
    res.status(500).json({ error: "Error creating new tab" });
  }
}

async function getLayouts(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
) {
  try {
    const layouts = await prisma.layout.findMany({
      where: {
        user_id: userId, // Filter layouts by userId
      },
    });

    res.status(200).json(layouts);
  } catch (error) {
    console.error("Request error", error);
    res.status(500).json({ error: "Error fetching layouts" });
  }
}

async function updateLayout(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
) {
  const { id, layout_name } = req.body;

  try {
    const updatedLayout = await prisma.layout.update({
      where: { layout_id: id },
      data: {
        layout_name: layout_name,
        // Update other fields as necessary
      },
    });
    res.status(200).json(updatedLayout);
  } catch (error) {
    console.error("Request error", error);
    res.status(500).json({ error: "Error updating layout" });
  }
}

async function deleteLayout(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
) {
  const { layout_id } = req.query;

  console.log("layout_id", layout_id);
  try {
    await prisma.layoutConfig.deleteMany({
      where: {
        layout_id: Number(layout_id),
      },
    });

    await prisma.layout.delete({
      where: {
        user_id: userId,
        layout_id: Number(layout_id),
      },
    });

    res.status(200).send({});
  } catch (error) {
    console.error("Request error", error);
    res.status(500).json({ error: "Error deleting layout" });
  }
}
