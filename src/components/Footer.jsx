import { FAUCET } from "../lib/config.js";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        Arad Land • Built on <strong>QMS Testnet</strong>. Faucet:{" "}
        <a className="pill" href={FAUCET} target="_blank" rel="noreferrer">
          Get QMS
        </a>{" "}
        <a className="pill" href="https://docs.qms.finance/" target="_blank" rel="noreferrer">
          Docs
        </a>
      </div>
    </footer>
  );
}
