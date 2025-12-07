"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Don't render children if user is not authenticated
  // Show nothing while checking auth state (loading) - let Dashboard handle its own loading animation
  if (loading || !user) {
    return null;
  }

  return <>{children}</>;
}

