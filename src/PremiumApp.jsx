import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./PremiumApp.css";

import hero1 from "./assets/hero1.jpeg";
import hero2 from "./assets/hero2.jpeg";
import hero3 from "./assets/hero3.jpeg";
import hero4 from "./assets/hero4.jpeg";
import hero5 from "./assets/hero5.jpeg";
import prabhupadaImg from "./assets/prabhupada2.jpeg";

import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Disc3,
  Gauge,
  Library,
  LoaderCircle,
  Menu,
  Mic,
  Moon,
  Music2,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Sun,
  UploadCloud,
  X,
  Zap
} from "lucide-react";

const heroImages = [hero1, hero2, hero3, hero4, hero5];

const navLinks = [
  { label: "Home", target: "home" },
  { label: "Kirtan Tune Finder", target: "finder" },
  { label: "Kirtan Library", target: "library" },
  { label: "Divine Engine", target: "about" },
  { label: "Admin Portal", target: "admin" }
];

const features = [
  {
    icon: Zap,
    title: "Divine AI Recognition",
    copy: "Recognize devotional melodies within seconds using precise audio intelligence."
  },
  {
    icon: Library,
    title: "Kirtan Library",
    copy: "Preserve and explore a growing collection of sacred Kirtans and Bhajans."
  },
  {
    icon: Gauge,
    title: "Instant Tune Darshan",
    copy: "Receive clear similarity results as soon as your recording is processed."
  }
];

const stats = [
  { value: "500+", label: "Sacred Bhajans" },
  { value: "98%", label: "Recognition Accuracy" },
  { value: "2000+", label: "Devotional Searches" }
];

const particleGlyphs = ["🦚", "🪷", "✨", "🕉", "📿", "🌸", "🦋"];

const buildParticles = () =>
  Array.from({ length: 42 }, (_, index) => ({
    id: index,
    glyph: particleGlyphs[index % particleGlyphs.length],
    left: `${(index * 37) % 100}%`,
    top: `${(index * 53) % 100}%`,
    size: 14 + ((index * 7) % 24),
    duration: 14 + ((index * 5) % 18),
    delay: -((index * 1.7) % 16),
    drift: index % 2 === 0 ? 1 : -1
  }));

const pageTransition = {
  hidden: { opacity: 0, y: 34, scale: 0.98, filter: "blur(12px)" },
  visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, y: -24, scale: 0.98, filter: "blur(10px)" }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08
    }
  }
};

const revealItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

