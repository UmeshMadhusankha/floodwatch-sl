import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CloudRain,
  Cpu,
  Database,
  Gauge,
  Layers,
  LineChart,
  MapPin,
  Monitor,
  ShieldCheck,
  Waves,
} from "lucide-react";

import heroBackground from "../../../docs/hero/flood-back.png";
import heroImage from "../../../docs/hero/flood-hero.png";
import styles from "./Home.module.css";

const services = [
  {
    icon: Gauge,
    title: "Flood Risk Score Prediction",
    text: "Predict flood risk scores using environmental and geographical factors.",
    features: [
      "User-friendly prediction interface",
      "Instant results",
      "Risk classification",
      "Data-driven decision support",
    ],
  },
  {
    icon: CloudRain,
    title: "Real-Time Flood Forecasting",
    text: "Use weather information and environmental conditions to provide flood forecasting support.",
    features: [
      "Rainfall monitoring",
      "Weather integration",
      "Early warning insights",
      "Forecast visualization",
    ],
  },
  {
    icon: MapPin,
    title: "Sri Lanka Flood Risk Mapping",
    text: "Visualize flood-prone regions across Sri Lanka.",
    features: [
      "Interactive maps",
      "Geographic risk analysis",
      "Province and district insights",
      "Spatial flood visualization",
    ],
  },
  {
    icon: BarChart3,
    title: "Prediction Monitoring & Analytics",
    text: "Monitor prediction trends and model outputs.",
    features: [
      "Historical predictions",
      "Trend analysis",
      "Performance tracking",
      "Monitoring dashboard",
    ],
  },
];

const features = [
  { icon: Cpu, title: "AI-Powered Predictions" },
  { icon: CloudRain, title: "Real-Time Weather Integration" },
  { icon: MapPin, title: "Interactive Risk Maps" },
  { icon: Monitor, title: "Easy-to-Use Interface" },
  { icon: LineChart, title: "Data Visualization" },
  { icon: Layers, title: "Scalable Architecture" },
  { icon: Gauge, title: "Fast Predictions" },
  { icon: ShieldCheck, title: "Reliable Decision Support" },
];

const steps = [
  {
    icon: Database,
    title: "Data Collection",
    text: "Collect environmental and weather-related information.",
  },
  {
    icon: Activity,
    title: "Data Processing",
    text: "Prepare and transform data for analysis.",
  },
  {
    icon: Cpu,
    title: "AI Prediction",
    text: "Generate flood risk predictions using trained machine learning models.",
  },
  {
    icon: Monitor,
    title: "Visualization & Monitoring",
    text: "Display predictions, maps, and insights through dashboards.",
  },
];

function SectionHeader({ eyebrow, title, text }) {
  return (
    <div className={styles.sectionHeader}>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function HeroSection() {
  return (
    <section
      id="home"
      className={styles.hero}
      style={{ "--hero-bg": `url(${heroBackground})` }}
    >
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <div className={styles.logoMark}>
            <Waves size={28} strokeWidth={2.4} />
            <span>FloodWatch-SL</span>
          </div>
          <h1>FloodWatch-SL</h1>
          <p className={styles.tagline}>AI-Powered Flood Risk Prediction & Monitoring System</p>
          <p className={styles.lead}>
            Helping citizens, researchers, and authorities prepare for flood events using machine
            learning, real-time weather information, and spatial risk analysis.
          </p>
          <Link to="/predict" className={styles.primaryButton}>
            Get Started
            <ArrowRight size={18} strokeWidth={2.3} />
          </Link>
        </div>

        <div className={styles.heroPanel} aria-label="FloodWatch SL monitoring preview">
          <img src={heroImage} alt="Flooded road during heavy rain" />
          <div className={styles.heroStats}>
            <div>
              <span>Current Focus</span>
              <strong>Sri Lanka</strong>
            </div>
            <div>
              <span>Risk Intelligence</span>
              <strong>ML + Weather</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const audiences = [
    "General public",
    "Disaster management authorities",
    "Researchers",
    "Urban planners",
    "Environmental experts",
  ];

  return (
    <section id="about" className={styles.section}>
      <div className={styles.twoColumn}>
        <div className={styles.imageCard}>
          <img src={heroImage} alt="Flooded road during heavy rain" />
          <div className={styles.overlayStat}>
            <ShieldCheck size={18} strokeWidth={2.4} />
            Early awareness for proactive mitigation
          </div>
        </div>
        <div className={styles.aboutCopy}>
          <SectionHeader eyebrow="About" title="About FloodWatch-SL" />
          <p>
            FloodWatch-SL is an AI-powered flood risk assessment and prediction platform developed
            to support flood preparedness and decision-making in Sri Lanka.
          </p>
          <p>
            The system combines machine learning, environmental indicators, and weather information
            to estimate flood risk levels and visualize vulnerable locations.
          </p>
          <div className={styles.audienceGrid}>
            {audiences.map((audience) => (
              <span key={audience}>
                <CheckCircle2 size={16} strokeWidth={2.4} />
                {audience}
              </span>
            ))}
          </div>
          <p>
            The goal is to improve early awareness and support proactive flood mitigation efforts.
          </p>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="services" className={styles.section}>
      <SectionHeader
        eyebrow="Services"
        title="Our Services"
        text="Operational tools for prediction, forecasting, mapping, and monitoring."
      />
      <div className={styles.cardGrid}>
        {services.map(({ icon: Icon, title, text, features: serviceFeatures }) => (
          <article key={title} className={styles.serviceCard}>
            <div className={styles.cardIcon}>
              <Icon size={22} strokeWidth={2.3} />
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
            <ul>
              {serviceFeatures.map((feature) => (
                <li key={feature}>
                  <CheckCircle2 size={15} strokeWidth={2.5} />
                  {feature}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className={`${styles.section} ${styles.altSection}`}>
      <SectionHeader
        eyebrow="Features"
        title="Why Choose FloodWatch-SL?"
        text="Built for fast, clear, public-service decision support."
      />
      <div className={styles.featureGrid}>
        {features.map(({ icon: Icon, title }) => (
          <article key={title} className={styles.featureCard}>
            <Icon size={22} strokeWidth={2.3} />
            <h3>{title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className={styles.section}>
      <SectionHeader
        eyebrow="Workflow"
        title="How It Works"
        text="A clear four-step flow from observations to actionable insight."
      />
      <div className={styles.timeline}>
        {steps.map(({ icon: Icon, title, text }, index) => (
          <article key={title} className={styles.stepCard}>
            <span className={styles.stepNumber}>0{index + 1}</span>
            <div className={styles.cardIcon}>
              <Icon size={22} strokeWidth={2.3} />
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className={styles.cta}>
      <div>
        <span>Ready for a live assessment?</span>
        <h2>Start Predicting Flood Risks Today</h2>
        <p>
          Explore flood risk predictions, forecasting tools, and spatial analysis designed for Sri
          Lanka.
        </p>
      </div>
      <Link to="/predict" className={styles.ctaButton}>
        Get Started
        <ArrowRight size={18} strokeWidth={2.3} />
      </Link>
    </section>
  );
}

export default function Home() {
  return (
    <div className={styles.page}>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
    </div>
  );
}
