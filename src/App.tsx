import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useMe } from "./lib/hooks";
import { PhoneShell } from "./PhoneShell";
import { StitchScreen } from "./StitchScreen";
import { stitchRoutes, routeByPath } from "./routes.generated";
import { LoginScreen } from "./screens/LoginScreen";
import { RegisterScreen } from "./screens/RegisterScreen";

const REACT_ROUTES = new Set(["/login", "/register"]);
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
      <div className="flex h-full items-center justify-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Loading</div>
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
    <PhoneShell>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />

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
    </PhoneShell>
  );
}