function PremiumApp() {
  const [theme, setTheme] = useState("light");
  const [currentImage, setCurrentImage] = useState(0);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [tunes, setTunes] = useState([]);
  const [matches, setMatches] = useState([]);
  const [username, setUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [tuneSearch, setTuneSearch] = useState("");
  const [isLoadingTunes, setIsLoadingTunes] = useState(true);
  const [tuneLoadError, setTuneLoadError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const prefersReducedMotion = useReducedMotion();
  const particles = useMemo(() => buildParticles(), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 6500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [activePage]);

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const loadTunes = useCallback(async () => {
    setIsLoadingTunes(true);
    setTuneLoadError("");
    try {
      const response = await fetch("http://127.0.0.1:8000/tunes");
      if (!response.ok) throw new Error("Unable to load tunes");
      const data = await response.json();
      setTunes(data.tunes || []);
    } catch (error) {
      console.error(error);
      setTuneLoadError("Unable to load devotional library.");
    } finally {
      setIsLoadingTunes(false);
    }
  }, []);

  useEffect(() => {
    loadTunes();
  }, [loadTunes]);

  useEffect(() => {
    if (!recording) return;
    const timer = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [recording]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const uploadAudio = async (blob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", blob, "recording.webm");
    try {
      const response = await fetch("http://127.0.0.1:8000/match-audio", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error(error);
      alert("Matching Failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioURL(URL.createObjectURL(blob));
        uploadAudio(blob);
      };
      mediaRecorder.start();
      setRecording(true);
      setRecordingTime(0);
    } catch (err) {
      console.error(err);
      alert("Microphone Access Failed");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const loginAdmin = () => {
    if (username === "admin" && adminPassword === "harekrishna123") {
      setIsAdmin(true);
    } else {
      alert("Invalid Credentials");
    }
  };

  const uploadTune = async () => {
    if (!selectedFile) return alert("Select MP3 First");
    setUploadStatus("Uploading...");
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("password", adminPassword);
    try {
      const response = await fetch("http://127.0.0.1:8000/upload-tune", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      if (!data.success) {
        setUploadStatus("");
        return alert(data.message);
      }
      setUploadStatus("Upload Successful");
      setSelectedFile(null);
      loadTunes();
    } catch (err) {
      setUploadStatus("Upload Failed");
    }
  };

  const openPage = (page) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = String(seconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const filteredTunes = useMemo(() => {
    const value = tuneSearch.toLowerCase().trim();
    if (!value) return tunes;
    return tunes.filter((t) => t.toLowerCase().includes(value));
  }, [tuneSearch, tunes]);

  const renderNav = (className = "nav-menu") => (
    <nav className={className} aria-label="Primary navigation">
      {navLinks.map((item) => (
        <button
          key={item.target}
          className={`nav-btn ${activePage === item.target ? "active-nav" : ""}`}
          onClick={() => openPage(item.target)}
          aria-current={activePage === item.target ? "page" : undefined}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );

  return (
    <div className={`app-root ${theme}-mode`}>
      <div className="fullscreen-carousel-container" aria-hidden="true">
        {heroImages.map((imgUrl, idx) => (
          <img
            key={idx}
            src={imgUrl}
            alt=""
            className={`fullscreen-image ${idx === currentImage ? "active-image" : ""}`}
          />
        ))}
        <div className="fullscreen-glass-overlay" />
        <div className="theme-atmosphere" />
        <div className="floating-particles">
          {particles.map((particle) => (
            <span
              className="particle"
              key={particle.id}
              style={{
                left: particle.left,
                top: particle.top,
                fontSize: `${particle.size}px`,
                animationDuration: `${particle.duration}s`,
                animationDelay: `${particle.delay}s`,
                "--drift": particle.drift
              }}
            >
              {particle.glyph}
            </span>
          ))}
        </div>
      </div>

      <div className="app-content-layer">
        <header className="glass-navbar">
          <button className="logo" onClick={() => openPage("home")} aria-label="Go to home">
            <Music2 className="logo-icon-3d" size={32} />
            <span>
              <strong>Hare Krishna</strong>
              <small>Divine Tune Finder</small>
            </span>
          </button>

          <div className="nav-controls">
            {renderNav()}
            <button className="theme-toggle-3d" onClick={toggleTheme} aria-label="Toggle dark and light theme">
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={isMobileNavOpen}
            >
              <Menu size={22} />
            </button>
          </div>
        </header>

        <AnimatePresence>
          {isMobileNavOpen && (
            <>
              <motion.button
                className="mobile-nav-backdrop"
                aria-label="Close navigation menu"
                onClick={() => setIsMobileNavOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.aside
                className="mobile-nav-drawer"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                aria-label="Mobile navigation"
              >
                <div className="drawer-header">
                  <div>
                    <strong>Navigation</strong>
                    <small>Choose a sacred space</small>
                  </div>
                  <button onClick={() => setIsMobileNavOpen(false)} aria-label="Close navigation menu">
                    <X size={22} />
                  </button>
                </div>
                {renderNav("drawer-nav-menu")}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="main-viewport">
          <AnimatePresence mode="wait">
            {activePage === "home" && (
              <motion.div
                key="home"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageTransition}
                transition={{ duration: prefersReducedMotion ? 0.01 : 0.65, type: "spring", bounce: 0.22 }}
                className="page-container"
              >
                <motion.section className="home-hero-content" variants={staggerContainer} initial="hidden" animate="visible">
                  <motion.div className="hero-kicker" variants={revealItem}>
                    <Sparkles size={16} /> Bhakti powered recognition
                  </motion.div>
                  <motion.h1 className="title-3d" variants={revealItem}>
                    Hare Krishna <span>Divine Tune Finder</span>
                  </motion.h1>
                  <motion.p className="subtitle-3d" variants={revealItem}>
                    Recognize Bhajans, Kirtans and devotional melodies instantly with a serene AI listening experience.
                  </motion.p>
                  <motion.div className="cta-buttons" variants={revealItem}>
                    <button className="btn-3d primary-3d" onClick={() => openPage("finder")}>
                      <Mic size={20} /> Start Finding
                    </button>
                    <button className="btn-3d secondary-3d" onClick={() => openPage("library")}>
                      <Library size={20} /> Browse Library
                    </button>
                  </motion.div>

                  <motion.div className="slider-controls-3d" variants={revealItem} aria-label="Background image controls">
                    <button onClick={prevSlide} className="slider-arrow" aria-label="Previous background">
                      <ChevronLeft size={24} />
                    </button>
                    <div className="pips-container">
                      {heroImages.map((_, i) => (
                        <button
                          key={i}
                          className={`pip ${i === currentImage ? "pip-active" : ""}`}
                          onClick={() => setCurrentImage(i)}
                          aria-label={`Show background ${i + 1}`}
                          aria-current={i === currentImage}
                        />
                      ))}
                    </div>
                    <button onClick={nextSlide} className="slider-arrow" aria-label="Next background">
                      <ChevronRight size={24} />
                    </button>
                  </motion.div>
                </motion.section>

                <motion.section className="stats-grid" variants={staggerContainer} initial="hidden" animate="visible">
                  {stats.map((item) => (
                    <motion.div key={item.label} className="card-3d stat-card" variants={revealItem}>
                      <div className="card-inner-glow" />
                      <h2>{item.value}</h2>
                      <p>{item.label}</p>
                    </motion.div>
                  ))}
                </motion.section>

                <section>
                  <div className="features-header">
                    <h2>Why Devotees Choose This</h2>
                  </div>
                  <motion.div className="features-grid" variants={staggerContainer} initial="hidden" animate="visible">
                    {features.map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <motion.div key={feature.title} className="card-3d feature-card" variants={revealItem}>
                          <div className="card-inner-glow" />
                          <div className="icon-3d-bubble">
                            <Icon size={32} />
                          </div>
                          <h3>{feature.title}</h3>
                          <p>{feature.copy}</p>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </section>
              </motion.div>
            )}

            {activePage === "finder" && (
              <motion.div
                key="finder"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageTransition}
                transition={{ duration: prefersReducedMotion ? 0.01 : 0.5 }}
                className="page-container split-layout"
              >
                <div className="card-3d studio-card">
                  <div className="card-inner-glow" />
                  <div className="section-kicker">Kirtan Recognition Page</div>
                  <h2>Offer a Melody</h2>
                  <p>Sing or play your Kirtan. The listening engine will analyze the devotional audio signature.</p>

                  <div className="mic-container-3d">
                    {recording && (
                      <>
                        <div className="wave-3d wave-1" />
                        <div className="wave-3d wave-2" />
                        <div className="wave-3d wave-3" />
                      </>
                    )}
                    <button
                      className={`master-mic-3d ${recording ? "is-recording" : ""}`}
                      onClick={recording ? stopRecording : startRecording}
                      aria-label={recording ? "Stop recording" : "Start recording"}
                    >
                      <Mic size={48} />
                    </button>
                  </div>

                  {recording && <div className="live-status-3d">Recording Offering... {formatTime(recordingTime)}</div>}
                  {isProcessing && (
                    <div className="processing-3d">
                      <LoaderCircle size={28} className="spin-3d" />
                      <p>Listening for the divine tune...</p>
                    </div>
                  )}
                  {audioURL && (
                    <div className="audio-playback-3d">
                      <audio controls src={audioURL} />
                    </div>
                  )}
                </div>

                <div className="card-3d studio-card">
                  <div className="card-inner-glow" />
                  <div className="section-kicker">Divine Tune Matches</div>
                  <h2>Closest Kirtan Darshan</h2>
                  {matches.length === 0 ? (
                    <div className="empty-state-3d">
                      <Disc3 size={60} className="spin-3d slow" />
                      <p>Awaiting your devotional audio.</p>
                    </div>
                  ) : (
                    <div className="matches-list">
                      {matches.slice(0, 5).map((item, idx) => (
                        <div className="match-item-3d" key={idx}>
                          <div className="match-info">
                            <h4>{item.filename}</h4>
                            <span className="score-badge">{item.score}% Match</span>
                          </div>
                          <audio controls src={`http://127.0.0.1:8000/play/${item.filename}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activePage === "library" && (
              <motion.div
                key="library"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageTransition}
                transition={{ duration: prefersReducedMotion ? 0.01 : 0.5 }}
                className="page-container"
              >
                <div className="library-header-3d">
                  <div>
                    <div className="section-kicker">Kirtan Library</div>
                    <h2>Sacred Archive</h2>
                  </div>
                  <label className="search-box-3d">
                    <Search size={18} />
                    <input
                      type="text"
                      placeholder="Search Kirtan's..."
                      value={tuneSearch}
                      onChange={(e) => setTuneSearch(e.target.value)}
                    />
                  </label>
                </div>

                {isLoadingTunes ? (
                  <div className="loading-state-3d">
                    <LoaderCircle size={40} className="spin-3d" />
                    <p>Opening the sacred library...</p>
                  </div>
                ) : tuneLoadError ? (
                  <div className="error-state-3d">
                    <AlertCircle size={40} />
                    <p>{tuneLoadError}</p>
                    <button className="btn-3d primary-3d" onClick={loadTunes}>
                      <RefreshCw size={16} /> Retry
                    </button>
                  </div>
                ) : (
                  <motion.div className="library-grid-3d" variants={staggerContainer} initial="hidden" animate="visible">
                    {filteredTunes.map((tune, idx) => (
                      <motion.div className="card-3d library-item" key={`${tune}-${idx}`} variants={revealItem}>
                        <div className="card-inner-glow" />
                        <Music2 size={28} className="icon-teal" />
                        <h4>{tune}</h4>
                        <audio controls src={`http://127.0.0.1:8000/play/${tune}`} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}

            {activePage === "about" && (
              <motion.div
                key="about"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageTransition}
                className="page-container flex-center"
              >
                <div className="card-3d about-card-3d">
                  <div className="card-inner-glow" />
                  <Sparkles size={50} className="icon-gold" />
                  <div className="section-kicker">About the Divine Intelligence Engine</div>
                  <h2>Tradition Meets Listening Intelligence</h2>
                  <p>
                    Fusing devotional culture with neural audio recognition. Record a kirtan and the cloud server compares
                    its acoustic signature against the master library in real time.
                  </p>
                  <div className="checklist-3d">
                    <div><CheckCircle2 size={18} /> High Fidelity Audio Matching</div>
                    <div><CheckCircle2 size={18} /> Real-time Cloud Processing</div>
                    <div><CheckCircle2 size={18} /> Preserving Devotional Culture</div>
                    <div><CheckCircle2 size={18} /> Cross-Platform Optimization</div>
                  </div>
                </div>
              </motion.div>
            )}

            {activePage === "admin" && (
              <motion.div
                key="admin"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageTransition}
                className="page-container flex-center"
              >
                {!isAdmin ? (
                  <div className="card-3d admin-card-3d">
                    <div className="card-inner-glow" />
                    <div className="section-kicker">Temple Administration Portal</div>
                    <h2>Secure Entry</h2>
                    <input
                      className="input-3d"
                      type="text"
                      placeholder="Admin ID"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      aria-label="Admin ID"
                    />
                    <input
                      className="input-3d"
                      type="password"
                      placeholder="Passphrase"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      aria-label="Admin passphrase"
                    />
                    <button className="btn-3d primary-3d full-width" onClick={loginAdmin}>
                      <Shield size={18} /> Authenticate
                    </button>
                  </div>
                ) : (
                  <div className="card-3d admin-card-3d">
                    <div className="card-inner-glow" />
                    <div className="section-kicker">Administration Portal</div>
                    <h2>Upload Master Bhajan</h2>
                    <div className="dropzone-3d">
                      <input
                        type="file"
                        accept=".mp3"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        aria-label="Choose MP3 file"
                      />
                      <button className="btn-3d secondary-3d full-width" onClick={uploadTune}>
                        <UploadCloud size={18} /> Submit File
                      </button>
                    </div>
                    {uploadStatus && <div className="status-badge-3d">{uploadStatus}</div>}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="footer-3d">
          <div className="footer-grid">
            <div className="footer-brand">
              <h3>Hare Krishna</h3>
              <p>Built with AI and devotion.</p>
            </div>

            <div className="prabhupada-container">
              <img src={prabhupadaImg} alt="Srila Prabhupada" className="prabhupada-img" />
              <div className="prabhupada-text">
                <p className="founder-name">HDG A.C. Bhaktivedanta Swami Srila Prabhupada</p>
                <p className="founder-title">Founder-Acharya of ISKCON</p>
              </div>
            </div>

            <div className="footer-mantra-box">
              <p>Hare Krishna Hare Krishna<br />Krishna Krishna Hare Hare<br />Hare Rama Hare Rama<br />Rama Rama Hare Hare</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default PremiumApp;
