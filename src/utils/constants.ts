import { KeyValueString } from "../../types";

export const UI_API_BASE = ""; //import.meta.env.VITE_UI_API_BASE;

export const WidgetWidth = 360;
export const WidgetHeight = 200;

export const DefaultWidgets = [
  {
    wid: "stockmini-01",
  },
  {
    wid: "stock-01",
  },
  {
    wid: "rssreader-01",
  },
  {
    wid: "embed-01",
  },
  {
    wid: "quote-01",
  },
  {
    wid: "analogclock-01",
  },
];

export const DefaultLayout = [
  { i: "stockmini-01", x: 0, y: 0, w: 1, h: 1 },
  { i: "rssreader-01", x: 0, y: 1, w: 1, h: 2 },

  { i: "stock-01", x: 1, y: 0, w: 1, h: 2 },
  { i: "embed-01", x: 1, y: 2, w: 1, h: 2 },
  
  { i: "analogclock-01", x: 2, y: 0, w: 1, h: 1 },
  { i: "quote-01", x: 2, y: 1, w: 1, h: 1 },
];
