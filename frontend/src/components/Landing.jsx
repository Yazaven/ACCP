import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView, animate } from "framer-motion";
import {
  BarChart2, Zap, Activity, Lightbulb, Target, Search,
} from 'lucide-react';
import "./../styles/Landing.css";
import CookieConsent from "./CookieConsent";

/* ─── Animated number using framer-motion animate() ──────── */
function AnimatedNumber({ from = 0, to, prefix = "", suffix = "", duration = 1.8 }) {
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!isInView) return;
    const node = nodeRef.current;
    const controls = animate(from, to, {
      duration,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate(v) {
        if (node) node.textContent = prefix + Math.round(v) + suffix;
      },
    });
    return () => controls.stop();
  }, [isInView, from, to, prefix, suffix, duration]);

  return <span ref={nodeRef}>{prefix}{from}{suffix}</span>;
}

/* ─── Agent Pipeline Terminal ─────────────────────────────── */
const PIPELINE_LINES = [
  { id: 0, delay: 0,    type: "cmd",     text: "ai-agent --trace --id complaint_8829" },
  { id: 1, delay: 500,  type: "info",    text: "Initializing 6-agent cluster..." },
  { id: 2, delay: 1100, type: "agent",   agent: "CLASSIFIER", result: "BILLING", meta: "97.3% confidence" },
  { id: 3, delay: 1800, type: "agent",   agent: "SENTIMENT  ", result: "FRUSTRATED", meta: "→ escalated URGENT" },
  { id: 4, delay: 2600, type: "agent",   agent: "SOLUTION   ", result: "3 candidates ranked", meta: "" },
  { id: 5, delay: 3400, type: "agent",   agent: "PREDICTOR  ", result: "94.1% CSAT predicted", meta: "" },
  { id: 6, delay: 4200, type: "success", text: "Resolution dispatched", time: "1.84s" },
];

