import { useEffect, useState } from 'react';

export type ConsentValue = 'accepted' | 'rejected' | null;
const KEY = 'panoramas_consent';
const EVT = 'panoramas-consent-change';

export const getConsent = (): ConsentValue => {
  const v = localStorage.getItem(KEY);
  return v === 'accepted' || v === 'rejected' ? v : null;
};

export const setConsent = (v: Exclude<ConsentValue, null>) => {
  localStorage.setItem(KEY, v);
  window.dispatchEvent(new Event(EVT));
};

export const useConsent = () => {
  const [consent, set] = useState<ConsentValue>(getConsent);
  useEffect(() => {
    const h = () => set(getConsent());
    window.addEventListener(EVT, h);
    return () => window.removeEventListener(EVT, h);
  }, []);
  return { consent, accept: () => setConsent('accepted'), reject: () => setConsent('rejected') };
};

const COMUNA_KEY = 'panoramas_comuna';
const COMUNA_EVT = 'panoramas-comuna-change';

export const useSelectedComuna = () => {
  const [comuna, set] = useState<string | null>(() => localStorage.getItem(COMUNA_KEY));
  useEffect(() => {
    const h = () => set(localStorage.getItem(COMUNA_KEY));
    window.addEventListener(COMUNA_EVT, h);
    return () => window.removeEventListener(COMUNA_EVT, h);
  }, []);
  const setComuna = (c: string | null) => {
    if (c) localStorage.setItem(COMUNA_KEY, c); else localStorage.removeItem(COMUNA_KEY);
    window.dispatchEvent(new Event(COMUNA_EVT));
  };
  return { comuna, setComuna };
};
