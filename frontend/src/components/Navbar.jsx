import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Waves, CloudRain, MapPin, Layers, Activity, Home as HomeIcon, User } from "lucide-react";

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
];

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const [profile, setProfile] = useState({
    name: "Lasal Jayasinghe",
    avatarType: "gradient",
    avatarValue: "linear-gradient(135deg, #185FA5 0%, #0D2137 100%)",
  });

  const loadProfile = () => {
    const saved = localStorage.getItem("floodwatch_user_profile");
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    loadProfile();
    window.addEventListener("profileUpdate", loadProfile);
    return () => window.removeEventListener("profileUpdate", loadProfile);
  }, []);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

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

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? `${styles.profileLink} ${styles.activeProfile}` : styles.profileLink
            }
            title={`View profile for ${profile.name}`}
          >
            {profile.avatarType === "gradient" ? (
              <div
                className={styles.navbarAvatar}
                style={{ background: profile.avatarValue }}
              >
                {getInitials(profile.name)}
              </div>
            ) : (
              <img
                src={profile.avatarValue}
                alt={profile.name}
                className={styles.navbarAvatarImg}
              />
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
