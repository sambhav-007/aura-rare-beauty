import React, { useEffect, useRef, useState } from "react";
import useInView from "./useInView";

// Believable-but-illustrative social-proof figures for the storefront.
const STATS = [
  { to: 20, suffix: "+", label: "Distributors" },
  { to: 10380, suffix: "+", label: "Happy Customers" },
  { to: 97, suffix: "%", label: "5-Star Reviews" },
];

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// Counts from 0 → `to` once `start` flips true; eases out for a polished feel.
const CountUp = ({ to, duration = 1700, start }) => {
  const [val, setVal] = useState(0);
  const raf = useRef();

  useEffect(() => {
    if (!start) return undefined;
    let t0 = null;
    const tick = (t) => {
      if (t0 === null) t0 = t;
      const p = Math.min((t - t0) / duration, 1);
      setVal(to * easeOutCubic(p));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [start, to, duration]);

  return <>{Math.round(val).toLocaleString("en-IN")}</>;
};

const TrustStats = () => {
  // Trigger only once the band scrolls into the middle band of the viewport,
  // so the count-up runs on scroll-down — not while it's still parked just
  // below the hero on first load.
  const [ref, inView] = useInView("-40% 0px -40% 0px");

  return (
    <div className="trust-band" ref={ref}>
      <div
        className="trust-card"
        style={{
          // Stay hidden until the band is scrolled into view, so the starting
          // "0" figures never flash on screen before the count-up runs.
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(24px)",
          transition:
            "opacity 0.7s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {STATS.map((s, i) => (
          <div className="trust-stat" key={s.label}>
            <div className="trust-num">
              <CountUp to={s.to} start={inView} duration={1600 + i * 200} />
              <span className="trust-suffix">{s.suffix}</span>
            </div>
            <div className="trust-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustStats;
