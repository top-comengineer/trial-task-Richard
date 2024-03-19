// pages/api/layout.ts
import type { NextApiRequest, NextApiResponse } from "next";

type Item = {
  id: number;
  name: string;
};

// Dummy in-memory store for demonstration purposes
let items: Item[] = [
  { id: 1, name: "Item 1" },
  { id: 2, name: "Item 2" },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      return res.status(200).json(items);
    case "POST":
      const item: Item = JSON.parse(req.body);
      items.push(item);
      return res.status(201).json(item);
    case "PUT":
      const updatedItem: Item = JSON.parse(req.body);
      items = items.map((item) =>
        item.id === updatedItem.id ? updatedItem : item,
      );
      return res.status(200).json(updatedItem);
    case "DELETE":
      const { id } = req.query;
      items = items.filter((item) => item.id !== Number(id));
      return res.status(204).send(null);
    default:
      return res
        .setHeader("Allow", ["GET", "POST", "PUT", "DELETE"])
        .status(405)
        .end(`Method ${req.method} Not Allowed`);
  }
}
