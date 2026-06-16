import React from "react";
import { useSettings } from "../context/SettingsContext";

// Persistent "chat on WhatsApp" button, bottom-right on every storefront page.
// Renders nothing until a store WhatsApp number is configured in settings.
const WhatsAppFab = () => {
  const s = useSettings();
  const number = (s.whatsappNumber || "").replace(/\D/g, "");
  if (!number) return null;

  const text = encodeURIComponent(
    `Hi ${s.storeName || "Aura Rare"}! I have a question.`
  );

  return (
    <a
      href={`https://wa.me/${number}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 50,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "#25D366",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 24px -8px rgba(0,0,0,0.45)",
      }}
    >
      <svg width="30" height="30" viewBox="0 0 32 32" fill="#fff" aria-hidden="true">
        <path d="M16.001 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.6 4.46 1.73 6.4L3.2 28.8l6.57-1.72a12.74 12.74 0 0 0 6.23 1.62h.01c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.64-3.75-9.06A12.71 12.71 0 0 0 16.001 3.2Zm0 23.04h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.01 1.05 1.07-3.9-.25-.4a10.6 10.6 0 0 1-1.62-5.62c0-5.86 4.77-10.62 10.63-10.62 2.84 0 5.5 1.1 7.51 3.11a10.55 10.55 0 0 1 3.11 7.52c0 5.86-4.77 10.62-10.62 10.62Zm5.83-7.95c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.54-.71-.55l-.61-.01c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.64 0 1.55 1.14 3.06 1.3 3.27.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.16-1.52.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </a>
  );
};

export default WhatsAppFab;
