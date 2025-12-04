"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isVisible, setIsVisible] = useState(true);
  const prevPathnameRef = useRef(pathname);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // On initial mount, ensure content is visible
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setDisplayChildren(children);
      setIsVisible(true);
      return;
    }

    // Only trigger transition if pathname actually changed
    if (prevPathnameRef.current !== pathname) {
      // Step 1: Fade out current content
      setIsVisible(false);
      
      // Step 2: After fade out completes, update content and fade in
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        // Small delay to ensure new content is rendered
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsVisible(true);
          });
        });
      }, 300); // Match CSS transition duration

      prevPathnameRef.current = pathname;

      return () => clearTimeout(timer);
    } else {
      // Pathname didn't change, just update children
      setDisplayChildren(children);
    }
  }, [pathname, children]);

  return (
    <div
      className={`page-transition ${
        isVisible ? "page-transition-visible" : "page-transition-hidden"
      }`}
    >
      {displayChildren}
    </div>
  );
}
