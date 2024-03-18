import { Widget } from '../../types';
import jsonAnalogClock from './AnalogClock/AnalogClock.json';
import jsonEmbed from './Embed/Embed.json';
import jsonQuote from './Quote/Quote.json';
import jsonRSSReader from './RSSReader/RSSReader.json';
import jsonStockChart from './StockChart/StockChart.json';
import jsonStockMini from './StockMini/StockMini.json';

export function isIframeWidget(wid: string) {
  return wid.startsWith('stock') || wid.startsWith('embed') || wid.startsWith('rssreader');
}

export function isDoubleHeightWidget(wid: string) {
  return (
    wid.startsWith('embed-') || wid.startsWith('stock-') || wid.startsWith('toggl-') || wid.startsWith('rssreader-')
  );
}

export const widgetList: Widget[] = [
  jsonAnalogClock,
  jsonEmbed,
  jsonQuote,
  jsonRSSReader,
  jsonStockChart,
  jsonStockMini,
];
