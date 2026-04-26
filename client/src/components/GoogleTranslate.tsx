"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";

export function GoogleTranslate() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const addScript = document.createElement("script");
    addScript.setAttribute(
      "src",
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    );
    document.body.appendChild(addScript);

    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi,te,ta,kn,ml,bn,gu,pa,mr,or,ur,as,ne,sd,gom,ks,mni,mai,sa",
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element"
      );
      setIsReady(true);
    };

    return () => {
      document.body.removeChild(addScript);
      delete (window as any).googleTranslateElementInit;
    };
  }, []);

  return (
    <div className="relative z-50 group flex items-center">
      <div className="flex items-center gap-2 glass hover:bg-white/10 transition-all rounded-xl px-3 h-10 overflow-hidden cursor-pointer shadow-sm border border-white/20">
        <Languages className="h-4 w-4 text-white group-hover:text-primary transition-colors" />
        <div id="google_translate_element" className="flex items-center scale-90 translate-y-[-2px] origin-left"></div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .goog-te-gadget-simple {
          background-color: transparent !important;
          border: none !important;
          font-size: 14px !important;
          font-family: inherit !important;
          color: white !important;
          line-height: 1 !important;
          padding: 0 !important;
        }
        .goog-te-gadget-simple span {
          color: #fff !important;
        }
        .goog-te-gadget-icon {
          display: none !important;
        }
        body {
          top: 0 !important;
        }
        .skiptranslate iframe,
        .goog-te-banner-frame {
          display: none !important;
        }
        .VIpgJd-ZVi9od-ORHb-OEVmcd {
          display: none !important;
        }
        
        /* Dropdown styling */
        .goog-te-menu-value {
          margin: 0 !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
          font-weight: 700 !important;
          font-size: 10px !important;
        }
        .goog-te-menu-value span {
          color: var(--primary) !important;
        }
        .goog-te-menu-value span:nth-child(5) {
          /* Hide the dropdown arrow */
          display:none !important;
        }
        .goog-te-menu-value span:nth-child(3) {
          /* Hide the pipe separator */
          display:none !important;
        }
      `}} />
    </div>
  );
}