function AgentTerminal() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [termKey, setTermKey] = useState(0);
  const termRef = useRef(null);
  const inView = useInView(termRef, { amount: 0.3 });
  const timers = useRef([]);

  useEffect(() => {
    if (!inView) return;
    setVisibleCount(0);
    timers.current.forEach(clearTimeout);
    timers.current = PIPELINE_LINES.map((line) =>
      setTimeout(() => setVisibleCount((c) => Math.max(c, line.id + 1)), line.delay)
    );
    const reset = setTimeout(() => {
      setVisibleCount(0);
      setTermKey((k) => k + 1);
    }, 7500);
    timers.current.push(reset);
    return () => timers.current.forEach(clearTimeout);
  }, [inView, termKey]);

  return (
    <div className="pipeline-section">
      <div className="pipeline-inner">
        <div className="pipeline-copy">
          <div className="section-tag">Live Trace</div>
          <h2 className="pipeline-heading">Watch the agents<br />work in real-time.</h2>
          <p className="pipeline-sub">
            Six specialized agents collaborate in under two seconds — classifying, empathizing, solving, and predicting — before a single human touches the ticket.
          </p>
          <ul className="pipeline-bullets">
            <li><span className="bullet-dot" />Parallel agent execution</li>
            <li><span className="bullet-dot" />Cross-agent context sharing</li>
            <li><span className="bullet-dot" />Sub-2s end-to-end latency</li>
          </ul>
        </div>

        <div className="terminal-wrap" ref={termRef}>
          <div className="terminal-window" key={termKey}>
            <div className="terminal-titlebar">
              <span className="tbar-dot red" />
              <span className="tbar-dot yellow" />
              <span className="tbar-dot green" />
              <span className="tbar-label">agent-trace — zsh</span>
            </div>
            <div className="terminal-body">
              {PIPELINE_LINES.slice(0, visibleCount).map((line) => (
                <div key={line.id} className={`t-line t-${line.type}`}>
                  {line.type === "cmd" && (
                    <><span className="t-prompt">$</span> {line.text}<span className="t-cursor" /></>
                  )}
                  {line.type === "info" && (
                    <><span className="t-dim">[{String(line.id).padStart(2, "0")}]</span> <span className="t-muted">{line.text}</span></>
                  )}
                  {line.type === "agent" && (
                    <><span className="t-dim">[{String(line.id).padStart(2, "0")}]</span> <span className="t-tag">◆ {line.agent}</span> <span className="t-result">{line.result}</span>{line.meta && <span className="t-meta">  {line.meta}</span>}</>
                  )}
                  {line.type === "success" && (
                    <><span className="t-dim">[{String(line.id).padStart(2, "0")}]</span> <span className="t-success">✓ {line.text}</span> <span className="t-time">{line.time}</span></>
                  )}
                </div>
              ))}
              {visibleCount > 0 && visibleCount < PIPELINE_LINES.length && (
                <div className="t-line"><span className="t-cursor-blink">▌</span></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Feature Modal ───────────────────────────────────────── */
function FeatureModal({ feature, onClose }) {
  if (!feature) return null;
  return (
    <div className="feature-modal-overlay" onClick={onClose}>
      <motion.div
        className="feature-modal-content"
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-icon-wrapper" style={{ background: feature.color, color: feature.iconColor }}>
            {feature.icon}
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <h2 className="modal-title">{feature.title}</h2>
          <p className="modal-description">{feature.description}</p>
          <div className="modal-details-grid">
            {feature.details.map((detail, idx) => (
              <div key={idx} className="modal-detail-item">
                <div className="detail-check">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span>{detail}</span>
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button className="btn-modal-action" onClick={onClose}>Got it, Awesome!</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main Landing Component ──────────────────────────────── */
export default function Landing({ user, onStart, onAdminLogin, onDashboard, onNavigate }) {
  const [activeModal, setActiveModal] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 500);
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsMenuOpen(false);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const features = [
    {
      icon: <BarChart2 size={24} />, iconColor: "#0071e3", color: "rgba(0,113,227,0.1)",
      title: "Smart Classification",
      description: "Automatically categorizes complaints into Billing, Technical, Delivery, Service, and Security with high accuracy.",
      details: ["AI-driven categorization engine with surgical precision.", "Automated tagging for instant department routing.", "98% accuracy matching historical records.", "Dynamic category expansion based on emerging trends."],
    },
    {
      icon: <Zap size={24} />, iconColor: "#34c759", color: "rgba(52,199,89,0.1)",
      title: "Priority Detection",
      description: "Instantly identifies urgent issues and escalates critical complaints to human support immediately.",
      details: ["Real-time urgency scoring for every incoming ticket.", "Contextual escalation for high-value enterprise cases.", "Automated SLA monitoring and priority weighting.", "Smart alerts for multi-agent intervention triggers."],
    },
    {
      icon: <Activity size={24} />, iconColor: "#ff9500", color: "rgba(255,149,0,0.1)",
      title: "Sentiment Analysis",
      description: "Analyzes customer emotions to gauge satisfaction levels and emotional context accurately.",
      details: ["Deep emotional context extraction from text and tone.", "Real-time CSAT trend monitoring.", "Escalation of frustrated users to specialized empathy agents.", "Comprehensive tone consistency reports for brand voice."],
    },
    {
      icon: <Lightbulb size={24} />, iconColor: "#007aff", color: "rgba(0,122,255,0.1)",
      title: "Solution Suggestions",
      description: "Generates intelligent, actionable solutions tailored to each unique complaint type and context.",
      details: ["LLM-powered draft responses tailored to specific issues.", "Knowledge Base cross-referencing for verified facts.", "Actionable multi-step resolutions for recurring problems.", "Tone-optimized templates for professional communication."],
    },
    {
      icon: <Target size={24} />, iconColor: "#5ac8fa", color: "rgba(90,200,250,0.1)",
      title: "Satisfaction Prediction",
      description: "Predicts customer satisfaction with proposed resolutions using advanced ML algorithms.",
      details: ["Proprietary ML algorithms for predicting outcome success.", "Resolution effectiveness forecasting before sending.", "Proactive adjustment suggestions to maximize CSAT.", "Continuous feedback loop integration for self-healing."],
    },
    {
      icon: <Search size={24} />, iconColor: "#14b8a6", color: "rgba(20,184,166,0.1)",
      title: "Pattern Recognition",
      description: "Finds similar past complaints to ensure consistent and reliable handling of issues.",
      details: ["Global historical trend identification across data silos.", "Instant duplicate detection and resolution linking.", "Root cause analysis for systematic organizational issues.", "Automatic knowledge base optimization and updates."],
    },
  ];

  const faqs = [
    { question: "How does the multi-agent system work?", answer: "This platform uses a specialized cluster of AI agents. Each agent handles a specific task—like sentiment analysis or classification—and they cross-communicate to ensure the final resolution is accurate and context-aware." },
    { question: "Is my data secure?", answer: "Absolutely. We use enterprise-grade AES-256 encryption for all data at rest and in transit. Your complaints and customer details are never used for training public models." },
    { question: "Can I integrate this with my existing CRM?", answer: "Yes, this platform is designed with an API-first approach, allowing seamless integration with popular CRMs like Salesforce, HubSpot, and Zendesk." },
    { question: "What is the accuracy rate of the AI?", answer: "Currently, our agentic orchestration performs with a 98% surgical precision in classification and a 95% success rate in suggested resolutions." },
  ];

  const MARQUEE_COMPANIES = ["NVIDIA", "Apple", "Google", "Microsoft", "Amazon", "Salesforce", "Meta", "Tesla", "OpenAI", "Stripe", "Anthropic", "Databricks"];

  const metricsData = [
    { animated: { from: 10, to: 2, prefix: "< ", suffix: "s", duration: 1.5 }, label: "Response Time", desc: "From submission to resolution in under two seconds using high-frequency agentic reasoning." },
    { animated: { from: 0, to: 100, suffix: "%" }, label: "Transparency", desc: "Every step of the resolution process is visible and fully auditable by users and operators." },
    { animated: { from: 0, to: 99, suffix: "%" }, label: "Empathy Rate", desc: "Sentiment-aware agents that adapt tone and approach to the emotional context of each user." },
    { staticValue: "∞", label: "Scale", desc: "Architecture built to handle millions of concurrent resolutions without any performance degradation." },
    { staticValue: "↺", label: "Self-Learning", desc: "Internal feedback loops that improve agent precision and accuracy with every single interaction." },
    { animated: { from: 100, to: 0, suffix: "" }, label: "Risk Policy", desc: "Kernel-level encryption and complete data isolation within your enterprise ecosystem." },
  ];

  return (
    <div className="landing-container">

      {/* ── Header ── */}
      <header className={`landing-header ${isMenuOpen ? "menu-open" : ""} ${scrolled ? "scrolled" : ""}`}>
        <div className="header-left">
          <div className="navbar-brand ecohealth-logo" onClick={scrollToTop}>
            <div className="logo-orb">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="18" fill="url(#og)" fillOpacity="0.15" />
                <circle cx="18" cy="18" r="17.5" stroke="url(#og)" strokeOpacity="0.2" />
                <path d="M18 8L10 12V18C10 23.41 13.41 28.47 18 30C22.59 28.47 26 23.41 26 18V12L18 8Z" fill="url(#sg)" />
                <path d="M18 13V17M18 21H18.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <defs>
                  <linearGradient id="og" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse"><stop stopColor="#0071e3" /><stop offset="1" stopColor="#0a84ff" /></linearGradient>
                  <linearGradient id="sg" x1="10" y1="8" x2="26" y2="30" gradientUnits="userSpaceOnUse"><stop stopColor="#0071e3" /><stop offset="1" stopColor="#3b82f6" /></linearGradient>
                </defs>
              </svg>
            </div>
            <span className="logo-text">AI Support</span>
          </div>
        </div>

        <nav className={`nav-links ${isMenuOpen ? "is-open" : ""}`}>
          <div className="mobile-auth-buttons">
            <button className="btn-admin" onClick={() => { onStart(); setIsMenuOpen(false); }}>
              {user?.role === "Admin" ? "Admin Dash" : (user ? "Dashboard" : "Sign In")}
            </button>
            {!user && (
              <button className="btn-admin admin-special" onClick={() => { onAdminLogin(); setIsMenuOpen(false); }} style={{ marginTop: "10px" }}>
                Admin Login
              </button>
            )}
          </div>
          <button onClick={() => { scrollToTop(); setIsMenuOpen(false); }} className="nav-btn-home">Home</button>
          <button onClick={() => { scrollToSection("mission"); }}>Mission</button>
          <button onClick={() => { scrollToSection("features"); }}>Features</button>
          <button onClick={() => { scrollToSection("goals"); }}>Goals</button>
          <button onClick={() => { scrollToSection("testimonials"); }}>Testimonials</button>
          <button onClick={() => { scrollToSection("contact"); }}>Contact</button>
        </nav>

        <div className="header-right">
          <div className="header-actions">
            <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <span className={`hamburger ${isMenuOpen ? "active" : ""}`} />
            </button>
          </div>
          <div className="auth-buttons">
            <button className="btn-admin" onClick={onStart}>
              {user?.role === "Admin" ? "Admin Panel" : (user ? "Dashboard" : "Sign In")}
            </button>
            {!user && (
              <button className="btn-admin admin-special" onClick={onAdminLogin}>Admin Login</button>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-grid-bg" />
        <motion.div className="hero-content" style={{ y: heroY, opacity: heroOpacity }}>
          <motion.div className="hero-badge" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="hero-badge-dot" /><span>Enterprise AI Platform</span>
          </motion.div>

          <motion.h1 className="hero-title" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            AI for Enterprise Support<br />& Multi-Agent Control
          </motion.h1>

          <motion.p className="hero-subtitle" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            Bridging autonomous intelligence and human oversight to create absolute precision and thriving customer success.
          </motion.p>

          <motion.div className="hero-cta" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            <button className="btn-cta btn-primary" onClick={() => scrollToSection("solutions-demo")}>
              Explore Solutions <span className="arrow">→</span>
            </button>
            <button className="btn-secondary" onClick={() => scrollToSection("features")}>
              Learn More
            </button>
          </motion.div>

          <motion.div className="features-grid-mini" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.5 }}>
            {[
              { label: "Recursive Reasoning" },
              { label: "Kernel Security" },
              { label: "Predictive Resolve" },
              { label: "Atomic Latency" },
            ].map(({ label }) => (
              <div key={label} className="feature-mini">
                <span className="fmini-dot" />
                <span>{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Trusted By Marquee ── */}
      <section className="trusted-by-section">
        <p className="trusted-by-label">Trusted by teams at leading companies</p>
        <div className="marquee-outer">
          <div className="marquee-track">
            {[...MARQUEE_COMPANIES, ...MARQUEE_COMPANIES].map((name, i) => (
              <span key={i} className="company-name">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vision & Mission ── */}
      <section className="vision-mission-section" id="mission">
        <div className="container">
          <div className="vision-box">
            <div className="section-tag">Our Vision</div>
            <h2 className="vision-text">
              To redefine the global standard of customer success through autonomous AI intelligence.
            </h2>
          </div>
          <div className="mission-content">
            <div className="mission-card">
              <div className="section-tag">Our Mission</div>
              <h3 className="mission-title">Empowering Enterprises with Agentic Precision</h3>
              <p className="mission-description">
                Our mission is to bridge the gap between complex technical logic and human-centric service.
                We deploy high-frequency agentic clusters that analyze, classify, and resolve issues with
                surgical precision. By combining emotional intelligence with recursive reasoning, we ensure
                that every customer feels heard, valued, and satisfied in real-time, reducing resolution
                cycles from days to mere seconds.
              </p>
              <div className="mission-stats">
                <div className="stat-item">
                  <span className="stat-value">98%</span>
                  <span className="stat-label">Surgical Accuracy</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">&lt; 2s</span>
                  <span className="stat-label">Response Latency</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features (editorial list) ── */}
      <section className="features-editorial" id="features">
        <div className="features-editorial-inner">
          <div className="features-editorial-header">
            <div className="section-tag">Platform</div>
            <h2 className="features-editorial-heading">Six agents.<br />One outcome.</h2>
            <p className="features-editorial-sub">Specialized AI working in concert to handle every complaint with surgical precision. Click any to expand.</p>
          </div>

          <div className="feature-rows-list">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-row-item"
                onClick={() => setActiveModal(feature)}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: index * 0.06, duration: 0.4 }}
                viewport={{ once: true }}
              >
                <span className="feature-row-num">0{index + 1}</span>
                <div className="feature-row-body">
                  <h3 className="feature-row-name">{feature.title}</h3>
                  <p className="feature-row-desc">{feature.description}</p>
                </div>
                <span className="feature-row-cta">Details ↗</span>
              </motion.div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {activeModal && activeModal.title && (
            <FeatureModal feature={activeModal} onClose={() => setActiveModal(null)} />
          )}
        </AnimatePresence>
      </section>

      {/* ── Agent Pipeline Terminal ── */}
      <AgentTerminal />

      {/* ── Metrics Section ── */}
      <section className="metrics-section" id="goals">
        <div className="section-header">
          <h2 className="section-title">Built to <span>Perform</span></h2>
          <p className="section-subtitle">Every number a promise. Every promise kept.</p>
        </div>

        <div className="metrics-showcase">
          {metricsData.map((m, idx) => (
            <div key={idx} className="metric-cell">
              <div className="metric-large-value">
                {m.staticValue
                  ? m.staticValue
                  : <AnimatedNumber {...m.animated} />
                }
              </div>
              <div className="metric-cell-label">
                <span className="metric-live-dot" />
                {m.label}
              </div>
              <p className="metric-cell-desc">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Demo Solutions ── */}
      <section className="demo-section" id="solutions-demo">
        <div className="section-header">
          <h2 className="section-title">Intelligence <span>In Action</span></h2>
          <p className="section-subtitle">Real-world scenarios handled by our multi-agent architecture.</p>
        </div>

        <div className="demo-container">
          {[
            { type: "Billing", case: "Unexpected Overcharge", process: "Agent identifies billing error → Cross-references history → Generates refund proposal → Alerts Team.", impact: "Reduction in resolution time", icon: "◈", color: "rgba(0,113,227,0.06)" },
            { type: "Technical", case: "System Latency Issue", process: "Monitors logs → Classifies root cause → Provides troubleshooting steps → Predicts fix probability.", impact: "Approx surgical accuracy", icon: "◈", color: "rgba(52,199,89,0.06)" },
            { type: "Security", case: "Suspicious Login Attempt", process: "Detects anomaly → Triggers immediate lockdown → Notifies security agents → Initiates identity verification.", impact: "Real-time threat mitigation", icon: "◈", color: "rgba(255,59,48,0.06)" },
          ].map((demo, idx) => (
            <motion.div
              key={idx}
              className="demo-scenario-card"
              style={{ "--demo-accent": demo.color }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="demo-card-head">
                <span className="demo-type-badge">{demo.type}</span>
                <span className="demo-icon-mini" style={{ color: "var(--accent-primary)", fontSize: "1.1rem" }}>{demo.icon}</span>
              </div>
              <h4>{demo.case}</h4>
              <div className="demo-process-line"><p>{demo.process}</p></div>
              <div className="demo-impact-footer">
                <span className="impact-label">Impact:</span>
                <span className="impact-value">{demo.impact}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="testimonials-section" id="testimonials">
        <div className="section-header">
          <h2 className="section-title">Client <span>Feedback</span></h2>
          <p className="section-subtitle">What industry leaders are saying about this platform.</p>
        </div>
        <div className="testimonials-grid">
          {[
            { name: "S. Johnson", role: "Operations Head", text: "The AI agent clusters have reduced our resolution cycles from hours to seconds.", rating: 5 },
            { name: "M. Chen", role: "Support Director", text: "Surgical precision in classification. The sentiment-aware routing is game-changing.", rating: 5 },
            { name: "E. Rodriguez", role: "Tech Lead", text: "Seamless API integration and enterprise-grade security. A benchmark system.", rating: 5 },
          ].map((t, idx) => (
            <motion.div
              key={idx}
              className="testimonial-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="testimonial-header">
                <div className="testimonial-id-badge"><span>{t.name.charAt(0)}</span></div>
                <div className="testimonial-info">
                  <h4>{t.name}</h4>
                  <p className="testimonial-role">{t.role}</p>
                </div>
              </div>
              <div className="rating-stars">{[...Array(t.rating)].map((_, i) => <span key={i} className="star">★</span>)}</div>
              <p className="testimonial-text">{t.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section">
        <div className="section-header">
          <h2 className="section-title">Common <span>Questions</span></h2>
          <p className="section-subtitle">Everything you need to know about our intelligence.</p>
        </div>
        <div className="faq-grid">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${activeFaq === index ? "active" : ""}`}
              onClick={() => setActiveFaq(activeFaq === index ? null : index)}
            >
              <div className="faq-question">
                <h3>{faq.question}</h3>
                <span className="faq-toggle">{activeFaq === index ? "−" : "+"}</span>
              </div>
              <div className="faq-answer"><p>{faq.answer}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer" id="contact">
        <div className="footer-content">
          <div className="footer-section brand-info">
            <div className="navbar-brand ecohealth-logo" onClick={scrollToTop} style={{ marginBottom: "1.5rem", padding: 0 }}>
              <div className="logo-orb" style={{ width: "36px", height: "36px" }}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <circle cx="18" cy="18" r="18" fill="url(#fog)" fillOpacity="0.15" />
                  <path d="M18 8L10 12V18C10 23.41 13.41 28.47 18 30C22.59 28.47 26 23.41 26 18V12L18 8Z" fill="url(#fsg)" />
                  <defs>
                    <linearGradient id="fog" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse"><stop stopColor="#0071e3" /><stop offset="1" stopColor="#0a84ff" /></linearGradient>
                    <linearGradient id="fsg" x1="10" y1="8" x2="26" y2="30" gradientUnits="userSpaceOnUse"><stop stopColor="#0071e3" /><stop offset="1" stopColor="#3b82f6" /></linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="logo-text">AI Support</span>
            </div>
            <h3 className="connect-title">AI Complaint Agent</h3>
          </div>
          <div className="footer-section">
            <h4>Ecosystem</h4>
            <button onClick={() => scrollToSection("features")} className="footer-btn">Neural Grid</button>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <button onClick={() => setActiveModal("privacy")} className="footer-btn">Privacy Policy</button>
            <button onClick={() => setActiveModal("terms")} className="footer-btn">Terms</button>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 AI Complaint Agent.</p>
        </div>
      </footer>

      {/* ── Legal Modals ── */}
      {activeModal && typeof activeModal === "string" && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModal(null)}>&times;</button>
            <div className="modal-body">
              <h2>{activeModal === "privacy" ? "Privacy Policy" : "Terms of Service"}</h2>
              <p>This is a placeholder for the {activeModal} content. Your data is handled with enterprise-grade security within our neural ecosystem.</p>
              <button className="btn-primary" onClick={() => setActiveModal(null)} style={{ marginTop: "2rem", width: "100%" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showScrollTop && (
        <button className="scroll-to-top" onClick={scrollToTop}><span>↑</span></button>
      )}

      <CookieConsent onNavigate={onNavigate} />
    </div>
  );
}
