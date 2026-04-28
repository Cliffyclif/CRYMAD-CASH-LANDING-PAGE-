import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { routeByPath } from "./routes.generated";
import {
  useMe, useTransactions, useCryptoWallets, useMarketPrices,
  useEwalletTransfer, useCryptoSwap, useCryptoSend, useCryptoSendOtp,
  useCardOrder, useCardLoad, useCardLock, useCardUnlock, useCardSendOtp,
  useAddBeneficiary, useDeleteBeneficiary, useCompleteRegistration,
  useNotifications, useBeneficiaries, usePayouts, useRecurringPayments,
  formatMoney, type User, type Wallet, type CryptoWallet, type MarketPrice,
  type Transaction,
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
  // Stitch HTMLs use href="#" pervasively — designers treated them as static
  // mocks. Map common link intents to real routes by icon + text content.
  var ICON_ROUTES = {
    arrow_back: '__BACK__',
    arrow_back_ios: '__BACK__',
    arrow_back_ios_new: '__BACK__',
    chevron_left: '__BACK__',
    close: '__BACK__',
    home: '/dashboard',
    dashboard: '/dashboard',
    grid_view: '/dashboard',
    account_balance_wallet: '/e-wallet',
    wallet: '/e-wallet',
    savings: '/e-wallet',
    credit_card: '/cards',
    cards: '/cards',
    receipt_long: '/transactions',
    receipt: '/transactions',
    history: '/transactions',
    swap_horiz: '/crypto/swap',
    swap_vert: '/crypto/swap',
    currency_exchange: '/crypto/swap',
    currency_bitcoin: '/crypto',
    toll: '/crypto',
    send: '/e-wallet/transfer',
    north_east: '/e-wallet/transfer',
    south_west: '/crypto/deposit',
    call_received: '/crypto/deposit',
    download: '/crypto/deposit',
    upload: '/crypto/withdraw',
    contactless: '/payouts/create',
    qr_code: '/crypto/deposit',
    qr_code_2: '/crypto/deposit',
    qr_code_scanner: '/payouts/create',
    call_split: '/payouts',
    payments: '/payouts/create',
    redeem: '/rewards',
    card_giftcard: '/rewards',
    storefront: '/orders',
    shopping_bag: '/orders',
    event_repeat: '/recurring-payments',
    subscriptions: '/subscriptions',
    loyalty: '/rewards',
    group: '/team',
    people: '/team',
    account_circle: '/profile',
    person: '/profile',
    settings: '/profile',
    help: '/help',
    help_outline: '/help',
    support: '/help',
    support_agent: '/help',
    apps: '/ecosystem',
    analytics: '/reports',
    bar_chart: '/reports',
    insights: '/reports',
    account_balance: '/banking',
    corporate_fare: '/institutional/dashboard',
    notifications: '/notifications',
    'notifications_active': '/notifications',
    'notifications_none': '/notifications',
    menu: '/profile',
    more_horiz: '/profile',
    more_vert: '/profile',
  };
  var LABEL_ROUTES = {
    BACK: '__BACK__',
    '← BACK': '__BACK__',
    HOME: '/dashboard',
    WALLETS: '/e-wallet',
    WALLET: '/e-wallet',
    'E-WALLET': '/e-wallet',
    CARDS: '/cards',
    ACTIVITY: '/transactions',
    TRANSACTIONS: '/transactions',
    NOTIFICATIONS: '/notifications',
    CRYPTO: '/crypto',
    SEND: '/e-wallet/transfer',
    RECEIVE: '/crypto/deposit',
    SWAP: '/crypto/swap',
    PAY: '/payouts/create',
    PAYOUTS: '/payouts',
    ORDERS: '/orders',
    SUBSCRIPTIONS: '/subscriptions',
    RECURRING: '/recurring-payments',
    REWARDS: '/rewards',
    REPORTS: '/reports',
    BANKING: '/banking',
    TEAM: '/team',
    HELP: '/help',
    PROFILE: '/profile',
    SETTINGS: '/profile',
    'VIEW ALL': '/transactions',
    'VIEW ALL →': '/transactions',
    MORE: '/profile',
  };
  function inferRoute(anchor) {
    // Explicit override: data-nav="/some/route" wins over everything.
    var explicit = anchor.getAttribute && (anchor.getAttribute('data-nav') || anchor.getAttribute('data-link'));
    if (explicit) return explicit;
    // Scan inner elements for data-icon + text label.
    var iconEl = anchor.querySelector ? anchor.querySelector('[data-icon]') : null;
    if (iconEl) {
      var icon = iconEl.getAttribute('data-icon');
      if (icon && ICON_ROUTES[icon]) return ICON_ROUTES[icon];
    }
    var text = (anchor.textContent || '').trim().toUpperCase();
    if (LABEL_ROUTES[text]) return LABEL_ROUTES[text];
    // Partial match: ACTIVITY may live inside "Activity" span plus icon.
    for (var key in LABEL_ROUTES) {
      if (text.indexOf(key) !== -1) return LABEL_ROUTES[key];
    }
    return null;
  }

  // Walk up from the click target to find an actionable element. Stitch designs
  // mostly use plain <div>s for action tiles, so we accept anything that has an
  // icon or a label we can map to a route.
  function findActionable(target) {
    if (!target || !target.closest) return null;
    var direct = target.closest('a, button, [role="button"], [data-nav], [data-link], .cursor-pointer, [data-action]');
    if (direct) return direct;
    // Look for the nearest ancestor that contains both a data-icon span and a
    // text label inside the same small box (typical action-tile layout).
    var node = target;
    for (var i = 0; node && i < 6; i++) {
      if (node.querySelector && node.querySelector('[data-icon]')) {
        // Avoid the entire <body> matching everything — require the box to be
        // reasonably small (a tile / nav item) by capping descendant count.
        var descCount = node.querySelectorAll('*').length;
        if (descCount > 0 && descCount < 25) return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  document.addEventListener('click', function(e) {
    var a = findActionable(e.target);
    if (!a) return;
    // Anchors with a real href that points somewhere sensible use that first.
    if (a.tagName === 'A') {
      var href = a.getAttribute('href');
      if (href && href !== '#' && isInternal(href)) {
        e.preventDefault();
        var url = new URL(href, location.href);
        var r = htmlToRoute(url.pathname);
        if (r) { parent.postMessage({ type: 'stitch-navigate', href: r }, '*'); return; }
        if (url.pathname !== location.pathname) { parent.postMessage({ type: 'stitch-navigate-raw', href: url.pathname }, '*'); return; }
      }
    }
    // Buttons or "#" anchors: infer route from icon / label. Skip data-action
    // buttons — those belong to the submit flow, not navigation.
    if (a.hasAttribute('data-action')) return;
    var inferred = inferRoute(a);
    if (inferred) {
      e.preventDefault();
      if (inferred === '__BACK__') {
        parent.postMessage({ type: 'stitch-back' }, '*');
      } else {
        parent.postMessage({ type: 'stitch-navigate', href: inferred }, '*');
      }
    }
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

  function renderList(listKey, items) {
    var containers = document.querySelectorAll('[data-slot-list="' + listKey + '"]');
    if (containers.length === 0) return;
    containers.forEach(function(container) {
      var tpl = container.querySelector('[data-slot-template]');
      var emptyEl = container.querySelector('[data-slot-empty]');
      if (!tpl) return;
      // Stash the template so repeated renders don't compound.
      if (!tpl.__stitchTpl) tpl.__stitchTpl = tpl.outerHTML;
      var list = Array.isArray(items) ? items : [];
      // Clear previous rendered children but keep template + empty state nodes hidden.
      Array.prototype.slice.call(container.children).forEach(function(child) {
        if (child === tpl || child === emptyEl) return;
        container.removeChild(child);
      });
      tpl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = list.length === 0 ? '' : 'none';
      list.forEach(function(item) {
        var wrapper = document.createElement('div');
        wrapper.innerHTML = tpl.__stitchTpl;
        var node = wrapper.firstElementChild;
        if (!node) return;
        node.removeAttribute('data-slot-template');
        node.style.display = '';
        node.querySelectorAll('[data-slot-field]').forEach(function(el) {
          var field = el.getAttribute('data-slot-field');
          if (field && item[field] != null) el.textContent = String(item[field]);
        });
        container.appendChild(node);
      });
    });
  }

  function applySparklines(sparklines) {
    Object.entries(sparklines || {}).forEach(function(entry) {
      var key = entry[0];
      var vals = Array.isArray(entry[1]) ? entry[1] : [];
      document.querySelectorAll('[data-slot-sparkline="' + key + '"]').forEach(function(poly) {
        if (vals.length < 2) {
          poly.setAttribute('points', '0,20 100,20');
          return;
        }
        var min = Math.min.apply(null, vals);
        var max = Math.max.apply(null, vals);
        var range = max - min || 1;
        var w = 100, h = 20;
        var step = vals.length === 1 ? 0 : w / (vals.length - 1);
        var pts = vals.map(function(v, i) {
          var y = h - ((v - min) / range) * h;
          return (i * step).toFixed(1) + ',' + y.toFixed(1);
        }).join(' ');
        poly.setAttribute('points', pts);
      });
    });
  }

  function applyRings(rings) {
    Object.entries(rings || {}).forEach(function(entry) {
      var key = entry[0];
      var pct = Math.max(0, Math.min(100, Number(entry[1]) || 0));
      document.querySelectorAll('[data-slot-ring="' + key + '"]').forEach(function(el) {
        var r = Number(el.getAttribute('r')) || 40;
        var circ = 2 * Math.PI * r;
        var filled = circ * (pct / 100);
        el.setAttribute('stroke-dasharray', filled.toFixed(1) + ' ' + circ.toFixed(1));
      });
    });
  }

  function applyHideIfEmpty(slots) {
    document.querySelectorAll('[data-slot-hide-if-empty]').forEach(function(el) {
      var key = el.getAttribute('data-slot-hide-if-empty');
      var v = slots && slots[key];
      if (v == null || v === '') el.style.display = 'none';
      else el.style.display = '';
    });
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
      applyHideIfEmpty(e.data.slots);
    }
    if (e.data.sparklines) applySparklines(e.data.sparklines);
    if (e.data.rings) applyRings(e.data.rings);
    if (e.data.lists) {
      Object.entries(e.data.lists).forEach(function(entry) {
        renderList(entry[0], entry[1]);
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
  spentThisWeek?: string;
  kycScoreNum?: string;
  kycScoreLabel?: string;
  kycStatusLabel?: string;
  accountType?: string;
  joinedDate?: string;
  walletCount?: string;
  todayDelta?: string;
  initials?: string;
}

function buildSlots(
  user: User | undefined,
  wallets: Wallet[] | undefined,
  cryptoWallets: CryptoWallet[] | undefined,
  prices: Record<string, MarketPrice> | undefined,
  txs: Transaction[] | undefined,
): {
  slots: StitchSlots;
  replacements: Record<string, string>;
  sparklines: Record<string, number[]>;
  rings: Record<string, number>;
} {
  const first = (user?.firstName && user.firstName !== "Pending") ? user.firstName : "";
  const last = (user?.lastName && user.lastName !== "Pending") ? user.lastName : "";
  const fullName = `${first} ${last}`.trim() || user?.email?.split("@")[0] || "";

  const safe = (n: unknown): number => {
    const v = typeof n === "number" ? n : Number(n);
    return Number.isFinite(v) ? v : 0;
  };
  const wByType = Object.fromEntries((wallets ?? []).map((w) => [w.type, w]));
  const ewalletBal = safe(wByType.ewallet?.balance);
  const cardBal = safe(wByType.card?.balance);
  const rewardsBal = safe(wByType.rewards?.balance);

  const cryptoValue = (cryptoWallets ?? []).reduce((sum, cw) => {
    const p = prices?.[cw.token];
    if (!p) return sum;
    return sum + safe(cw.balance) * safe(p.price);
  }, 0);

  const total = ewalletBal + cryptoValue + cardBal;

  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const weekAgo = now - 7 * DAY_MS;
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const startOfTodayMs = startOfToday.getTime();

  // Bucket transactions by day (last 7 days), separated by side + walletType.
  const dayBuckets: Array<{ debit: number; net: number; ewallet: number; crypto: number }> =
    Array.from({ length: 7 }, () => ({ debit: 0, net: 0, ewallet: 0, crypto: 0 }));
  let spentThisWeek = 0;
  let todayNet = 0;

  (txs ?? []).forEach((t) => {
    const dateStr = (t as { createdDate?: string }).createdDate;
    if (!dateStr) return;
    const ts = new Date(dateStr).getTime();
    if (!Number.isFinite(ts) || ts < weekAgo) return;
    const amt = safe(t.amount);
    const signed = t.side === "debit" ? -amt : amt;
    const daysAgo = Math.min(6, Math.floor((now - ts) / DAY_MS));
    const bucketIdx = 6 - daysAgo; // oldest first
    const bucket = dayBuckets[bucketIdx];
    bucket.net += signed;
    if (t.side === "debit") { bucket.debit += amt; spentThisWeek += amt; }
    if (t.walletType === "ewallet") bucket.ewallet += signed;
    if (t.walletType === "crypto") bucket.crypto += signed;
    if (ts >= startOfTodayMs) todayNet += signed;
  });

  const sparklines: Record<string, number[]> = {
    weekSpend: dayBuckets.map((b) => b.debit),
    ewalletActivity: dayBuckets.map((b) => b.ewallet),
    cryptoActivity: dayBuckets.map((b) => b.crypto),
  };

  const kycMap: Record<string, { score: number; label: string }> = {
    approved: { score: 100, label: "VERIFIED" },
    pending: { score: 50, label: "PENDING REVIEW" },
    rejected: { score: 10, label: "REJECTED" },
    not_started: { score: 0, label: "NOT STARTED" },
  };
  const kycInfo = kycMap[user?.kycStatus || "not_started"] ?? kycMap.not_started;
  const rings: Record<string, number> = { kycScore: kycInfo.score };

  const joinedIso = user?.createdAt;
  let joined = "";
  if (joinedIso) {
    try {
      joined = new Date(joinedIso).toLocaleDateString(undefined, { month: "short", year: "numeric" });
    } catch { joined = ""; }
  }

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
    spentThisWeek: formatMoney(spentThisWeek),
    kycScoreNum: String(kycInfo.score),
    kycScoreLabel: "VERIFICATION\nSTATUS",
    kycStatusLabel: kycInfo.label,
    accountType: user?.accountType === "business" ? "BUSINESS" : "PERSONAL",
    joinedDate: joined,
    walletCount: String((cryptoWallets ?? []).length),
    todayDelta: todayNet === 0 ? "" : `${todayNet >= 0 ? "+" : "-"}${formatMoney(Math.abs(todayNet))} TODAY`,
    initials: (() => {
      const a = (first || "").charAt(0).toUpperCase();
      const b = (last || "").charAt(0).toUpperCase();
      const ini = `${a}${b}`.trim();
      return ini || (user?.email?.charAt(0).toUpperCase() ?? "");
    })(),
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

  return { slots, replacements, sparklines, rings };
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
  const txQuery = useTransactions({ limit: 20 });
  const notifQuery = useNotifications();
  const beneQuery = useBeneficiaries();
  const payoutsQuery = usePayouts();
  const recurringQuery = useRecurringPayments();

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

  const txList = (txQuery.data as { transactions?: Transaction[] } | undefined)?.transactions;
  const payload = useMemo(
    () => buildSlots(me?.user, me?.wallets, cryptoQuery.data, pricesQuery.data, txList),
    [me, cryptoQuery.data, pricesQuery.data, txList],
  );

  // Lists piped into the iframe for any screen that uses [data-slot-list]
  // containers — templates are cloned per item, fields filled via [data-slot-field].
  const lists = useMemo(() => {
    const txs = (txQuery.data as { transactions?: Transaction[] } | undefined)?.transactions ?? [];
    const notifs = (notifQuery.data as { notifications?: Array<Record<string, unknown>> } | undefined)?.notifications ?? [];
    const bene = (beneQuery.data as { beneficiaries?: Array<Record<string, unknown>> } | undefined)?.beneficiaries ?? [];
    const payouts = (payoutsQuery.data as { transactions?: Array<Record<string, unknown>> } | undefined)?.transactions ?? [];
    const recurring = (recurringQuery.data as { payments?: Array<Record<string, unknown>> } | undefined)?.payments ?? [];

    const fmtDate = (iso?: string) => {
      if (!iso) return "";
      try { return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" }); }
      catch { return ""; }
    };

    const cryptoW = cryptoQuery.data ?? [];
    const prices = pricesQuery.data ?? {};

    return {
      transactions: txs.map((t) => ({
        id: t.id,
        type: t.type,
        amount: formatMoney(t.amount, t.currency || "USD"),
        status: t.status,
        currency: t.currency || "USD",
        date: fmtDate((t as { createdDate?: string }).createdDate),
        walletType: t.walletType || "",
        side: t.side || "",
      })),
      cryptoWallets: cryptoW.map((w) => {
        const token = w.token || "";
        const bal = typeof w.balance === "number" && Number.isFinite(w.balance) ? w.balance : 0;
        const p = token ? prices[token] : undefined;
        const usd = p ? bal * (typeof p.price === "number" ? p.price : 0) : 0;
        const change = p && typeof p.change24h === "number" ? p.change24h : 0;
        return {
          token,
          symbol: token,
          balance: bal.toLocaleString(undefined, { maximumFractionDigits: 8 }),
          usdValue: formatMoney(usd),
          address: w.address || "",
          network: w.network || token,
          price: p && typeof p.price === "number" ? formatMoney(p.price) : "",
          change24h: p ? `${change >= 0 ? "+" : ""}${change.toFixed(2)}%` : "",
        };
      }),
      marketPrices: Object.values(prices).map((p) => {
        const change = typeof p.change24h === "number" ? p.change24h : 0;
        return {
          symbol: p.symbol || "",
          name: p.name || "",
          price: typeof p.price === "number" ? formatMoney(p.price) : "",
          change24h: `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`,
        };
      }),
      notifications: notifs.map((n) => ({
        id: String(n.id || ""),
        title: String(n.title || ""),
        body: String(n.body || ""),
        kind: String(n.kind || ""),
        date: fmtDate(n.createdAt as string),
        unread: n.readAt ? "" : "•",
      })),
      beneficiaries: bene.map((b) => ({
        id: String(b.id || ""),
        fullName: String(b.fullName || ""),
        bankName: String(b.bankName || ""),
        accountNumberMasked: String(b.accountNumberMasked || ""),
        currency: String(b.currency || "USD"),
        country: String(b.country || ""),
      })),
      payouts: payouts.map((p) => ({
        id: String(p.id || ""),
        amount: formatMoney(Number(p.amount || 0), String(p.currency || "USD")),
        status: String(p.status || ""),
        date: fmtDate(p.createdDate as string),
      })),
      "recurring-payments": recurring.map((r) => ({
        id: String(r.id || ""),
        amount: formatMoney(Number(r.amount || 0), String(r.currency || "USD")),
        status: String(r.status || ""),
        interval: String(r.interval || ""),
        nextRun: fmtDate(r.nextRunAt as string),
      })),
    };
  }, [txQuery.data, notifQuery.data, beneQuery.data, payoutsQuery.data, recurringQuery.data]);

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
      {
        type: "stitch-data",
        slots: payload.slots,
        replacements: payload.replacements,
        sparklines: payload.sparklines,
        rings: payload.rings,
        lists,
      },
      "*",
    );
  }, [loaded, payload, lists]);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === "stitch-navigate" && typeof e.data.href === "string") {
        const target = e.data.href;
        if (routeByPath.has(target) || target !== location.pathname) navigate(target);
      } else if (e.data.type === "stitch-navigate-raw" && typeof e.data.href === "string") {
        navigate(e.data.href);
      } else if (e.data.type === "stitch-back") {
        navigate(-1);
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
