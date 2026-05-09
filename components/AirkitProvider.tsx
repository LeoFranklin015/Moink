"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AirService, BUILD_ENV, type AirEventListener } from "@mocanetwork/airkit";
import { getAuthToken } from "@/lib/airkit-auth";

const PARTNER_ID = process.env.NEXT_PUBLIC_PARTNER_ID!;

type AirkitState = {
  service: AirService | null;
  isInitialized: boolean;
  isLoggedIn: boolean;
  address: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const AirkitContext = createContext<AirkitState | null>(null);

export function AirkitProvider({ children }: { children: ReactNode }) {
  const [service, setService] = useState<AirService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    let s: AirService | null = null;

    (async () => {
      try {
        if (!PARTNER_ID) {
          console.warn("[airkit] NEXT_PUBLIC_PARTNER_ID is not set");
          if (alive) setIsInitialized(true);
          return;
        }
        s = new AirService({ partnerId: PARTNER_ID });
        await s.init({
          buildEnv: BUILD_ENV.SANDBOX,
          credentialNetwork: "testnet",
          enableLogging: true,
        });
        if (!alive) return;

        setService(s);
        setIsInitialized(true);
        setIsLoggedIn(s.isLoggedIn);
        if (s.isLoggedIn && s.loginResult?.abstractAccountAddress) {
          setAddress(s.loginResult.abstractAccountAddress);
        }

        const onEvent: AirEventListener = (evt) => {
          if (evt.event === "logged_in") {
            setIsLoggedIn(true);
            setAddress(evt.result.abstractAccountAddress ?? null);
          } else if (evt.event === "logged_out") {
            setIsLoggedIn(false);
            setAddress(null);
          }
        };
        s.on(onEvent);
      } catch (err) {
        console.error("[airkit] init failed:", err);
        if (alive) setIsInitialized(true);
      }
    })();

    return () => {
      alive = false;
      s?.cleanUp().catch(() => {});
    };
  }, []);

  const login = async () => {
    if (!service) return;
    const token = await getAuthToken();
    await service.login({ authToken: token });
  };

  const logout = async () => {
    if (!service) return;
    await service.logout();
  };

  return (
    <AirkitContext.Provider value={{ service, isInitialized, isLoggedIn, address, login, logout }}>
      {children}
    </AirkitContext.Provider>
  );
}

export function useAirkit(): AirkitState {
  const ctx = useContext(AirkitContext);
  if (!ctx) throw new Error("useAirkit must be used inside <AirkitProvider>");
  return ctx;
}
