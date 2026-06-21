import axios from "axios";

// Global request tracker: counts in-flight axios calls and notifies listeners.
// Registered once (imported in index.js) so every request/response — storefront
// and admin — drives the top progress bar automatically.
let pending = 0;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn(pending > 0));

export const subscribeLoading = (fn) => {
  listeners.add(fn);
  fn(pending > 0);
  return () => listeners.delete(fn);
};

const inc = () => {
  pending += 1;
  emit();
};
const dec = () => {
  pending = Math.max(0, pending - 1);
  emit();
};

// Separate tracker for *mutating* requests (create/update/delete) so a blocking
// spinner overlay can show only while a CRUD operation is actually in flight.
//
// The "idle" edge is debounced: when the in-flight count hits 0 we wait briefly
// before announcing idle. A bulk operation that loops one request at a time
// (e.g. delete N shades sequentially) therefore reads as ONE continuous busy
// period instead of flickering true/false between each request.
const IDLE_DEBOUNCE = 150;
let mutating = 0;
let mutEmitted = false;
let mutIdleTimer = null;
const mListeners = new Set();
const notifyM = (v) => mListeners.forEach((fn) => fn(v));

export const subscribeMutating = (fn) => {
  mListeners.add(fn);
  fn(mutEmitted);
  return () => mListeners.delete(fn);
};

const refreshM = () => {
  if (mutating > 0) {
    if (mutIdleTimer) {
      clearTimeout(mutIdleTimer);
      mutIdleTimer = null;
    }
    if (!mutEmitted) {
      mutEmitted = true;
      notifyM(true);
    }
  } else if (mutEmitted && !mutIdleTimer) {
    mutIdleTimer = setTimeout(() => {
      mutIdleTimer = null;
      if (mutating === 0) {
        mutEmitted = false;
        notifyM(false);
      }
    }, IDLE_DEBOUNCE);
  }
};

const isMutation = (config) =>
  !!config && !!config.method && config.method.toLowerCase() !== "get";
const incM = (config) => {
  if (isMutation(config)) {
    mutating += 1;
    refreshM();
  }
};
const decM = (config) => {
  if (isMutation(config)) {
    mutating = Math.max(0, mutating - 1);
    refreshM();
  }
};

axios.interceptors.request.use(
  (config) => {
    inc();
    incM(config);
    return config;
  },
  (error) => {
    dec();
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    dec();
    decM(response.config);
    return response;
  },
  (error) => {
    dec();
    decM(error.config);
    return Promise.reject(error);
  }
);
