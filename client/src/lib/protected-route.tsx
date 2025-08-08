import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  // TEMPORARY: Skip facility selection check during development
  // (Remove this bypass when deploying to production)
  return <Route path={path} component={Component} />;
}

export function AdminProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  // Check for admin access - support both property formats
  // and explicitly allow 'admin' username
  const hasAdminAccess = 
    user.isAdmin === true || 
    (user as any).is_admin === true || // Use type assertion to avoid TypeScript error 
    user.username === 'admin';

  if (!hasAdminAccess) {
    console.log("Admin access denied for user:", user);
    return (
      <Route path={path}>
        <Redirect to="/facility-selection" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
