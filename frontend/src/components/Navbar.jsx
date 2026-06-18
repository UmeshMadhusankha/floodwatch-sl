import { NavLink, useLocation } from "react-router-dom";
import { Waves, CloudRain, MapPin, Layers, Activity, Home as HomeIcon } from "lucide-react";

import styles from "./Navbar.module.css";

const links = [
  { to: "/predict", label: "Predict", icon: Waves },
  { to: "/forecast", label: "Forecast", icon: CloudRain },
  { to: "/map", label: "Map", icon: MapPin },
  { to: "/monitoring", label: "Monitor", icon: Activity },
];

const homeLinks = [
  { to: "#home", label: "Home", icon: HomeIcon },
  { to: "#about", label: "About", icon: Activity },
  { to: "#services", label: "Services", icon: Layers },
  { to: "#features", label: "Features", icon: CloudRain },
  { to: "#contact", label: "Contact", icon: MapPin },
];

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand} end>
          <span className={styles.logo}>
            <Waves size={20} strokeWidth={2.4} />
          </span>
          <span className={styles.brandText}>FloodWatch SL</span>
        </NavLink>

        <nav className={styles.links}>
          {isHome
            ? homeLinks.map(({ to, label, icon: Icon }) => (
                <a key={to} href={to} className={styles.link}>
                  <Icon size={16} strokeWidth={2.2} />
                  <span>{label}</span>
                </a>
              ))
            : links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    isActive ? `${styles.link} ${styles.active}` : styles.link
                  }
                >
                  <Icon size={16} strokeWidth={2.2} />
                  <span>{label}</span>
                </NavLink>
              ))}
        </nav>
      </div>
    </header>
  );
}
