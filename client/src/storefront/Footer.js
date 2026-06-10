import React from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import Logo from "./Logo";

const Footer = () => {
  const s = useSettings();
  return (
    <footer className="bg-sand hairline-t mt-24">
      <div className="aura-container py-20 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <Logo height={64} fallbackName={s.storeName || "Aura Rare"} className="mb-4" />
          <p className="text-muted text-sm leading-relaxed max-w-xs">
            {s.aboutUs
              ? s.aboutUs.slice(0, 140)
              : "Premium cosmetics, thoughtfully made."}
          </p>
        </div>

        <div className="text-sm">
          <div className="eyebrow mb-4">Contact</div>
          {s.address && <p className="mb-1">{s.address}</p>}
          {s.contactPhone && <p className="mb-1">{s.contactPhone}</p>}
          {s.contactEmail && <p className="mb-1">{s.contactEmail}</p>}
        </div>

        <div className="text-sm">
          <div className="eyebrow mb-4">Follow</div>
          <div className="flex space-x-4">
            {s.instagramUrl && (
              <a href={s.instagramUrl} target="_blank" rel="noopener noreferrer" className="nav-link">
                Instagram
              </a>
            )}
            {s.facebookUrl && (
              <a href={s.facebookUrl} target="_blank" rel="noopener noreferrer" className="nav-link">
                Facebook
              </a>
            )}
          </div>
          <Link to="/cart" className="nav-link block mt-4">Cart</Link>
        </div>
      </div>
      <div className="hairline-t">
        <div className="aura-container py-5 text-xs text-muted flex justify-between">
          <span>© {new Date().getFullYear()} {s.storeName || "Aura Rare"}</span>
          <span>Order via WhatsApp</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
