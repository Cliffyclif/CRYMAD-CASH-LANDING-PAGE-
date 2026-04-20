import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { routeByPath } from "./routes.generated";
import {
  useMe, useTransactions, useCryptoWallets, useMarketPrices,
  formatMoney, type User, type Wallet, type Transaction, type CryptoWallet,
  type MarketPrice,
} from "./lib/hooks";

interface StitchScreenProps {
  src: string;
  title: string;
}

/**
 * Injected into each stitch iframe. Intercepts:
 *  - internal <a> clicks -> postMessage("stitch-navigate")
 *  - form submits -> postMessage("stitch-form-submit") with serialized fields,
 *    or blocked if no handler registered on parent
 *  - handles text replacements and data-slot filling from parent messages
 */
const NAV_INTERCEPTOR = `
(function() {
  function isInternal(href) {
    if (!href || href.startsWith('javascript:') || href.startsWith('#') || href.startsWith('mailto:')) return false;
    try { var url = new URL(href, location.href); return url.origin === location.origin; } catch (e) { return false; }
  }
  function htmlToRoute(pathname) {
    var m = pathname.match(/\\/stitch\\/(.+)\\.html$/);
    if (!m) return null;
    return '/' + m[1].replace(/-/g, '/');
  }
  document.addEventListener('click', function(e) {
    var a = e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || !isInternal(href)) return;
    e.preventDefault();
    var url = new URL(href, location.href);
    var r = htmlToRoute(url.pathname);
    if (r) parent.postMessage({ type: 'stitch-navigate', href: r }, '*');
    else if (url.pathname !== location.pathname) parent.postMessage({ type: 'stitch-navigate-raw', href: url.pathname }, '*');
  }, true);

  document.addEventListener('submit', function(e) {
    e.preventDefault();
    var form = e.target;
    if (!form || form.tagName !== 'FORM') return;
    var fields = {};
    var inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(function(el) {
      if (el.name) fields[el.name] = el.value;
      else if (el.id) fields[el.id] = el.value;
      else if (el.getAttribute('data-field')) fields[el.getAttribute('data-field')] = el.value;
    });
    var action = form.getAttribute('action') || form.getAttribute('data-action') || '';
    parent.postMessage({ type: 'stitch-form-submit', action: action, fields: fields }, '*');
  }, true);

  function replaceText(replacements) {
    var pairs = Object.entries(replacements).filter(function(p) { return p[0] && p[1] != null; });
    if (pairs.length === 0) return;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var node, edits = [];
    while ((node = walker.nextNode())) {
      var txt = node.nodeValue;
      if (!txt) continue;
      var changed = txt;
      pairs.forEach(function(pair) {
        var from = pair[0], to = String(pair[1]);
        if (changed.indexOf(from) !== -1) changed = changed.split(from).join(to);
      });
      if (changed !== txt) edits.push([node, changed]);
    }
    edits.forEach(function(e) { e[0].nodeValue = e[1]; });
  }

  window.addEventListener('message', function(e) {
    if (!e.data || e.data.type !== 'stitch-data') return;
    if (e.data.slots) {
      Object.entries(e.data.slots).forEach(function(entry) {
        if (entry[1] == null) return;
        document.querySelectorAll('[data-slot="' + entry[0] + '"]').forEach(function(el) {
          el.textContent = String(entry[1]);
        });
      });
    }
    if (e.data.replacements) replaceText(e.data.replacements);
  });

  parent.postMessage({ type: 'stitch-ready' }, '*');
})();
`;

interface StitchSlots {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  balanceTotal?: string;
  balanceEWallet?: string;
  balanceCrypto?: string;
  balanceCards?: string;
  balanceRewards?: string;
}

