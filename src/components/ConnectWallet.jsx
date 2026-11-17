import { useEffect, useState } from "react";
import { QMS_CHAIN } from "../lib/config.js";
import { ensureQmsChain, short } from "../lib/wallet.js";

export default function ConnectWallet() {
  const [account, setAccount] = useState(null);
  const [ok, setOk] = useState(false);

  async function connect() {
    if (!window.ethereum) {
      alert("MetaMask (or another EVM wallet) is not installed.");
      return;
    }
    try {
      const [acc] = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(acc);
      await ensureQmsChain();
      setOk(true);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (!window.ethereum) return;
    const norm = (c) => String(c).toLowerCase();
    window.ethereum
      .request({ method: "eth_accounts" })
      .then((a) => setAccount(a?.[0] ?? null))
      .catch(() => {});
    window.ethereum
      .request({ method: "eth_chainId" })
      .then((c) => setOk(norm(c) === norm(QMS_CHAIN.chainId)))
      .catch(() => {});
    const onChain = (c) => setOk(norm(c) === norm(QMS_CHAIN.chainId));
    const onAccounts = (a) => setAccount(a?.[0] ?? null);
    window.ethereum.on("chainChanged", onChain);
    window.ethereum.on("accountsChanged", onAccounts);
    return () => {
      window.ethereum?.removeListener("chainChanged", onChain);
      window.ethereum?.removeListener("accountsChanged", onAccounts);
    };
  }, []);

  const label = !account ? "Connect Wallet" : ok ? short(account) : "Switch to QMS";
  return (
    <button className={`btn ${account && ok ? "btn-solid" : "btn-outline"}`} onClick={connect}>
      {label}
    </button>
  );
}
