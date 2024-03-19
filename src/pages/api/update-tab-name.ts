// pages/api/update-tab-name.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getSession, useSession } from "next-auth/react";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Restrict method to POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Extract tabId and newName from the request body
    const { layout_id, newName } = req.body;

    // Validate the input
    if (typeof layout_id !== "number" || typeof newName !== "string") {
      return res.status(400).json({ message: "Invalid input" });
    }

    // Update the tab name in the database
    const updatedTab = await prisma.layout.update({
      where: {
        layout_id: layout_id, // Ensure this matches your schema's field name
      },
      data: {
        layout_name: newName, // Ensure this matches your schema's field name
      },
    });

    // Respond with the updated tab
    return res.status(200).json(updatedTab);
  } catch (error) {
    console.error("Failed to update tab name:", error);
    return res.status(500).json({ message: "Failed to update tab name" });
  }
}
