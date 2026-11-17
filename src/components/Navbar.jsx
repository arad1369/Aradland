import { Link, useLocation } from "react-router-dom";
import ConnectWallet from "./ConnectWallet.jsx";

const links = [
  ["/home", "Home"],
  ["/stake", "Stake"],
  ["/GmDeploy", "GM Deploy"],
  ["/Deploy", "Deploy"],
];

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <header className="navbar">
      <div className="container spread">
        <div className="stack">
          <div className="brand">ARAD LAND</div>
          <nav className="navlinks">
            {links.map(([to, label]) => (
              <Link
                key={to}
                to={to}
                style={{ opacity: pathname.toLowerCase().startsWith(to.toLowerCase()) ? 1 : 0.65 }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <ConnectWallet />
      </div>
    </header>
  );
}
