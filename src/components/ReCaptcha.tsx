"use client";

import { useEffect } from "react";

interface ReCaptchaProps {
  onVerify: (token: string) => void;
}

export default function ReCaptcha({ onVerify }: ReCaptchaProps) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!;

  useEffect(() => {
    if (!window.grecaptcha) {
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.grecaptcha && window.grecaptcha.render) {
        clearInterval(interval);
        window.grecaptcha.render("recaptcha-container", {
          sitekey: siteKey,
          callback: (token: string) => onVerify(token),
        });
      }
    }, 500);
    return () => clearInterval(interval);
  }, [siteKey, onVerify]);

  return <div id="recaptcha-container" className="mt-2"></div>;
}
