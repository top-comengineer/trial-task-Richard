// pages/api/tabs/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { userId, layout_name } = req.body;

    // const session = await getSession({ req });
    // console.log(session);
    // if (!session || !session.user.userId) {
    //   return res
    //     .status(401)
    //     .json({ error: "You must be logged in to create layouts." });
    // }

    try {
      const newTab = await prisma.layout.create({
        data: {
          user_id: userId,
          layout_name: layout_name,
          // Add other fields here as necessary
        },
      });
      res.status(200).json(newTab);
    } catch (error) {
      console.error("Request error", error);
      res.status(500).json({ error: "Error creating new tab" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
