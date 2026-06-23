import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "./Logo";

// First-visit intro curtain: a cream overlay with the logo + a gold rule,
// then the panel lifts away to reveal the site. Shown once per browser
// session, skipped on /admin and for users who prefer reduced motion.
const SESSION_KEY = "aura_intro_seen";

const shouldPlay = () => {
  if (typeof window === "undefined") return false;
  if (window.location.pathname.startsWith("/admin")) return false;
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return false;
  } catch (e) {
    /* private mode / storage blocked — just play once */
  }
  const mq =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mq && mq.matches) return false;
  return true;
};

const Preloader = () => {
  const [show, setShow] = useState(shouldPlay);

  useEffect(() => {
    if (!show) return undefined;
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch (e) {
      /* ignore */
    }
    // Lock scroll while the curtain is up.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => setShow(false), 1900);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="preloader"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden="true"
        >
          <motion.div
            className="preloader-inner"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            <div className="preloader-logo">
              <Logo height={88} fallbackName="Aura Rare" />
            </div>
            <motion.div
              className="preloader-rule"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 120, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
            />
            <motion.div
              className="preloader-tag"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.95 }}
            >
              Rare by Nature
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
