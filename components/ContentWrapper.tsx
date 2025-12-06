"use client";

import { useAuth } from "../contexts/AuthContext";
import PageTransition from "./PageTransition";

export default function ContentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return (
    <div className={user ? "mt-[36px]" : "mt-[100px]"}>
      <PageTransition>{children}</PageTransition>
    </div>
  );
}

