"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSessionStore } from "@/stores/SessionStore";

type Role = "admin" | "user" | "borrower";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  allow?: Role[];
}

const ProtectedRoute = ({
  children,
  redirectTo = "/auth/SignIn",
  allow,
}: ProtectedRouteProps) => {
  const router = useRouter();
  const user = useSessionStore((state) => state.user);
  const hasHydrated = useSessionStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated && (!user || !user.email)) {
      console.log("redirectTo called");
      router.replace(redirectTo);
      return;
    }

    if (allow && allow.length > 0 && user) {
      const role: Role = user.isAdmin
        ? "admin"
        : user.isBorrower
        ? "borrower"
        : "user";

      if (!allow.includes(role)) {
        // Borrowers trying to access agent pages → back to sign in
        router.replace(redirectTo);
      }
    }
  }, [hasHydrated, user, allow, redirectTo, router]);

  if (!hasHydrated) {
    return <div></div>;
  }
  if (!user || !user.email) return null;

  // Block borrowers from rendering agent page content even momentarily
  if (allow && allow.length > 0) {
    const role: Role = user.isAdmin
      ? "admin"
      : user.isBorrower
      ? "borrower"
      : "user";
    if (!allow.includes(role)) return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

