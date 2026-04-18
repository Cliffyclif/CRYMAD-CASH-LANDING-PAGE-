const KNOWN = new Set(["btc", "eth", "sol", "xrp", "bnb", "ltt", "matic", "usdt", "usdc"]);

export function tokenIcon(symbol?: string | null): string {
  const key = (symbol || "").toLowerCase();
  if (!key || !KNOWN.has(key)) return "/tokens/ltt.svg";
  return `/tokens/${key}.svg`;
}
