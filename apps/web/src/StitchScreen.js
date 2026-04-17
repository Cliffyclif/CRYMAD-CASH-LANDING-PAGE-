import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "./lib/api";
import { routeByPath } from "./routes.generated";
const NAV_INTERCEPTOR = `
(function() {
  function isInternal(href) {
    if (!href || href.startsWith('javascript:') || href.startsWith('#') || href.startsWith('mailto:')) return false;
    try {
      var url = new URL(href, location.href);
      return url.origin === location.origin;
    } catch (e) { return false; }
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
    if (r) {
      parent.postMessage({ type: 'stitch-navigate', href: r }, '*');
    } else if (url.pathname !== location.pathname) {
      parent.postMessage({ type: 'stitch-navigate-raw', href: url.pathname }, '*');
    }
  }, true);

  document.querySelectorAll('form').forEach(function(f) {
    f.addEventListener('submit', function(e) { e.preventDefault(); });
  });

  // Walk text nodes and swap common placeholder strings with real user values.
  function replaceText(replacements) {
    var pairs = Object.entries(replacements).filter(function(p) { return p[0] && p[1]; });
    if (pairs.length === 0) return;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var node;
    var edits = [];
    while ((node = walker.nextNode())) {
      var txt = node.nodeValue;
      if (!txt) continue;
      var changed = txt;
      pairs.forEach(function(pair) {
        var from = pair[0], to = pair[1];
        if (changed.indexOf(from) !== -1) {
          changed = changed.split(from).join(to);
        }
      });
      if (changed !== txt) edits.push([node, changed]);
    }
    edits.forEach(function(e) { e[0].nodeValue = e[1]; });
    // Replace attributes too: input values, alt, title, placeholder, aria-label.
    var attrs = ['value', 'alt', 'title', 'placeholder', 'aria-label'];
    document.querySelectorAll('*').forEach(function(el) {
      attrs.forEach(function(attr) {
        var v = el.getAttribute ? el.getAttribute(attr) : null;
        if (!v) return;
        var changed = v;
        pairs.forEach(function(pair) {
          if (changed.indexOf(pair[0]) !== -1) changed = changed.split(pair[0]).join(pair[1]);
        });
        if (changed !== v) el.setAttribute(attr, changed);
      });
      // Also handle input.value/textarea.value which don't always sync via setAttribute
      if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && el.value) {
        var v2 = el.value;
        var ch = v2;
        pairs.forEach(function(pair) {
          if (ch.indexOf(pair[0]) !== -1) ch = ch.split(pair[0]).join(pair[1]);
        });
        if (ch !== v2) el.value = ch;
      }
    });
  }

  window.addEventListener('message', function(e) {
    if (!e.data || e.data.type !== 'stitch-data') return;
    if (e.data.slots) {
      Object.entries(e.data.slots).forEach(function(entry) {
        document.querySelectorAll('[data-slot=\"' + entry[0] + '\"]').forEach(function(el) {
          el.textContent = String(entry[1]);
        });
      });
    }
    if (e.data.replacements) {
      replaceText(e.data.replacements);
    }
  });

  parent.postMessage({ type: 'stitch-ready' }, '*');
})();
`;
export function StitchScreen({ src, title }) {
    const navigate = useNavigate();
    const location = useLocation();
    const iframeRef = useRef(null);
    const [loaded, setLoaded] = useState(false);
    // Global personalization — fetch once, push into every iframe.
    const meQuery = useQuery({
        queryKey: ["me", "slots"],
        queryFn: () => api("/me/slots"),
        staleTime: 60_000,
    });
    useEffect(() => {
        setLoaded(false);
    }, [src]);
    useEffect(() => {
        document.title = `${title} — CRYMAD CA$H`;
    }, [title]);
    useEffect(() => {
        if (!loaded)
            return;
        const iframe = iframeRef.current;
        if (!iframe?.contentWindow || !meQuery.data)
            return;
        iframe.contentWindow.postMessage({
            type: "stitch-data",
            slots: meQuery.data.slots,
            replacements: meQuery.data.replacements,
        }, "*");
    }, [loaded, meQuery.data]);
    useEffect(() => {
        function handleMessage(e) {
            if (!e.data || typeof e.data !== "object")
                return;
            if (e.data.type === "stitch-navigate" && typeof e.data.href === "string") {
                const target = e.data.href;
                if (routeByPath.has(target))
                    navigate(target);
                else if (target !== location.pathname)
                    navigate(target);
            }
            else if (e.data.type === "stitch-ready") {
                setLoaded(true);
            }
        }
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [navigate, location.pathname]);
    function onIframeLoad() {
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentDocument)
            return;
        const script = iframe.contentDocument.createElement("script");
        script.textContent = NAV_INTERCEPTOR;
        iframe.contentDocument.body.appendChild(script);
    }
    return (_jsxs(_Fragment, { children: [!loaded && (_jsx("div", { className: "fixed inset-0 z-20 flex items-center justify-center bg-bg", children: _jsxs("div", { className: "font-mono text-[11px] uppercase tracking-[0.2em] text-primary", children: [_jsx("span", { className: "pulse-dot mr-2 inline-block align-middle" }), "Loading ", title] }) })), _jsx("iframe", { ref: iframeRef, src: src, title: title, onLoad: onIframeLoad, className: "fixed inset-0 z-10 h-full w-full border-0", sandbox: "allow-same-origin allow-scripts allow-forms allow-popups" }, src)] }));
}