function buildSlots(
  user: User | undefined,
  wallets: Wallet[] | undefined,
  cryptoWallets: CryptoWallet[] | undefined,
  prices: Record<string, MarketPrice> | undefined,
): { slots: StitchSlots; replacements: Record<string, string> } {
  const first = (user?.firstName && user.firstName !== "Pending") ? user.firstName : "";
  const last = (user?.lastName && user.lastName !== "Pending") ? user.lastName : "";
  const fullName = `${first} ${last}`.trim() || user?.email?.split("@")[0] || "";

  const wByType = Object.fromEntries((wallets ?? []).map((w) => [w.type, w]));
  const ewalletBal = wByType.ewallet?.balance ?? 0;
  const cardBal = wByType.card?.balance ?? 0;
  const rewardsBal = wByType.rewards?.balance ?? 0;

  const cryptoValue = (cryptoWallets ?? []).reduce((sum, cw) => {
    const p = prices?.[cw.token];
    return sum + (p ? cw.balance * p.price : 0);
  }, 0);

  const total = ewalletBal + cryptoValue + cardBal;

  const slots: StitchSlots = {
    firstName: first,
    lastName: last,
    fullName,
    email: user?.email,
    balanceTotal: formatMoney(total),
    balanceEWallet: formatMoney(ewalletBal),
    balanceCrypto: formatMoney(cryptoValue),
    balanceCards: formatMoney(cardBal),
    balanceRewards: rewardsBal.toLocaleString(),
  };

  // Text replacements: swap common demo strings so legacy HTMLs display real data
  // even when they don't have data-slot markers.
  const replacements: Record<string, string> = {
    "Good evening, Joseph": `Good evening${first ? ", " + first : ""}`,
    "Good morning, Joseph": `Good morning${first ? ", " + first : ""}`,
    "Joseph Obasi": fullName || "User",
    "JOSEPH OBASI": (fullName || "User").toUpperCase(),
    "joseph@crymadcash.com": user?.email || "",
    "joseph.obasi@email.com": user?.email || "",
    "$21,403.54": slots.balanceTotal || "$0.00",
    "$12,458.32": slots.balanceEWallet || "$0.00",
    "$48,291.55": slots.balanceCrypto || "$0.00",
  };

  return { slots, replacements };
}

export function StitchScreen({ src, title }: StitchScreenProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  const meQuery = useMe();
  const me = meQuery.data && "user" in meQuery.data ? meQuery.data : undefined;

  const txQuery = useTransactions({ limit: 5 });
  const cryptoQuery = useCryptoWallets();
  const pricesQuery = useMarketPrices();

  void txQuery; // reserved for transaction lists in slots later

  const payload = useMemo(
    () => buildSlots(me?.user, me?.wallets, cryptoQuery.data, pricesQuery.data),
    [me, cryptoQuery.data, pricesQuery.data],
  );

  useEffect(() => { setLoaded(false); }, [src]);
  useEffect(() => { document.title = `${title} — CRYMAD CA$H Mobile`; }, [title]);

  useEffect(() => {
    if (!loaded) return;
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage(
      { type: "stitch-data", slots: payload.slots, replacements: payload.replacements },
      "*",
    );
  }, [loaded, payload]);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === "stitch-navigate" && typeof e.data.href === "string") {
        const target = e.data.href;
        if (routeByPath.has(target) || target !== location.pathname) navigate(target);
      } else if (e.data.type === "stitch-navigate-raw" && typeof e.data.href === "string") {
        navigate(e.data.href);
      } else if (e.data.type === "stitch-ready") {
        setLoaded(true);
      } else if (e.data.type === "stitch-form-submit") {
        // Placeholder hook — individual sheet wiring will be added per-route.
        console.warn("[stitch] form submit intercepted (no handler)", e.data);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate, location.pathname]);

  function onIframeLoad() {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    const script = iframe.contentDocument.createElement("script");
    script.textContent = NAV_INTERCEPTOR;
    iframe.contentDocument.body.appendChild(script);
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {!loaded && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
            <span className="pulse-dot mr-2 inline-block align-middle" />
            Loading
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        key={src}
        src={src}
        title={title}
        onLoad={onIframeLoad}
        className="absolute inset-0 z-10 h-full w-full border-0"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      />
    </div>
  );
}
