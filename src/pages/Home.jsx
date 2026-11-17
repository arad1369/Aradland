import { Link } from "react-router-dom";
import { REWARD_PER_QMS_PER_DAY } from "../lib/config.js";

export default function Home() {
  return (
    <>
      <h1 className="big">Welcome to <span className="grad">Arad Land</span></h1>
      <p className="sub">Stake QMS, earn ARAD, and deploy contracts on QMS Testnet.</p>

      <div className="grid cols-2">
        <div className="card">
          <h3>Stake QMS</h3>
          <p className="sub">Earn {REWARD_PER_QMS_PER_DAY} ARAD per day for every 1 QMS staked.</p>
          <Link className="btn btn-solid" to="/stake">Start staking</Link>
        </div>

        <div className="card">
          <h3>GM Deploy</h3>
          <p className="sub">Deploy a GM contract.</p>
          <Link className="btn btn-outline" to="/GmDeploy">GM Deploy</Link>
        </div>

        <div className="card">
          <h3>Deploy</h3>
          <p className="sub">Deploy a simple counter contract.</p>
          <Link className="btn btn-outline" to="/Deploy">Deploy</Link>
        </div>
      </div>
    </>
  );
}
