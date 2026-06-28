import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./PremiumApp.css";

import hero1 from "./assets/hero1.jpeg";
import hero2 from "./assets/hero2.jpeg";
import hero3 from "./assets/hero3.jpeg";
import hero4 from "./assets/hero4.jpeg";
import hero5 from "./assets/hero5.jpeg";
import prabhupadaImg from "./assets/prabhupada2.jpeg"; // Ensure this path is correct

import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Disc3,
  Gauge,
  Library,
  LoaderCircle,
  Mic,
  Music2,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Sun,
  Moon,
  UploadCloud,
  Zap
} from "lucide-react";

const pageTransition = {
  hidden: { opacity: 0, y: 50, scale: 0.95, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, y: -50, scale: 0.95, filter: "blur(10px)" }
};

const heroImages = [hero1, hero2, hero3, hero4, hero5];

const navLinks = [
  { label: "Home", target: "home" },
  { label: "Tune Finder", target: "finder" },
  { label: "Library", target: "library" },
  { label: "About", target: "about" },
  { label: "Admin", target: "admin" }
];

const features = [
  {
    icon: Zap,
    title: "AI Recognition",
    copy: "Recognize devotional tunes within seconds using intelligent audio matching."
  },
  {
    icon: Library,
    title: "Huge Library",
    copy: "Maintain a growing collection of Kirtans and Bhajans."
  },
  {
    icon: Gauge,
    title: "Fast Results",
    copy: "Receive similarity results instantly after recording."
  }
];

