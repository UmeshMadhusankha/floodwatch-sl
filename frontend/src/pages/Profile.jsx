import { useState, useEffect } from "react";
import { User, Upload, Trash2, Save, Award, Check, ShieldAlert, Sparkles, MapPin } from "lucide-react";
import styles from "./Profile.module.css";
import districtDefaults from "../data/district_defaults.json";

const DEFAULT_AVATARS = [
  "linear-gradient(135deg, #185FA5 0%, #0D2137 100%)",
  "linear-gradient(135deg, #10B981 0%, #047857 100%)",
  "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
  "linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)",
  "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
];

const DEFAULT_PROFILE = {
  name: "Lasal Jayasinghe",
  role: "Lead MLOps Engineer & Contributor",
  district: "Colombo",
  avatarType: "gradient", // "gradient" | "custom"
  avatarValue: DEFAULT_AVATARS[0], // holds gradient string or base64 image
  bio: "Full stack developer & MLOps enthusiast. Working on flood risk intelligence for Sri Lanka.",
  predictionsCount: 12,
  contributions: ["Model Ensemble Tuning", "UI Design System", "Vercel Deployments"],
};

export default function Profile() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState("");

  // Load profile from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("floodwatch_user_profile");
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved profile", e);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsSaved(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size should be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prev) => ({
        ...prev,
        avatarType: "custom",
        avatarValue: reader.result,
      }));
      setIsSaved(false);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfile((prev) => ({
      ...prev,
      avatarType: "gradient",
      avatarValue: DEFAULT_AVATARS[0],
    }));
    setIsSaved(false);
  };

  const handleSelectGradient = (grad) => {
    setProfile((prev) => ({
      ...prev,
      avatarType: "gradient",
      avatarValue: grad,
    }));
    setIsSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem("floodwatch_user_profile", JSON.stringify(profile));
    setIsSaved(true);
    // Trigger window event so Navbar can pick up live changes instantly
    window.dispatchEvent(new Event("profileUpdate"));
    setTimeout(() => setIsSaved(false), 3000);
  };

  const districts = Object.keys(districtDefaults).filter((d) => d !== "_default");

  return (
    <div className={styles.profileContainer}>
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <User className={styles.titleIcon} size={28} />
          <h1>User Profile Settings</h1>
        </div>
        <p className={styles.subtitle}>Customize your public profile, set default parameters, and track platform contributions.</p>
      </header>

      <div className={styles.grid}>
        {/* Left Card: Avatar & Stats */}
        <section className={styles.leftCard}>
          <div className={styles.avatarWrapper}>
            {profile.avatarType === "gradient" ? (
              <div 
                className={styles.avatarPreview} 
                style={{ background: profile.avatarValue }}
              >
                {profile.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
              </div>
            ) : (
              <img 
                src={profile.avatarValue} 
                alt="Profile Preview" 
                className={styles.avatarImage} 
              />
            )}

            <div className={styles.avatarActions}>
              <label htmlFor="file-upload" className={styles.uploadBtn}>
                <Upload size={16} />
                Upload Photo
                <input 
                  id="file-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  style={{ display: "none" }} 
                />
              </label>
              
              {profile.avatarType === "custom" && (
                <button onClick={handleRemoveImage} className={styles.deleteBtn} title="Remove image">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {error && <p className={styles.errorText}><ShieldAlert size={14} /> {error}</p>}

          <div className={styles.gradientSelector}>
            <p>Or choose a dynamic theme:</p>
            <div className={styles.gradients}>
              {DEFAULT_AVATARS.map((grad, idx) => (
                <button
                  key={idx}
                  className={`${styles.gradCircle} ${profile.avatarType === "gradient" && profile.avatarValue === grad ? styles.activeGrad : ""}`}
                  style={{ background: grad }}
                  onClick={() => handleSelectGradient(grad)}
                />
              ))}
            </div>
          </div>

          <hr className={styles.divider} />

          <div className={styles.statsSection}>
            <h3>Platform Telemetry</h3>
            <div className={styles.statRow}>
              <Award size={18} className={styles.statIcon} />
              <div>
                <strong>{profile.role}</strong>
                <span>Assigned Role</span>
              </div>
            </div>
            <div className={styles.statRow}>
              <Sparkles size={18} className={styles.statIcon} />
              <div>
                <strong>{profile.predictionsCount} predictions</strong>
                <span>Telemetry Run Count</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Card: Fields */}
        <section className={styles.rightCard}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Display Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              placeholder="e.g. Lasal Jayasinghe"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="role">Role / Bio Title</label>
            <input
              type="text"
              id="role"
              name="role"
              value={profile.role}
              onChange={handleChange}
              placeholder="e.g. Lead MLOps Engineer"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="district">
              <MapPin size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Default Region (District)
            </label>
            <select
              id="district"
              name="district"
              value={profile.district}
              onChange={handleChange}
            >
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="bio">About Me / Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Tell us about your work..."
            />
          </div>

          <div className={styles.actions}>
            <button 
              onClick={handleSave} 
              className={`${styles.saveBtn} ${isSaved ? styles.savedSuccess : ""}`}
            >
              {isSaved ? (
                <>
                  <Check size={18} />
                  Changes Saved!
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
