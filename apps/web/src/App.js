import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LivingBackground } from "@crymad/ui";
import { StitchScreen } from "./StitchScreen";
import { stitchRoutes, routeByPath } from "./routes.generated";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { useMe } from "./lib/hooks";
/** Routes handled by hand-built React components (live auth wiring). */
const REACT_ROUTES = new Set(["/login", "/register"]);
/** Routes accessible without authentication. */
const PUBLIC_ROUTES = new Set(["/login", "/register", "/forgot-password"]);
function isPublic(path) {
    for (const p of PUBLIC_ROUTES)
        if (path === p || path.startsWith(p + "/"))
            return true;
    return false;
}
function AuthGuard({ children }) {
    const me = useMe();
    const location = useLocation();
    if (isPublic(location.pathname))
        return _jsx(_Fragment, { children: children });
    if (me.isLoading) {
        return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center", children: _jsxs("div", { className: "font-mono text-[11px] uppercase tracking-[0.2em] text-primary", children: [_jsx("span", { className: "pulse-dot mr-2 inline-block align-middle" }), "Loading"] }) }));
    }
    if (!me.data?.authenticated)
        return _jsx(Navigate, { to: "/login", replace: true });
    return _jsx(_Fragment, { children: children });
}
function StitchRouteRenderer() {
    const location = useLocation();
    const route = routeByPath.get(location.pathname);
    if (!route)
        return _jsx(Navigate, { to: "/dashboard", replace: true });
    return _jsx(StitchScreen, { src: route.src, title: route.title });
}
export function App() {
    return (_jsxs(_Fragment, { children: [_jsx(LivingBackground, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), stitchRoutes
                        .filter((r) => !REACT_ROUTES.has(r.route))
                        .map((r) => (_jsx(Route, { path: r.route, element: _jsx(AuthGuard, { children: _jsx(StitchRouteRenderer, {}) }) }, r.route))), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/dashboard", replace: true }) })] })] }));
}
