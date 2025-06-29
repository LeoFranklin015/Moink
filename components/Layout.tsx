"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import NavBarLogin from "./NavBarLogin";
import { useAppContext } from "../contexts/AppContext";

interface LayoutProps {
  children: React.ReactNode;
}

// Component to get current flow title
const FlowTitle = () => {
  const pathname = usePathname();

  if (pathname === "/issue") {
    return <span className="text-blue-600">Issuance</span>;
  } else if (pathname === "/verify") {
    return <span className="text-purple-600">Verification</span>;
  }

  return <span>AIR Credential Demo</span>;
};

const Layout = ({ children }: LayoutProps) => {
  const { partnerId, setPartnerId, getDefaultPartnerId } = useAppContext();
  const pathname = usePathname();

  // Update partner ID when route changes
  useEffect(() => {
    const defaultPartnerId = getDefaultPartnerId(pathname);
    setPartnerId(defaultPartnerId);
  }, [pathname, setPartnerId, getDefaultPartnerId]);

  const getBackgroundClass = () => {
    if (pathname.startsWith("/issue")) {
      return "bg-gradient-to-br from-blue-50 to-blue-100";
    } else if (pathname.startsWith("/verify")) {
      return "bg-gradient-to-br from-purple-50 to-purple-200";
    }
    return "bg-gradient-to-br from-gray-50 to-gray-200";
  };

  return (
    <div className={`min-h-screen ${getBackgroundClass()}`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full sm:max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 gap-2 sm:gap-0 py-2 sm:py-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                <FlowTitle />
              </h1>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Partner ID:</span>
                <input
                  type="text"
                  value={partnerId}
                  onChange={(e) => setPartnerId(e.target.value)}
                  className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-1 rounded border border-transparent focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-300 min-w-[200px]"
                  placeholder="Enter Partner ID"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-8 w-full sm:w-auto">
              <nav className="flex flex-row space-x-2 sm:space-x-8 w-full sm:w-auto">
                <Link
                  href="/issue"
                  className="flex-1 sm:flex-none px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-center"
                >
                  Issuance
                </Link>
                <Link
                  href="/verify"
                  className="flex-1 sm:flex-none px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-center"
                >
                  Verification
                </Link>
              </nav>
              <div className="w-full sm:w-auto">
                <NavBarLogin />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-full sm:max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
          <p className="text-center text-gray-500 text-xs sm:text-sm">
            Powered by AIR Credential SDK
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
