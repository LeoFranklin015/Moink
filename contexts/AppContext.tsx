"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  AirService,
  BUILD_ENV,
  type AirEventListener,
  type BUILD_ENV_TYPE,
} from "@mocanetwork/airkit";
import {
  getEnvironmentConfig,
  type EnvironmentConfig,
} from "../config/environment";

// Get partner IDs from environment variables
const ISSUER_PARTNER_ID =
  process.env.NEXT_PUBLIC_ISSUER_PARTNER_ID ||
  "ee8360b4-e5b9-43d9-8126-cdc6ff6b78a8";
const VERIFIER_PARTNER_ID =
  process.env.NEXT_PUBLIC_VERIFIER_PARTNER_ID ||
  "ee8360b4-e5b9-43d9-8126-cdc6ff6b78a8";
const enableLogging = true;

export const ENV_OPTIONS = [
  { label: "Staging", value: BUILD_ENV.STAGING },
  { label: "Sandbox", value: BUILD_ENV.SANDBOX },
];

interface AppContextType {
  // AirService state
  airService: AirService | null;
  isInitialized: boolean;
  isLoading: boolean;
  isLoggedIn: boolean;
  userAddress: string | null;
  currentEnv: BUILD_ENV_TYPE;
  partnerId: string;
  environmentConfig: EnvironmentConfig;

  // Actions
  setCurrentEnv: (env: BUILD_ENV_TYPE) => void;
  setPartnerId: (partnerId: string) => void;
  handleLogin: () => Promise<void>;
  handleLogout: () => Promise<void>;

  // Helper functions
  getDefaultPartnerId: (pathname: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [airService, setAirService] = useState<AirService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [currentEnv, setCurrentEnv] = useState<BUILD_ENV_TYPE>(
    BUILD_ENV.SANDBOX
  );
  const [partnerId, setPartnerId] = useState<string>(ISSUER_PARTNER_ID);

  // Get environment config based on current environment
  const environmentConfig = getEnvironmentConfig(currentEnv);

  // Function to get default partner ID based on current route
  const getDefaultPartnerId = (pathname: string): string => {
    if (pathname === "/issue") {
      return ISSUER_PARTNER_ID;
    } else if (pathname === "/verify") {
      return VERIFIER_PARTNER_ID;
    }
    return ISSUER_PARTNER_ID; // Default to issuer for root route
  };

  const initializeAirService = async (
    env: BUILD_ENV_TYPE = currentEnv,
    partnerIdToUse: string = partnerId
  ) => {
    if (!partnerIdToUse || partnerIdToUse === "your-partner-id") {
      console.warn("No valid Partner ID configured for air service");
      setIsInitialized(true); // Set to true to prevent infinite loading
      return;
    }

    try {
      const service = new AirService({ partnerId: partnerIdToUse });
      await service.init({
        buildEnv: env as (typeof BUILD_ENV)[keyof typeof BUILD_ENV],
        enableLogging,
        skipRehydration: false,
      });
      setAirService(service);
      setIsInitialized(true);
      setIsLoggedIn(service.isLoggedIn);

      if (service.isLoggedIn && service.loginResult) {
        const result = service.loginResult;
        console.log("result @ initializeAirService", result);
        if (result.abstractAccountAddress) {
          setUserAddress(result.abstractAccountAddress || null);
        } else {
          console.log("no abstractAccountAddress @ initializeAirService");
          const accounts = await service?.provider.request({
            method: "eth_accounts",
            params: [],
          });
          console.log(
            "accounts @ initializeAirService",
            accounts,
            service?.provider
          );
          setUserAddress(
            Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null
          );
        }
      }

      const eventListener: AirEventListener = async (data) => {
        if (data.event === "logged_in") {
          setIsLoggedIn(true);
          if (data.result.abstractAccountAddress) {
            setUserAddress(data.result.abstractAccountAddress || null);
          } else {
            const accounts = await service?.provider.request({
              method: "eth_accounts",
              params: [],
            });
            setUserAddress(
              Array.isArray(accounts) && accounts.length > 0
                ? accounts[0]
                : null
            );
          }
        } else if (data.event === "logged_out") {
          setIsLoggedIn(false);
          setUserAddress(null);
        }
      };
      service.on(eventListener);
    } catch (err) {
      console.error("Failed to initialize AIRKit service:", err);
      setIsInitialized(true); // Set to true to prevent infinite loading on error
    }
  };

  const handleLogin = async () => {
    if (!airService) return;
    setIsLoading(true);
    try {
      const loginResult = await airService.login();

      if (loginResult.abstractAccountAddress) {
        setUserAddress(loginResult.abstractAccountAddress || null);
      } else {
        const accounts = await airService?.provider.request({
          method: "eth_accounts",
          params: [],
        });
        setUserAddress(
          Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null
        );
      }
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!airService) return;
    try {
      await airService.logout();
      setUserAddress(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Re-initialize AIRKit when partner ID or environment changes
  useEffect(() => {
    initializeAirService(currentEnv, partnerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEnv, partnerId]);

  useEffect(() => {
    // Initial load
    initializeAirService(currentEnv, partnerId);

    return () => {
      if (airService) {
        airService.cleanUp();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue: AppContextType = {
    airService,
    isInitialized,
    isLoading,
    isLoggedIn,
    userAddress,
    currentEnv,
    partnerId,
    environmentConfig,
    setCurrentEnv,
    setPartnerId,
    handleLogin,
    handleLogout,
    getDefaultPartnerId,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
