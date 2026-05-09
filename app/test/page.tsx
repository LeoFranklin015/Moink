"use client";

import { useState } from "react";
import { createWalletClient, createPublicClient, custom, http } from "viem";
import { useAirkit } from "@/components/AirkitProvider";
import { getAuthToken } from "@/lib/airkit-auth";
import { DEFAULT_CHAIN } from "@/utils/constants";

// Counter.sol compiled by scripts-compile-counter.mjs (solc 0.8.x):
//   contract Counter {
//     uint256 public count;
//     event Incremented(address indexed by, uint256 newCount);
//     function increment() external { count++; emit Incremented(msg.sender, count); }
//   }
const COUNTER_BYTECODE =
  "0x6080604052348015600e575f5ffd5b5060f88061001b5f395ff3fe6080604052348015600e575f5ffd5b50600436106030575f3560e01c806306661abd146034578063d09de08a14604d575b5f5ffd5b603b5f5481565b60405190815260200160405180910390f35b60536055565b005b5f80549080606183609f565b90915550505f5460405190815233907f38ac789ed44572701765277c4d0970f2db1c1a571ed39e84358095ae4eaa54209060200160405180910390a2565b5f6001820160bb57634e487b7160e01b5f52601160045260245ffd5b506001019056fea26469706673582212204fde9ebd3bcfa44a37f1998beffbb4bad0674de6b4abf96e7da736adb21be0b164736f6c63430008230033";

const COUNTER_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "by", type: "address" },
      { indexed: false, internalType: "uint256", name: "newCount", type: "uint256" },
    ],
    name: "Incremented",
    type: "event",
  },
  { inputs: [], name: "count", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "increment", outputs: [], stateMutability: "nonpayable", type: "function" },
] as const;

const ISSUER_DID    = process.env.NEXT_PUBLIC_ISSUER_DID!;
const CREDENTIAL_ID = process.env.NEXT_PUBLIC_CREDENTIAL_ID!;
const PROGRAM_ID    = process.env.NEXT_PUBLIC_PROGRAM_ID!;
const PARTNER_ID    = process.env.NEXT_PUBLIC_PARTNER_ID!;

type Log = { ts: string; level: "info" | "ok" | "err"; msg: string };