const stats = [
  { value: "500+", label: "Bhajans" },
  { value: "98%", label: "Accuracy" },
  { value: "2000+", label: "Searches" }
];

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

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Auto-carousel timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

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

  return (


    
    <div className={`app-root ${theme}-mode`}>
      {/* =========================================
          FULL SCREEN IMAGE CAROUSEL BACKGROUND
      ========================================== */}
      <div className="fullscreen-carousel-container">
        {heroImages.map((imgUrl, idx) => (
          <img
            key={idx}
            src={imgUrl}
            alt="Devotional Background"
            className={`fullscreen-image ${idx === currentImage ? "active-image" : ""}`}
          />
        ))}
        {/* Glass overlay to make 3D cards pop out and text readable */}
        <div className="fullscreen-glass-overlay"></div>
        
        {/* Floating Particles in Background */}
        <div className="floating-particles">
          <span className="particle p1">✨</span>
          <span className="particle p2">🪷</span>
          <span className="particle p3">🌸</span>
          <span className="particle p4">✨</span>
        </div>
      </div>

      {/* =========================================
          APPLICATION FOREGROUND CONTENT
      ========================================== */}
      <div className="app-content-layer">
        <header className="glass-navbar">
          <div className="logo" onClick={() => openPage("home")}>
            <Music2 className="logo-icon-3d" size={32} />
            <h2>Hare Krishna</h2>
          </div>
          <div className="nav-controls">
            <nav className="nav-menu">
              {navLinks.map((item) => (
                <button
                  key={item.target}
                  className={`nav-btn ${activePage === item.target ? "active-nav" : ""}`}
                  onClick={() => openPage(item.target)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <button className="theme-toggle-3d" onClick={toggleTheme}>
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </header>

        <main className="main-viewport">
          <AnimatePresence mode="wait">
            {/* HOME PAGE */}
            {activePage === "home" && (
              <motion.div
                key="home"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageTransition}
                transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
                className="page-container"
              >
                <div className="home-hero-content">
                  <h1 className="title-3d">
                    🦚 Hare Krishna <br /> <span className="highlight-3d">Tune Finder</span>
                  </h1>
                  <p className="subtitle-3d">
                    Recognize Bhajans, Kirtans and Devotional Tunes instantly using advanced Artificial Intelligence.
                  </p>
                  <div className="cta-buttons">
                    <button className="btn-3d primary-3d" onClick={() => openPage("finder")}>
                      <Mic size={20} /> Start Finding
                    </button>
                    <button className="btn-3d secondary-3d" onClick={() => openPage("library")}>
                      <Library size={20} /> Browse Library
                    </button>
                  </div>
                  
                  {/* Slider Controls attached to Hero content */}
                  <div className="slider-controls-3d">
                    <button onClick={prevSlide} className="slider-arrow"><ChevronLeft size={24}/></button>
                    <div className="pips-container">
                      {heroImages.map((_, i) => (
                        <div key={i} className={`pip ${i === currentImage ? "pip-active" : ""}`} onClick={() => setCurrentImage(i)}></div>
                      ))}
                    </div>
                    <button onClick={nextSlide} className="slider-arrow"><ChevronRight size={24}/></button>
                  </div>
                </div>

                <div className="stats-grid">
                  {stats.map((item, index) => (
                    <div key={index} className="card-3d stat-card">
                      <div className="card-inner-glow"></div>
                      <h2>{item.value}</h2>
                      <p>{item.label}</p>
                    </div>
                  ))}
                </div>

                <div className="features-header">
                  <h2>✨ Why Choose Us?</h2>
                </div>
                
                <div className="features-grid">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div key={index} className="card-3d feature-card">
                        <div className="card-inner-glow"></div>
                        <div className="icon-3d-bubble">
                          <Icon size={32} />
                        </div>
                        <h3>{feature.title}</h3>
                        <p>{feature.copy}</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* FINDER PAGE */}
            {activePage === "finder" && (
              <motion.div
                key="finder"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageTransition}
                transition={{ duration: 0.5 }}
                className="page-container split-layout"
              >
                <div className="card-3d studio-card">
                  <div className="card-inner-glow"></div>
                  <h2>🎤 Recording Studio</h2>
                  <p>Sing or play your Kirtan. Our AI will analyze the acoustic vector.</p>
                  
                  <div className="mic-container-3d">
                    {recording && (
                      <>
                        <div className="wave-3d wave-1"></div>
                        <div className="wave-3d wave-2"></div>
                        <div className="wave-3d wave-3"></div>
                      </>
                    )}
                    <button
                      className={`master-mic-3d ${recording ? "is-recording" : ""}`}
                      onClick={recording ? stopRecording : startRecording}
                    >
                      <Mic size={48} />
                    </button>
                  </div>
                  
                  {recording && <div className="live-status-3d">⏺ RECORDING... {formatTime(recordingTime)}</div>}
                  {isProcessing && (
                    <div className="processing-3d">
                      <LoaderCircle size={28} className="spin-3d" />
                      <p>Calculating Matrices...</p>
                    </div>
                  )}
                  {audioURL && (
                    <div className="audio-playback-3d">
                      <audio controls src={audioURL} />
                    </div>
                  )}
                </div>

                <div className="card-3d studio-card">
                  <div className="card-inner-glow"></div>
                  <h2>🏆 Top Matches</h2>
                  {matches.length === 0 ? (
                    <div className="empty-state-3d">
                      <Disc3 size={60} className="spin-3d slow" />
                      <p>Awaiting audio input telemetry.</p>
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

            {/* LIBRARY PAGE */}
            {activePage === "library" && (
              <motion.div
                key="library"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageTransition}
                transition={{ duration: 0.5 }}
                className="page-container"
              >
                <div className="library-header-3d">
                  <h2>📚 Temple Archive</h2>
                  <div className="search-box-3d">
                    <Search size={18} />
                    <input
                      type="text"
                      placeholder="Search archive..."
                      value={tuneSearch}
                      onChange={(e) => setTuneSearch(e.target.value)}
                    />
                  </div>
                </div>

                {isLoadingTunes ? (
                  <div className="loading-state-3d">
                    <LoaderCircle size={40} className="spin-3d" />
                    <p>Accessing Cloud Database...</p>
                  </div>
                ) : tuneLoadError ? (
                  <div className="error-state-3d">
                    <AlertCircle size={40} />
                    <p>{tuneLoadError}</p>
                    <button className="btn-3d primary-3d" onClick={loadTunes}><RefreshCw size={16}/> Retry</button>
                  </div>
                ) : (
                  <div className="library-grid-3d">
                    {filteredTunes.map((tune, idx) => (
                      <div className="card-3d library-item" key={idx}>
                        <div className="card-inner-glow"></div>
                        <Music2 size={28} className="icon-teal" />
                        <h4>{tune}</h4>
                        <audio controls src={`http://127.0.0.1:8000/play/${tune}`} />
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ABOUT PAGE */}
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
                  <div className="card-inner-glow"></div>
                  <Sparkles size={50} className="icon-gold" />
                  <h2>About the Engine</h2>
                  <p>
                    Fusing divine tradition with neural network artificial intelligence. Record a kirtan 
                    and our cloud server calculates microtonal acoustic signatures against our master library in real-time.
                  </p>
                  <div className="checklist-3d">
                    <div><CheckCircle2 size={18}/> High Fidelity Audio Matching</div>
                    <div><CheckCircle2 size={18}/> Real-time Cloud Processing</div>
                    <div><CheckCircle2 size={18}/> Preserving Devotional Culture</div>
                    <div><CheckCircle2 size={18}/> Cross-Platform Optimization</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ADMIN PAGE */}
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
                    <div className="card-inner-glow"></div>
                    <h2>🔐 Security Gateway</h2>
                    <input
                      className="input-3d"
                      type="text"
                      placeholder="Admin ID"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                      className="input-3d"
                      type="password"
                      placeholder="Passphrase"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                    />
                    <button className="btn-3d primary-3d full-width" onClick={loginAdmin}>
                      <Shield size={18} /> Authenticate
                    </button>
                  </div>
                ) : (
                  <div className="card-3d admin-card-3d">
                    <div className="card-inner-glow"></div>
                    <h2>📤 Master Upload</h2>
                    <div className="dropzone-3d">
                      <input
                        type="file"
                        accept=".mp3"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
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
              <h3>🦚 Hare Krishna</h3>
              <p>Built with AI & Devotion.</p>
            </div>

            <div className="prabhupada-container">
    <img 
      src={prabhupadaImg} 
      alt="Srila Prabhupada" 
      className="prabhupada-img" 
    />
    <div className="prabhupada-text">
      <p className="founder-name">HDG A.C. Bhaktivedanta Swami Srila Prabhupada</p>
      <p className="founder-title">Founder-Acharya of ISKCON</p>
    </div>
  </div>
            <div className="footer-mantra-box">
              <p>Hare Krishna Hare Krishna<br/>Krishna Krishna Hare Hare<br/>Hare Rama Hare Rama<br/>Rama Rama Hare Hare</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}



export default PremiumApp;