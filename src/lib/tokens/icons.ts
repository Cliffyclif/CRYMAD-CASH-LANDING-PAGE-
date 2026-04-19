// Map symbol/network key -> icon file (extensions differ).
const ICONS: Record<string, string> = {
  btc: "/tokens/btc.svg",
  eth: "/tokens/eth.svg",
  sol: "/tokens/sol.svg",
  xrp: "/tokens/xrp.svg",
  bnb: "/tokens/bnb.svg",
  ltt: "/tokens/ltt.svg",
  matic: "/tokens/matic.svg",
  usdt: "/tokens/usdt.svg",
  usdc: "/tokens/usdc.svg",
  tron: "/tokens/tron.png",
  // Aliases — networks that share native tokens
  trx: "/tokens/tron.png",
  bsc: "/tokens/bnb.svg",
  polygon: "/tokens/matic.svg",
};

export function tokenIcon(symbol?: string | null): string {
  const key = (symbol || "").toLowerCase();
  return ICONS[key] ?? "/tokens/ltt.svg";
}
