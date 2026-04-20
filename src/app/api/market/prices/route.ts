import { NextResponse } from "next/server";

const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  XRP: "ripple",
  BNB: "binancecoin",
  MATIC: "matic-network",
  USDT: "tether",
  USDC: "usd-coin",
};

type Cached = { at: number; data: unknown };
const CACHE: { current: Cached | null } = { current: null };
const TTL_MS = 60_000;

export async function GET() {
  try {
    if (CACHE.current && Date.now() - CACHE.current.at < TTL_MS) {
      return NextResponse.json(CACHE.current.data);
    }
    const ids = Object.values(COINGECKO_IDS).join(",");
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&sparkline=true&price_change_percentage=24h`;
    const res = await fetch(url, { headers: { accept: "application/json" }, next: { revalidate: 60 } });
    if (!res.ok) throw new Error(String(res.status));
    const arr = (await res.json()) as Array<{
      id: string;
      symbol: string;
      name: string;
      image: string;
      current_price: number;
      price_change_percentage_24h: number;
      sparkline_in_7d?: { price: number[] };
    }>;

    const bySymbol: Record<string, {
      symbol: string; name: string; price: number; change24h: number; sparkline: number[];
    }> = {};
    for (const [sym, id] of Object.entries(COINGECKO_IDS)) {
      const c = arr.find((x) => x.id === id);
      if (c) {
        bySymbol[sym] = {
          symbol: sym,
          name: c.name,
          price: c.current_price,
          change24h: c.price_change_percentage_24h ?? 0,
          sparkline: c.sparkline_in_7d?.price ?? [],
        };
      }
    }
    const data = { prices: bySymbol, updatedAt: Date.now() };
    CACHE.current = { at: Date.now(), data };
    return NextResponse.json(data);
  } catch (e) {
    if (CACHE.current) return NextResponse.json(CACHE.current.data);
    return NextResponse.json({ error: (e as Error).message, prices: {} }, { status: 500 });
  }
}
