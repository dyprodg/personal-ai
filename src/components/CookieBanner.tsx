"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted consent
    const consentGiven = localStorage.getItem("groqChatConsent");
    if (!consentGiven) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("groqChatConsent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "80%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "90%",
        maxWidth: "500px",
        backgroundColor: "white",
        zIndex: 99999,
        boxShadow: "0 0 0 100vmax rgba(0,0,0,0.5)",
        borderRadius: "8px",
        padding: "20px",
      }}
    >
      <h3
        style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "12px" }}
      >
        Important Notice
      </h3>
      <p style={{ fontSize: "14px", marginBottom: "16px" }}>
        This website does not use cookies. We only store chats in normal mode
        and basic usage data. See our{" "}
        <Link
          href="/privacy-policy"
          style={{ color: "blue", textDecoration: "underline" }}
        >
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link
          href="/terms"
          style={{ color: "blue", textDecoration: "underline" }}
        >
          Terms of Service
        </Link>{" "}
        for more information.
      </p>
      <button
        onClick={acceptCookies}
        style={{
          backgroundColor: "blue",
          color: "white",
          padding: "10px 16px",
          borderRadius: "4px",
          fontSize: "14px",
          fontWeight: "500",
          width: "100%",
          cursor: "pointer",
          border: "none",
        }}
      >
        I understand
      </button>
    </div>
  );
}
