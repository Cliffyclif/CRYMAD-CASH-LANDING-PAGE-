import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useMe } from "./lib/hooks";
import { PhoneShell } from "./PhoneShell";
import { StitchScreen } from "./StitchScreen";
import { stitchRoutes, routeByPath } from "./routes.generated";
import { LoginScreen } from "./screens/LoginScreen";
import { RegisterScreen } from "./screens/RegisterScreen";
const REACT_ROUTES = new Set(["/login", "/register"]);
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
        return (_jsx("div", { className: "flex h-full items-center justify-center", children: _jsx("div", { className: "font-mono text-[10px] uppercase tracking-[0.2em] text-primary", children: "Loading" }) }));
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
    return (_jsx(PhoneShell, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginScreen, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterScreen, {}) }), stitchRoutes
                    .filter((r) => !REACT_ROUTES.has(r.route))
                    .map((r) => (_jsx(Route, { path: r.route, element: _jsx(AuthGuard, { children: _jsx(StitchRouteRenderer, {}) }) }, r.route))), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/dashboard", replace: true }) })] }) }));
}
