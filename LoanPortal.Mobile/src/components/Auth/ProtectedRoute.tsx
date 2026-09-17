"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSessionStore } from "@/stores/SessionStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute = ({ children, redirectTo = "/auth/SignIn" }: ProtectedRouteProps) => {
  const router = useRouter();
  const user = useSessionStore((state) => state.user);
  const hasHydrated = useSessionStore((state) => state.hasHydrated);

  useEffect(() => {   
    if (hasHydrated && (!user || !user.email)) {
      router.replace(redirectTo);
    }
  }, [hasHydrated, user, redirectTo, router]);

  if (!hasHydrated) return null; // or a <LoadingSpinner />
  if (!user || !user.email) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
