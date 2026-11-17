import { useCallback, useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import {
  ARAD_TOKEN_ADDRESS, STAKING_ADDRESS, STAKING_ABI, ERC20_ABI,
  REWARD_PER_QMS_PER_DAY, EXPLORER, QMS_CHAIN, isDeployed,
} from "../lib/config.js";
import { ensureQmsChain } from "../lib/wallet.js";

const fmt = (bn, dp = 4) => {
  const n = Number(ethers.utils.formatEther(bn));
  return n.toLocaleString("en-US", { maximumFractionDigits: dp });
};

export default function Stake() {
  const [account, setAccount] = useState(null);
  const [wrongChain, setWrongChain] = useState(false);
  const [data, setData] = useState(null); // {qms, aradBal, staked, pending, total, paid, at}
  const [now, setNow] = useState(Date.now());
  const [stakeAmt, setStakeAmt] = useState("");
  const [unstakeAmt, setUnstakeAmt] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [lastTx, setLastTx] = useState("");
  const accountRef = useRef(null);

  const ready = isDeployed(STAKING_ADDRESS) && isDeployed(ARAD_TOKEN_ADDRESS);

  const refresh = useCallback(async (acc) => {
    const a = acc ?? accountRef.current;
    if (!a || !window.ethereum || !ready) return;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      const net = await provider.getNetwork();
      if (net.chainId !== parseInt(QMS_CHAIN.chainId, 16)) {
        setWrongChain(true);
        return;
      }
      setWrongChain(false);
      const staking = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, provider);
      const token = new ethers.Contract(ARAD_TOKEN_ADDRESS, ERC20_ABI, provider);
      const [qms, aradBal, pos, pending, total, paid] = await Promise.all([
        provider.getBalance(a),
        token.balanceOf(a),
        staking.positions(a),
        staking.pendingReward(a),
        staking.totalStaked(),
        staking.totalRewardsPaid(),
      ]);
      setData({ qms, aradBal, staked: pos.amount, pending, total, paid, at: Date.now() });
    } catch (e) {
      console.error(e);
      setError(e.reason || e.message || "Failed to load data");
    }
  }, [ready]);

  async function connect() {
    setError("");
    try {
      if (!window.ethereum) throw new Error("No wallet detected");
      const [acc] = await window.ethereum.request({ method: "eth_requestAccounts" });
      accountRef.current = acc;
      setAccount(acc);
      await ensureQmsChain();
      await refresh(acc);
    } catch (e) {
      setError(e.message || "Could not connect");
    }
  }

  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: "eth_accounts" }).then((a) => {
      if (a?.[0]) { accountRef.current = a[0]; setAccount(a[0]); refresh(a[0]); }
    }).catch(() => {});
    const onAcc = (a) => { accountRef.current = a?.[0] ?? null; setAccount(a?.[0] ?? null); setData(null); refresh(a?.[0]); };
    const onChain = () => refresh();
    window.ethereum.on("accountsChanged", onAcc);
    window.ethereum.on("chainChanged", onChain);
    return () => {
      window.ethereum?.removeListener("accountsChanged", onAcc);
      window.ethereum?.removeListener("chainChanged", onChain);
    };
  }, [refresh]);

  useEffect(() => {
    const t1 = setInterval(() => setNow(Date.now()), 1000);
    const t2 = setInterval(() => refresh(), 15000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, [refresh]);

  async function send(kind, fn) {
    setBusy(kind); setError(""); setLastTx("");
    try {
      await ensureQmsChain();
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      const signer = provider.getSigner();
      const staking = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, signer);
      const tx = await fn(staking);
      setLastTx(tx.hash);
      await tx.wait();
      await refresh();
      if (kind === "stake") setStakeAmt("");
      if (kind === "unstake") setUnstakeAmt("");
    } catch (e) {
      console.error(e);
      setError(e.reason || e.data?.message || e.message || "Transaction failed");
    } finally {
      setBusy("");
    }
  }

  const doStake = () => send("stake", (s) => s.stake({ value: ethers.utils.parseEther(stakeAmt) }));
  const doUnstake = () => send("unstake", (s) => s.unstake(ethers.utils.parseEther(unstakeAmt)));
  const doClaim = () => send("claim", (s) => s.claim());

  // live ticking estimate of pending rewards
  let livePending = null;
  if (data) {
    const dt = (now - data.at) / 1000;
    const extra = Number(ethers.utils.formatEther(data.staked)) * REWARD_PER_QMS_PER_DAY * dt / 86400;
    livePending = Number(ethers.utils.formatEther(data.pending)) + extra;
  }

  const validAmt = (v) => { try { return ethers.utils.parseEther(v || "0").gt(0); } catch { return false; } };

  return (
    <>
      <h1 className="big">Stake <span className="grad">QMS</span></h1>
      <p className="sub">
        Stake QMS and earn <b>{REWARD_PER_QMS_PER_DAY} ARAD per day</b> for every 1 QMS staked.
        Rewards add up in your account here; claim any time and pay only the network fee.
      </p>

      {!ready && (
        <div className="notice" style={{ marginBottom: 16 }}>
          Contracts are not configured yet. Deploy <code>AradToken</code> and <code>AradStaking</code>, then put their
          addresses in <code>src/lib/config.js</code>.
        </div>
      )}

      {!account ? (
        <button className="btn btn-solid" onClick={connect}>Connect Wallet</button>
      ) : wrongChain ? (
        <button className="btn btn-solid" onClick={connect}>Switch to QMS Testnet</button>
      ) : null}

      {ready && account && data && !wrongChain && (
        <div className="grid" style={{ marginTop: 16 }}>
          <div className="grid cols-3">
            <div className="card stat"><div className="label">Wallet balance</div><div className="value">{fmt(data.qms)} <small>QMS</small></div></div>
            <div className="card stat"><div className="label">Your stake</div><div className="value">{fmt(data.staked)} <small>QMS</small></div></div>
            <div className="card stat"><div className="label">ARAD in wallet</div><div className="value">{fmt(data.aradBal)} <small>ARAD</small></div></div>
          </div>

          <div className="card stat">
            <div className="label">Pending reward</div>
            <div className="value grad">{livePending.toLocaleString("en-US", { minimumFractionDigits: 6, maximumFractionDigits: 6 })} <small>ARAD</small></div>
            <div style={{ marginTop: 12 }}>
              <button className="btn btn-solid" onClick={doClaim} disabled={!!busy || livePending <= 0}>
                {busy === "claim" ? "Claiming…" : "Claim rewards"}
              </button>
            </div>
          </div>

          <div className="grid cols-2">
            <div className="card">
              <h3>Stake</h3>
              <div className="grid">
                <input className="input" inputMode="decimal" placeholder="Amount in QMS" value={stakeAmt} onChange={(e) => setStakeAmt(e.target.value)} />
                <div className="row">
                  <button className="btn" onClick={doStake} disabled={!!busy || !validAmt(stakeAmt)}>
                    {busy === "stake" ? "Staking…" : "Stake"}
                  </button>
                  <button className="btn btn-outline" onClick={() => {
                    const keep = ethers.utils.parseEther("0.5"); // leave some QMS for network fees
                    const max = data.qms.gt(keep) ? data.qms.sub(keep) : ethers.constants.Zero;
                    setStakeAmt(ethers.utils.formatEther(max));
                  }}>Max</button>
                </div>
              </div>
            </div>
            <div className="card">
              <h3>Unstake</h3>
              <div className="grid">
                <input className="input" inputMode="decimal" placeholder="Amount in QMS" value={unstakeAmt} onChange={(e) => setUnstakeAmt(e.target.value)} />
                <div className="row">
                  <button className="btn btn-outline" onClick={doUnstake} disabled={!!busy || !validAmt(unstakeAmt)}>
                    {busy === "unstake" ? "Unstaking…" : "Unstake"}
                  </button>
                  <button className="btn btn-outline" onClick={() => setUnstakeAmt(ethers.utils.formatEther(data.staked))}>Max</button>
                </div>
              </div>
            </div>
          </div>

          <div className="notice">
            Total staked by everyone: <b>{fmt(data.total)} QMS</b> • Total rewards paid: <b>{fmt(data.paid)} ARAD</b>
          </div>
        </div>
      )}

      {error && <p className="err">Error: {error}</p>}
      {lastTx && (
        <p className="good">
          Tx: <a href={`${EXPLORER}/tx/${lastTx}`} target="_blank" rel="noreferrer">{lastTx}</a>
        </p>
      )}
    </>
  );
}
