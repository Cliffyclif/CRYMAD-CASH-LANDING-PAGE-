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

function isPublic(path: string) {
  for (const p of PUBLIC_ROUTES) if (path === p || path.startsWith(p + "/")) return true;
  return false;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const me = useMe();
  const location = useLocation();

  if (isPublic(location.pathname)) return <>{children}</>;

  if (me.isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
          <span className="pulse-dot mr-2 inline-block align-middle" />
          Loading
        </div>
      </div>
    );
  }

  if (!me.data?.authenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function StitchRouteRenderer() {
  const location = useLocation();
  const route = routeByPath.get(location.pathname);
  if (!route) return <Navigate to="/dashboard" replace />;
  return <StitchScreen src={route.src} title={route.title} />;
}

export function App() {
  return (
    <>
      <LivingBackground />
      <Routes>
        {/* Hand-built React pages with live auth wiring */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* All remaining stitch routes rendered via iframe */}
        {stitchRoutes
          .filter((r) => !REACT_ROUTES.has(r.route))
          .map((r) => (
            <Route
              key={r.route}
              path={r.route}
              element={
                <AuthGuard>
                  <StitchRouteRenderer />
                </AuthGuard>
              }
            />
          ))}

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
