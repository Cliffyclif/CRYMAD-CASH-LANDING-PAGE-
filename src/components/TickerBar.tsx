"use client";

import { useEffect, useState, useRef } from "react";

interface TickerData {
  pair: string;
  rate: string;
  change?: string;
  negative?: boolean;
  isCrypto?: boolean;
}

/* ── Currency labels for readability ── */
const CURRENCY_NAMES: Record<string, string> = {
  AED: "Dirham", AFN: "Afghani", ALL: "Lek", AMD: "Dram", ANG: "Guilder",
  AOA: "Kwanza", ARS: "Peso", AUD: "A$", AWG: "Florin", AZN: "Manat",
  BAM: "Mark", BBD: "B$", BDT: "Taka", BGN: "Lev", BHD: "Dinar",
  BIF: "Franc", BMD: "B$", BND: "B$", BOB: "Boliviano", BRL: "Real",
  BSD: "B$", BTN: "Ngultrum", BWP: "Pula", BYN: "Ruble", BZD: "B$",
  CAD: "C$", CDF: "Franc", CHF: "Franc", CLP: "Peso", CNY: "Yuan",
  COP: "Peso", CRC: "Colón", CZK: "Koruna", DKK: "Krone", DOP: "Peso",
  DZD: "Dinar", EGP: "Pound", ETB: "Birr", EUR: "Euro", FJD: "F$",
  GBP: "Pound", GEL: "Lari", GHS: "Cedi", GMD: "Dalasi", GNF: "Franc",
  GTQ: "Quetzal", GYD: "G$", HKD: "HK$", HNL: "Lempira", HRK: "Kuna",
  HTG: "Gourde", HUF: "Forint", IDR: "Rupiah", ILS: "Shekel", INR: "Rupee",
  IQD: "Dinar", IRR: "Rial", ISK: "Króna", JMD: "J$", JOD: "Dinar",
  JPY: "Yen", KES: "Shilling", KGS: "Som", KHR: "Riel", KMF: "Franc",
  KRW: "Won", KWD: "Dinar", KYD: "KY$", KZT: "Tenge", LAK: "Kip",
  LBP: "Pound", LKR: "Rupee", LRD: "L$", LSL: "Loti", LYD: "Dinar",
  MAD: "Dirham", MDL: "Leu", MGA: "Ariary", MKD: "Denar", MMK: "Kyat",
  MNT: "Tugrik", MOP: "Pataca", MRU: "Ouguiya", MUR: "Rupee", MVR: "Rufiyaa",
  MWK: "Kwacha", MXN: "Peso", MYR: "Ringgit", MZN: "Metical", NAD: "N$",
  NGN: "Naira", NIO: "Córdoba", NOK: "Krone", NPR: "Rupee", NZD: "NZ$",
  OMR: "Rial", PAB: "Balboa", PEN: "Sol", PGK: "Kina", PHP: "Peso",
  PKR: "Rupee", PLN: "Zloty", PYG: "Guarani", QAR: "Riyal", RON: "Leu",
  RSD: "Dinar", RUB: "Ruble", RWF: "Franc", SAR: "Riyal", SCR: "Rupee",
  SDG: "Pound", SEK: "Krona", SGD: "S$", SOS: "Shilling", SRD: "S$",
  SSP: "Pound", STN: "Dobra", SYP: "Pound", SZL: "Lilangeni", THB: "Baht",
  TJS: "Somoni", TMT: "Manat", TND: "Dinar", TOP: "Paʻanga", TRY: "Lira",
  TTD: "TT$", TWD: "NT$", TZS: "Shilling", UAH: "Hryvnia", UGX: "Shilling",
  UYU: "Peso", UZS: "Som", VES: "Bolívar", VND: "Dong", VUV: "Vatu",
  WST: "Tala", XAF: "CFA", XCD: "EC$", XOF: "CFA", XPF: "CFP",
  YER: "Rial", ZAR: "Rand", ZMW: "Kwacha", ZWL: "Z$",
};

