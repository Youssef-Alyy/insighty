"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

interface LanguageSwitcherProps {
  onLanguageChange: (language: "en" | "ar") => void;
}

export function LanguageSwitcher({ onLanguageChange }: LanguageSwitcherProps) {
  const [language, setLanguage] = React.useState<"en" | "ar">("en");

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "ar" : "en";
    setLanguage(newLanguage);
    onLanguageChange(newLanguage);
    document.documentElement.lang = newLanguage;
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="w-full px-4 text-white"
    >
      {language === "en" ? "عربي" : "English"}
      <span className="sr-only">
        {language === "en" ? "Switch to Arabic" : "Switch to English"}
      </span>
    </Button>
  );
}
