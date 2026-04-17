import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "./lib/api";
import { routeByPath } from "./routes.generated";

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
  document.querySelectorAll('form').forEach(function(f) {
    f.addEventListener('submit', function(e) { e.preventDefault(); });
  });

  function replaceText(replacements) {
    var pairs = Object.entries(replacements).filter(function(p) { return p[0] && p[1]; });
    if (pairs.length === 0) return;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var node, edits = [];
    while ((node = walker.nextNode())) {
      var txt = node.nodeValue;
      if (!txt) continue;
      var changed = txt;
      pairs.forEach(function(pair) {
        var from = pair[0], to = pair[1];
        if (changed.indexOf(from) !== -1) changed = changed.split(from).join(to);
      });
      if (changed !== txt) edits.push([node, changed]);
    }
    edits.forEach(function(e) { e[0].nodeValue = e[1]; });
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
        document.querySelectorAll('[data-slot=\"' + entry[0] + '\"]').forEach(function(el) { el.textContent = String(entry[1]); });
      });
    }
    if (e.data.replacements) replaceText(e.data.replacements);
  });

  parent.postMessage({ type: 'stitch-ready' }, '*');
})();
`;

interface PersonalizationPayload {
  slots: Record<string, string>;
  replacements: Record<string, string>;
}

export function StitchScreen({ src, title }: StitchScreenProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  const meQuery = useQuery({
    queryKey: ["me", "slots"],
    queryFn: () => api<PersonalizationPayload>("/me/slots"),
    staleTime: 60_000,
  });

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  useEffect(() => {
    document.title = `${title} — CRYMAD CA$H Mobile`;
  }, [title]);

  useEffect(() => {
    if (!loaded) return;
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow || !meQuery.data) return;
    iframe.contentWindow.postMessage(
      {
        type: "stitch-data",
        slots: meQuery.data.slots,
        replacements: meQuery.data.replacements,
      },
      "*",
    );
  }, [loaded, meQuery.data]);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === "stitch-navigate" && typeof e.data.href === "string") {
        const target = e.data.href;
        if (routeByPath.has(target)) navigate(target);
        else if (target !== location.pathname) navigate(target);
      } else if (e.data.type === "stitch-ready") {
        setLoaded(true);
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