export default function TestPage() {
  const { service, isInitialized, isLoggedIn, address, login, logout } = useAirkit();
  const [logs, setLogs] = useState<Log[]>([]);
  const [busy, setBusy] = useState(false);

  const log = (msg: string, level: Log["level"] = "info") =>
    setLogs((l) => [...l, { ts: new Date().toISOString().slice(11, 23), level, msg }]);

  const onLogin = async () => {
    setBusy(true);
    try { log("login: calling login()"); await login(); log("login ok", "ok"); }
    catch (e) { log(`login error: ${(e as Error).message}`, "err"); }
    finally { setBusy(false); }
  };

  const onLogout = async () => {
    setBusy(true);
    try { await logout(); log("logout ok", "ok"); }
    catch (e) { log(`logout error: ${(e as Error).message}`, "err"); }
    finally { setBusy(false); }
  };

  const onDeployCounter = async () => {
    if (!service) return;
    setBusy(true);
    try {
      const provider = await service.getProvider();
      const wallet = createWalletClient({ transport: custom(provider), chain: DEFAULT_CHAIN });
      const pub = createPublicClient({ chain: DEFAULT_CHAIN, transport: http() });
      const [account] = await wallet.getAddresses();

      log(`deploy: chain=${DEFAULT_CHAIN.name} (${DEFAULT_CHAIN.id})`);
      log(`deploy: from ${account}`);
      log(`deploy: sending Counter creation tx...`);
      const txHash = await wallet.deployContract({
        abi: COUNTER_ABI,
        bytecode: COUNTER_BYTECODE as `0x${string}`,
        account,
      });
      log(`deploy: tx ${txHash} — waiting for receipt...`);
      const receipt = await pub.waitForTransactionReceipt({ hash: txHash });
      if (!receipt.contractAddress) throw new Error("no contractAddress in receipt");
      log(`deploy ok. contract=${receipt.contractAddress}`, "ok");
      log(`paste this into builder Contract Address: ${receipt.contractAddress}`);
    } catch (e) {
      log(`deploy error: ${(e as Error).message}`, "err");
    } finally {
      setBusy(false);
    }
  };

  const onIssue = async () => {
    if (!service) return;
    setBusy(true);
    try {
      log(`issue: credentialId=${CREDENTIAL_ID}`);
      const token = await getAuthToken("issue");
      const r = await service.issueCredential({
        authToken: token,
        issuerDid: ISSUER_DID,
        credentialId: CREDENTIAL_ID,
        credentialSubject: { id: `did:example:test-${Date.now()}`, age: 25 },
      });
      log(`issue ok. result=${JSON.stringify(r)}`, "ok");
    } catch (e) { log(`issue error: ${(e as Error).message}`, "err"); }
    finally { setBusy(false); }
  };

  const onVerify = async () => {
    if (!service) return;
    setBusy(true);
    try {
      log(`verify: programId=${PROGRAM_ID}`);
      const token = await getAuthToken("verify");
      const r = await service.verifyCredential({ authToken: token, programId: PROGRAM_ID });
      log(`verify ok. status=${r.verificationResult?.status}`, "ok");
    } catch (e) { log(`verify error: ${(e as Error).message}`, "err"); }
    finally { setBusy(false); }
  };

  return (
    <main style={{ maxWidth: 880, margin: "32px auto", padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>AIRKit test</h1>

      <section style={card}>
        <h3 style={{ margin: "0 0 12px" }}>State</h3>
        <Row k="Partner ID" v={PARTNER_ID} />
        <Row k="Issuer DID" v={ISSUER_DID} />
        <Row k="Credential ID" v={CREDENTIAL_ID} />
        <Row k="Program ID" v={PROGRAM_ID} />
        <Row k="AirService" v={isInitialized ? "initialized" : "initializing..."} />
        <Row k="Logged in" v={isLoggedIn ? "yes" : "no"} />
        <Row k="Address" v={address ?? "—"} />
      </section>

      <section style={{ ...card, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Btn disabled={!isInitialized || isLoggedIn || busy} onClick={onLogin}>Login</Btn>
        <Btn disabled={!isInitialized || !isLoggedIn || busy} onClick={onLogout}>Logout</Btn>
        <Btn disabled={!isInitialized || !isLoggedIn || busy} onClick={onIssue}>Issue (age: 25)</Btn>
        <Btn disabled={!isInitialized || !isLoggedIn || busy} onClick={onVerify}>Verify</Btn>
        <Btn disabled={!isInitialized || !isLoggedIn || busy} onClick={onDeployCounter}>Deploy Counter</Btn>
      </section>

      <section style={card}>
        <h3 style={{ margin: "0 0 12px" }}>Logs</h3>
        <div style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 12, lineHeight: 1.55, whiteSpace: "pre-wrap", maxHeight: 360, overflow: "auto",
          background: "#0b0b0b", color: "#e6e6e6", padding: 12, borderRadius: 6,
        }}>
          {logs.length === 0 ? <span style={{ opacity: 0.6 }}>(empty)</span> : logs.map((l, i) => (
            <div key={i} style={{ color: l.level === "err" ? "#ff6b6b" : l.level === "ok" ? "#7bd88f" : "#9ad9ff" }}>
              <span style={{ opacity: 0.6 }}>[{l.ts}]</span> {l.msg}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

const card: React.CSSProperties = { border: "1px solid #e5e5e5", borderRadius: 8, padding: 16, marginBottom: 16 };

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8, fontSize: 13, padding: "4px 0" }}>
      <div style={{ color: "#666" }}>{k}</div>
      <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", wordBreak: "break-all" }}>{v}</div>
    </div>
  );
}

function Btn({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      disabled={disabled} onClick={onClick}
      style={{
        padding: "8px 14px", borderRadius: 6, border: "1px solid #ccc",
        background: disabled ? "#f3f3f3" : "#111", color: disabled ? "#888" : "#fff",
        cursor: disabled ? "not-allowed" : "pointer", fontSize: 14,
      }}
    >{children}</button>
  );
}