/* ── Top 100 currencies to display (skip obscure/pegged ones) ── */
const TOP_CURRENCIES = [
  "EUR", "GBP", "JPY", "CNY", "INR", "NGN", "CAD", "AUD", "CHF", "HKD",
  "SGD", "KRW", "MXN", "BRL", "ZAR", "SEK", "NOK", "DKK", "NZD", "TRY",
  "RUB", "PLN", "THB", "IDR", "MYR", "PHP", "CZK", "HUF", "ILS", "AED",
  "SAR", "QAR", "KWD", "BHD", "OMR", "JOD", "EGP", "PKR", "BDT", "LKR",
  "KES", "GHS", "TZS", "UGX", "ETB", "MAD", "DZD", "TND", "XOF", "XAF",
  "ARS", "COP", "CLP", "PEN", "UYU", "BOB", "CRC", "GTQ", "DOP", "HNL",
  "JMD", "TTD", "BBD", "GYD", "PAB", "RON", "BGN", "RSD", "UAH", "GEL",
  "KZT", "UZS", "AZN", "AMD", "BYN", "MDL", "MKD", "BAM", "ISK", "HRK",
  "TWD", "VND", "KHR", "MMK", "LAK", "MNT", "NPR", "MVR", "MUR", "SCR",
  "BWP", "MZN", "MWK", "ZMW", "RWF", "FJD", "PGK", "WST", "IQD", "LYD",
];

function formatRate(rate: number): string {
  if (rate >= 10000) return Math.round(rate).toLocaleString("en-US");
  if (rate >= 1000) return rate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (rate >= 100) return rate.toFixed(2);
  if (rate >= 1) return rate.toFixed(4);
  return rate.toFixed(4);
}

function TickerItem({ pair, rate, change, negative, isCrypto }: TickerData) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap px-5 text-[12px]">
      <span className={`font-semibold ${isCrypto ? "text-amber-400" : "text-[#36D399]"}`}>{pair}</span>
      <span className="tabular-nums text-[var(--text-secondary)]">{rate}</span>
      {change && (
        <span className={`tabular-nums font-medium ${negative ? "text-red-400" : "text-[#36D399]"}`}>
          {change}
        </span>
      )}
    </span>
  );
}

export function TickerBar() {
  const [tickers, setTickers] = useState<TickerData[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchAll() {
      const results: TickerData[] = [];

      // 1) Crypto from CoinGecko
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple,solana,binancecoin,dogecoin,cardano,polkadot,avalanche-2,chainlink,tron,litecoin&vs_currencies=usd&include_24hr_change=true",
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          const map: [string, string][] = [
            ["bitcoin", "BTC"], ["ethereum", "ETH"], ["ripple", "XRP"],
            ["solana", "SOL"], ["binancecoin", "BNB"], ["dogecoin", "DOGE"],
            ["cardano", "ADA"], ["polkadot", "DOT"], ["avalanche-2", "AVAX"],
            ["chainlink", "LINK"], ["tron", "TRX"], ["litecoin", "LTC"],
          ];
          for (const [id, symbol] of map) {
            if (data[id]) {
              const price = data[id].usd;
              const ch = data[id].usd_24h_change ?? 0;
              results.push({
                pair: `${symbol} / USD`,
                rate: formatRate(price),
                change: `${ch >= 0 ? "+" : ""}${ch.toFixed(2)}%`,
                negative: ch < 0,
                isCrypto: true,
              });
            }
          }
        }
      } catch { /* continue */ }

      // 2) Forex from ExchangeRate API — 100 currencies
      try {
        const res = await fetch(
          "https://api.exchangerate-api.com/v4/latest/USD",
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          const rates = data.rates;
          if (rates) {
            for (const code of TOP_CURRENCIES) {
              if (rates[code]) {
                const r = rates[code];
                results.push({
                  pair: `USD / ${code}`,
                  rate: formatRate(r),
                });
              }
            }
          }
        }
      } catch { /* continue */ }

      if (results.length > 0) setTickers(results);
      setLoading(false);
    }

    fetchAll();
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (loading && tickers.length === 0) {
    return (
      <div className="w-full overflow-hidden bg-[var(--ticker-bg)] border-y border-[var(--glass-border)] py-2.5">
        <div className="text-center text-[var(--text-tertiary)] text-xs">Loading live rates...</div>
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-hidden bg-[var(--ticker-bg)] border-y border-[var(--glass-border)] py-2.5"
      aria-hidden="true"
      ref={containerRef}
    >
      <div
        className="flex w-max"
        style={{
          animation: `ticker-scroll ${Math.max(tickers.length * 3, 120)}s linear infinite`,
        }}
      >
        {[...tickers, ...tickers].map((ticker, i) => (
          <TickerItem key={`${ticker.pair}-${i}`} {...ticker} />
        ))}
      </div>
    </div>
  );
}
