import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { routeByPath } from "./routes.generated";
import {
  useMe, useTransactions, useCryptoWallets, useMarketPrices,
  useEwalletTransfer, useCryptoSwap, useCryptoSend, useCryptoSendOtp,
  useCardOrder, useCardLoad, useCardLock, useCardUnlock, useCardSendOtp,
  useAddBeneficiary, useDeleteBeneficiary, useCompleteRegistration,
  formatMoney, type User, type Wallet, type CryptoWallet, type MarketPrice,
} from "./lib/hooks";
import type { FormHandler, FormPayload } from "./lib/form-router";

interface StitchScreenProps {
  src: string;
  title: string;
}

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
    form.querySelectorAll('input, select, textarea').forEach(function(el) {
      var key = el.name || el.id || el.getAttribute('data-field');
      if (key) fields[key] = el.value;
    });
    var action = form.getAttribute('action') || form.getAttribute('data-action') || '';
    parent.postMessage({ type: 'stitch-form-submit', action: action, fields: fields }, '*');
  }, true);

  // Buttons with data-action outside a form still need to trigger mutations
  document.addEventListener('click', function(e) {
    var btn = e.target.closest ? e.target.closest('[data-action]') : null;
    if (!btn || btn.tagName === 'A') return;
    var action = btn.getAttribute('data-action');
    if (!action) return;
    e.preventDefault();
    // Gather inputs from the nearest panel / sheet container
    var scope = btn.closest('.sheet, [data-sheet], section, form') || document.body;
    var fields = {};
    scope.querySelectorAll('input, select, textarea').forEach(function(el) {
      var key = el.name || el.id || el.getAttribute('data-field');
      if (key) fields[key] = el.value;
    });
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
  const cryptoQuery = useCryptoWallets();
  const pricesQuery = useMarketPrices();
  useTransactions({ limit: 5 });

  // Mutations — all hooks must be called unconditionally
  const transfer = useEwalletTransfer();
  const swap = useCryptoSwap();
  const cryptoSend = useCryptoSend();
  const cryptoOtp = useCryptoSendOtp();
  const cardOrder = useCardOrder();
  const cardLoad = useCardLoad();
  const cardLock = useCardLock();
  const cardUnlock = useCardUnlock();
  const cardOtp = useCardSendOtp();
  const addBene = useAddBeneficiary();
  const delBene = useDeleteBeneficiary();
  const completeReg = useCompleteRegistration();

  const payload = useMemo(
    () => buildSlots(me?.user, me?.wallets, cryptoQuery.data, pricesQuery.data),
    [me, cryptoQuery.data, pricesQuery.data],
  );

  // Per-route form handler dispatch
  const getHandler = useCallback((): FormHandler | undefined => {
    const path = location.pathname;

    const handlers: Record<string, FormHandler> = {
      "/e-wallet/transfer": async (f: FormPayload) => {
        const amount = parseFloat(f.amount || "0");
        if (!(amount > 0)) return { error: "Invalid amount" };
        const recipient = f.recipient || f.email || f.to || "";
        await transfer.mutateAsync({
          toEmail: recipient.includes("@") ? recipient : undefined,
          toPhone: recipient.includes("@") ? undefined : recipient,
          amount,
          description: f.description,
        });
        return { success: true, navigateTo: "/e-wallet" };
      },

      "/crypto/buy": async (f: FormPayload) => {
        await cryptoOtp.mutateAsync();
        return { success: true };
      },
      "/crypto/swap": async (f: FormPayload) => {
        const amount = parseFloat(f.amount || f.fromAmount || "0");
        const toCurrency = (f.toCurrency || f.to || "").toUpperCase();
        const toAddress = f.toAddress || "";
        const otp = f.otp || f.code || "";
        if (!(amount > 0) || !toCurrency || !toAddress || !otp) return { error: "Missing fields" };
        await swap.mutateAsync({ amount, toCurrency, toAddress, otp });
        return { success: true, navigateTo: "/crypto" };
      },
      "/crypto/withdraw": async (f: FormPayload) => {
        const amount = parseFloat(f.amount || "0");
        const token = (f.token || f.asset || "").toUpperCase();
        const toAddress = f.toAddress || f.address || "";
        const otp = f.otp || f.code || "";
        if (!(amount > 0) || !token || !toAddress || !otp) return { error: "Missing fields" };
        await cryptoSend.mutateAsync({ token, amount, toAddress, otp });
        return { success: true, navigateTo: "/crypto" };
      },

      "/cards/order": async (f: FormPayload) => {
        const cardType = f.cardType || "virtual_card";
        const walletType = f.walletType || f.source || "ewallet";
        const otp = f.otp || f.code || "";
        if (!otp) {
          await cardOtp.mutateAsync({ type: "order", walletType });
          return { success: true };
        }
        await cardOrder.mutateAsync({ cardType, walletType, otp });
        return { success: true, navigateTo: "/cards" };
      },
      "/cards/load": async (f: FormPayload) => {
        const cardId = f.cardId || "";
        const amount = parseFloat(f.amount || "0");
        const walletType = f.walletType || f.source || "ewallet";
        const otp = f.otp || f.code || "";
        if (!cardId || !(amount > 0) || !otp) return { error: "Missing fields" };
        await cardLoad.mutateAsync({ cardId, amount, walletType, otp });
        return { success: true, navigateTo: "/cards" };
      },
      "/cards/lock": async (f: FormPayload) => {
        const cardId = f.cardId || "";
        if (!cardId) return { error: "Missing cardId" };
        await cardLock.mutateAsync({ cardId, reason: f.reason });
        return { success: true, navigateTo: "/cards" };
      },
      "/cards/activate": async (f: FormPayload) => {
        const cardId = f.cardId || "";
        if (!cardId) return { error: "Missing cardId" };
        await cardUnlock.mutateAsync({ cardId });
        return { success: true, navigateTo: "/cards" };
      },

      "/e-wallet/beneficiaries/add": async (f: FormPayload) => {
        if (!f.fullName || !f.bankName || !f.accountNumber || !f.country) return { error: "Missing fields" };
        await addBene.mutateAsync({
          fullName: f.fullName, bankName: f.bankName, accountNumber: f.accountNumber,
          swiftBic: f.swiftBic, currency: f.currency || "USD",
          country: f.country.toUpperCase(), nickname: f.nickname,
        });
        return { success: true, navigateTo: "/e-wallet/beneficiaries" };
      },
      "/e-wallet/beneficiaries/delete": async (f: FormPayload) => {
        if (!f.id) return { error: "Missing id" };
        await delBene.mutateAsync(f.id);
        return { success: true, navigateTo: "/e-wallet/beneficiaries" };
      },

      "/register/complete": async (f: FormPayload) => {
        if (!f.firstName || !f.lastName || !f.dateOfBirth || !f.phoneNumber || !f.addressLine1) {
          return { error: "Missing fields" };
        }
        await completeReg.mutateAsync({
          firstName: f.firstName, lastName: f.lastName,
          dateOfBirth: f.dateOfBirth, phoneNumber: f.phoneNumber,
          languageCode: f.languageCode || "en",
          address: {
            addressLine1: f.addressLine1, addressLine2: f.addressLine2,
            city: f.city || "", subdivision: f.subdivision || f.state || "",
            postalCode: f.postalCode || f.zip || "",
            country: (f.country || "US").toUpperCase().slice(0, 2),
          },
        });
        return { success: true, navigateTo: "/dashboard" };
      },
    };

    return handlers[path];
  }, [
    location.pathname, transfer, swap, cryptoSend, cryptoOtp,
    cardOrder, cardLoad, cardLock, cardUnlock, cardOtp,
    addBene, delBene, completeReg,
  ]);

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
        const handler = getHandler();
        if (!handler) {
          console.warn("[stitch] form submit — no handler for", location.pathname, e.data);
          return;
        }
        Promise.resolve(handler(e.data.fields || {}))
          .then((r) => {
            if (r.navigateTo) navigate(r.navigateTo);
            if (r.error) console.warn("[stitch] form error:", r.error);
          })
          .catch((err) => console.error("[stitch] form handler threw", err));
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate, location.pathname, getHandler]);

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
