"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function AuthRedirect({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // If user is already logged in, redirect to dashboard
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Show nothing while checking auth state or if user is logged in
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0d0d0d] min-h-screen w-full flex items-center justify-center transition-colors duration-300">
        <p className="text-[#1a1a1a] dark:text-white text-[16px] font-medium font-sans transition-colors duration-300">
          Loading...
        </p>
      </div>
    );
  }

  // Don't render children if user is already authenticated (will redirect)
  if (user) {
    return null;
  }

  return <>{children}</>;
}

