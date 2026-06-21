import React, { useEffect, useRef, useState } from "react";
import { subscribeMutating } from "../api/httpLoader";

// Global blocking spinner shown while a create/update/delete request is in
// flight. Covers storefront and admin alike (every CRUD call goes through the
// shared axios instance). Shown after ~250ms so fast operations don't flash;
// the idle edge is debounced in httpLoader so looped bulk ops stay covered.
const BusyOverlay = () => {
  const [show, setShow] = useState(false);
  const timer = useRef(null);

  useEffect(
    () =>
      subscribeMutating((busy) => {
        clearTimeout(timer.current);
        if (busy) timer.current = setTimeout(() => setShow(true), 250);
        else setShow(false);
      }),
    []
  );
  useEffect(() => () => clearTimeout(timer.current), []);

  if (!show) return null;
  return (
    <div className="busy-overlay" role="status" aria-live="polite" aria-label="Working…">
      <div className="busy-box">
        <div className="busy-spinner" />
      </div>
    </div>
  );
};

export default BusyOverlay;
