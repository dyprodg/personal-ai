"use client";

import { useState, useEffect } from "react";
import MobileNavbar from "./MobileNavbar";
import DesktopNavbar from "./DesktopNavbar";

export default function Navbar() {
  const [isMobile, setIsMobile] = useState(false);

  // Initialize with correct value on mount and update on resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint is 768px
    };

    // Initial check
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <header className="border-b bg-white">
      {isMobile ? <MobileNavbar /> : <DesktopNavbar />}
    </header>
  );
}
