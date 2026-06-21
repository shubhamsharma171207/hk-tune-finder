import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Disc3,
  Gauge,
  Headphones,
  Library,
  LoaderCircle,
  Menu,
  Mic,
  Music2,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";
import "./App.css";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const navLinks = [
  { label: "Home", target: "home" },
  { label: "Tune Finder", target: "tune-finder" },
  { label: "Library", target: "library" },
  { label: "About", target: "about" },
  { label: "Admin", target: "admin" },
];

const features = [
  {
    icon: Zap,
    title: "Instant Recognition",
    copy: "Capture a short devotional phrase and receive nearby tune matches in moments.",
  },
  {
    icon: Library,
    title: "Large Tune Library",
    copy: "Browse uploaded bhajans, kirtans, and devotional recordings from the admin library.",
  },
  {
    icon: Gauge,
    title: "Accurate Matching",
    copy: "Results are ranked by similarity so the closest tune always gets the spotlight.",
  },
];

const stats = [
  { value: "500+", label: "Tunes Stored" },
  { value: "2000+", label: "Searches" },
  { value: "98%", label: "Recognition Accuracy" },
];

function PremiumApp() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [tunes, setTunes] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [activePage, setActivePage] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [tuneSearch, setTuneSearch] = useState("");
  const [isLoadingTunes, setIsLoadingTunes] = useState(true);
  const [tuneLoadError, setTuneLoadError] = useState("");
  const [recordingError, setRecordingError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const loadTunes = useCallback(async () => {
    setIsLoadingTunes(true);
    setTuneLoadError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/tunes"
      );

      if (!response.ok) {
        throw new Error("Unable to load tunes");
      }

      const data = await response.json();

      setTunes(data.tunes || []);
    } catch (error) {
      console.log(error);
      setTuneLoadError("Tune library could not be loaded. Check that the backend is running.");
    } finally {
      setIsLoadingTunes(false);
    }
  }, []);

  useEffect(() => {
    const loader = window.setTimeout(() => {
      loadTunes();
    }, 0);

    return () => window.clearTimeout(loader);
  }, [loadTunes]);

  useEffect(() => {
    if (!recording) {
      return undefined;
    }

    const timer = setInterval(() => {
      setRecordingTime((seconds) => seconds + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [recording]);

  const uploadAudio = async (blob) => {
    setIsProcessing(true);
    setRecordingError("");

    const formData = new FormData();

    formData.append(
      "file",
      blob,
      "recording.webm"
    );

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/match-audio",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      setMatches(data.matches || []);
    } catch (error) {
      console.log(error);
      setRecordingError("Matching failed. Please try recording again.");

      alert("Matching Failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const loginAdmin = () => {
    if (
      username === "admin" &&
      adminPassword === "harekrishna123"
    ) {
      setIsAdmin(true);

      alert("Admin Login Success");
    } else {
      alert("Invalid Credentials");
    }
  };

  const uploadTune = async () => {
    if (!selectedFile) {
      alert("Select MP3 First");

      return;
    }

    setUploadStatus("Uploading tune...");

    const formData = new FormData();

    formData.append(
      "file",
      selectedFile
    );

    formData.append(
      "password",
      adminPassword
    );

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/upload-tune",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!data.success) {
        alert(
          data.message
        );

        return;
      }

      alert(
        "Tune Uploaded: " +
        data.filename
      );

      setUploadStatus("Tune uploaded successfully.");
      setSelectedFile(null);
      loadTunes();
    } catch (error) {
      console.log(error);
      setUploadStatus("Upload failed. Please try again.");

      alert(
        "Upload Failed"
      );
    }
  };

  const startRecording = async () => {
    setRecordingError("");

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const mediaRecorder =
        new MediaRecorder(stream);

      mediaRecorderRef.current =
        mediaRecorder;

      chunksRef.current = [];

      mediaRecorder.ondataavailable =
        (event) => {
          chunksRef.current.push(event.data);
        };

      mediaRecorder.onstop = () => {
        const blob = new Blob(
          chunksRef.current,
          {
            type: "audio/webm",
          }
        );

        const url =
          URL.createObjectURL(blob);

        setAudioURL(url);

        uploadAudio(blob);
      };

      mediaRecorder.start();

      setRecordingTime(0);
      setRecording(true);
    } catch (error) {
      console.log(error);
      setRecordingError("Microphone access is needed to listen for a tune.");
      alert("Microphone access failed");
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) {
      return;
    }

    mediaRecorderRef.current.stop();

    setRecording(false);
  };

  const openPage = (target) => {
    setActivePage(target);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];

    if (file) {
      if (!file.name.toLowerCase().endsWith(".mp3")) {
        alert("Select MP3 First");
        return;
      }

      setSelectedFile(file);
      setUploadStatus("");
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = String(seconds % 60).padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
  };

  const visibleMatches = matches.slice(0, 5);

  const filteredTunes = useMemo(() => {
    const searchValue = tuneSearch.trim().toLowerCase();

    if (!searchValue) {
      return tunes;
    }

    return tunes.filter((tune) =>
      tune.toLowerCase().includes(searchValue)
    );
  }, [tuneSearch, tunes]);

  const renderTuneEmptyState = () => {
    if (isLoadingTunes) {
      return (
        <div className="empty-state is-loading">
          <LoaderCircle className="spin-icon" size={36} />
          <p>Loading devotional tune library...</p>
        </div>
      );
    }

    if (tuneLoadError) {
      return (
        <div className="empty-state is-error">
          <AlertCircle size={36} />
          <p>{tuneLoadError}</p>
          <button className="text-button" onClick={loadTunes} type="button">
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="empty-state">
        <Disc3 size={36} />
        <p>No tunes found.</p>
      </div>
    );
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="navbar">
        <button
          className="brand"
          onClick={() => openPage("home")}
          type="button"
        >
          <span className="brand-mark">
            <Music2 size={22} />
          </span>
          <span>
            <strong>HK Tune Finder</strong>
            <small>Devotional recognition</small>
          </span>
        </button>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <button
              key={link.target}
              className={activePage === link.target ? "is-active" : ""}
              onClick={() => openPage(link.target)}
              type="button"
              aria-current={activePage === link.target ? "page" : undefined}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <button
          className="menu-button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {mobileMenuOpen && (
          <motion.nav
            className="mobile-nav"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {navLinks.map((link) => (
              <button
                key={link.target}
                className={activePage === link.target ? "is-active" : ""}
                onClick={() => openPage(link.target)}
                type="button"
                aria-current={activePage === link.target ? "page" : undefined}
              >
                {link.label}
              </button>
            ))}
          </motion.nav>
        )}
      </header>

      <main className="page-stage">
        <AnimatePresence mode="wait">
        {activePage === "home" && (
        <motion.div
          key="home"
          className="page-view"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
        <section className="hero-section section-pad" id="home">
          <div className="particle-field" aria-hidden="true">
            {Array.from({ length: 18 }).map((_, index) => (
              <span key={index} />
            ))}
          </div>

          <motion.div
            className="hero-copy"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.65 }}
          >
            <span className="eyebrow">
              <Sparkles size={16} />
              Sacred sound search
            </span>
            <h1>Hare Krishna Tune Finder</h1>
            <p>
              Identify Hare Krishna Bhajans, Kirtans and Devotional Tunes Within Seconds
            </p>
            <div className="hero-actions">
              <motion.button
                className="primary-button"
                onClick={() => openPage("tune-finder")}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Mic size={19} />
                Start Listening
              </motion.button>
              <motion.button
                className="secondary-button"
                onClick={() => openPage("library")}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Disc3 size={19} />
                Browse Tunes
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.75 }}
            aria-hidden="true"
          >
            <div className="orbital-ring">
              <div className="hero-disc">
                <Headphones size={54} />
              </div>
            </div>
            <div className="wave-stack">
              {Array.from({ length: 30 }).map((_, index) => (
                <span key={index} style={{ "--i": index }} />
              ))}
            </div>
          </motion.div>

          <ChevronDown className="scroll-cue" size={28} aria-hidden="true" />
        </section>
        <section className="stats-section section-pad">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div
                className="stat-card"
                key={stat.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </section>
        </motion.div>
        )}

        {activePage === "tune-finder" && (
        <motion.div
          key="tune-finder"
          className="page-view"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
        <section className="finder-grid section-pad" id="tune-finder">
          <motion.div
            className="recording-panel glass-panel"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55 }}
          >
            <div className="section-heading centered">
              <span className="eyebrow">
                <Activity size={16} />
                Tune Finder
              </span>
              <h2>User Recording</h2>
              <p>Record a short phrase from a bhajan or kirtan to begin matching.</p>
            </div>

            <div className={`mic-stage ${recording ? "is-recording" : ""}`}>
              <motion.button
                className="mic-button"
                onClick={!recording ? startRecording : stopRecording}
                type="button"
                aria-label={!recording ? "Start recording" : "Stop recording"}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Mic size={48} />
              </motion.button>
              <div className="mic-rings" aria-hidden="true" />
            </div>

            <div className="recording-status">
              <strong>
                {recording
                  ? "Listening now"
                  : isProcessing
                    ? "Finding the closest devotional tunes"
                    : "Ready to listen"}
              </strong>
              <span>
                {recording
                  ? formatTime(recordingTime)
                  : isProcessing
                    ? "Processing recording"
                    : "Tap the microphone to start"}
              </span>
            </div>

            {(recording || isProcessing) && (
              <div className="live-wave" aria-hidden="true">
                {Array.from({ length: 22 }).map((_, index) => (
                  <span key={index} style={{ "--i": index }} />
                ))}
              </div>
            )}

            {recordingError && (
              <div className="status-message is-error" role="alert">
                <AlertCircle size={18} />
                <span>{recordingError}</span>
              </div>
            )}

            {audioURL && (
              <motion.div
                className="recording-playback"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span>Your Recording</span>
                <audio controls src={audioURL} />
              </motion.div>
            )}
          </motion.div>

          <motion.div
            className="results-panel glass-panel"
            id="results"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            <div className="section-heading">
              <span className="eyebrow">
                <BarChart3 size={16} />
                Top Matches
              </span>
              <h2>Recognition Results</h2>
              <p>The top 5 matches appear here after recording.</p>
            </div>

            {visibleMatches.length === 0 ? (
              <div className="empty-state">
                <Disc3 size={36} />
                <p>No matches yet. Start listening to discover the closest tune.</p>
              </div>
            ) : (
              <div className="match-list">
                {visibleMatches.map((item, index) => (
                  <motion.article
                    className={`match-card ${index === 0 ? "top-match" : ""}`}
                    key={`${item.filename}-${index}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.07 }}
                  >
                    <div className="match-meta">
                      <span>{index === 0 ? "Top Match" : `Match ${index + 1}`}</span>
                      <h3>{item.filename}</h3>
                    </div>
                    <div className="match-score">
                      <strong>{item.score}%</strong>
                      <span>Similarity</span>
                    </div>
                    <audio
                      controls
                      src={
                        "http://127.0.0.1:8000/play/" +
                        item.filename
                      }
                    />
                  </motion.article>
                ))}
              </div>
            )}
          </motion.div>
        </section>
        </motion.div>
        )}

        {activePage === "library" && (
        <motion.div
          key="library"
          className="page-view"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
        <section className="library-section section-pad" id="library">
          <motion.div
            className="public-library glass-panel"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="library-hero">
              <div className="section-heading">
                <span className="eyebrow">
                  <Library size={16} />
                  Pre-installed Tunes
                </span>
                <h2>Tune Library</h2>
                <p>Browse the devotional recordings already available for playback.</p>
              </div>
              <label className="search-field">
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Search tunes"
                  value={tuneSearch}
                  onChange={(e) => setTuneSearch(e.target.value)}
                />
              </label>
            </div>

            <div className="public-tune-grid">
              {filteredTunes.length === 0 ? (
                renderTuneEmptyState()
              ) : (
                filteredTunes.map((tune, index) => (
                  <motion.article
                    className="public-tune-card"
                    key={`${tune}-${index}`}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <div className="tune-art">
                      <Disc3 size={34} />
                    </div>
                    <div className="tune-copy">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <h3>{tune}</h3>
                    </div>
                    <audio
                      controls
                      src={
                        "http://127.0.0.1:8000/play/" +
                        tune
                      }
                    />
                  </motion.article>
                ))
              )}
            </div>
          </motion.div>
        </section>
        </motion.div>
        )}

        {activePage === "about" && (
        <motion.div
          key="about"
          className="page-view"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
        <section className="features-section section-pad" id="about">
          <div className="section-heading centered narrow">
            <span className="eyebrow">
              <Sparkles size={16} />
              Built for devotional music
            </span>
            <h2>Fast, focused, and easy to use</h2>
          </div>

          <div className="feature-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.article
                  className="feature-card glass-panel"
                  key={feature.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  whileHover={{ y: -6 }}
                >
                  <span className="icon-badge">
                    <Icon size={24} />
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.copy}</p>
                </motion.article>
              );
            })}
          </div>
        </section>
        </motion.div>
        )}

        {activePage === "admin" && (
        <motion.div
          key="admin"
          className="page-view"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
        <section className="admin-section section-pad" id="admin">
          <div className="section-heading centered narrow">
            <span className="eyebrow">
              <Shield size={16} />
              Admin
            </span>
            <h2>Library Management</h2>
            <p>Upload and review devotional tune files with the existing admin workflow.</p>
          </div>

          {!isAdmin ? (
            <motion.div
              className="admin-login glass-panel"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.35 }}
            >
              <div>
                <h3>Admin Login</h3>
                <p>Sign in to upload tunes and view the stored library.</p>
              </div>

              <label>
                Username
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  placeholder="Password"
                  value={adminPassword}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      loginAdmin();
                    }
                  }}
                  onChange={(e) =>
                    setAdminPassword(e.target.value)
                  }
                />
              </label>

              <motion.button
                className="primary-button wide"
                onClick={loginAdmin}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Shield size={18} />
                Login
              </motion.button>
            </motion.div>
          ) : (
            <div className="admin-dashboard">
              <motion.div
                className="upload-panel glass-panel"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <div className="section-heading">
                  <span className="eyebrow">
                    <UploadCloud size={16} />
                    Upload
                  </span>
                  <h3>Admin Upload Panel</h3>
                  <p>Add an MP3 tune to the recognition library.</p>
                </div>

                <label
                  className="drop-zone"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                >
                  <UploadCloud size={36} />
                  <strong>
                    {selectedFile ? selectedFile.name : "Drag & drop an MP3 file"}
                  </strong>
                  <span>or select a file from your device</span>
                  <input
                    type="file"
                    accept=".mp3"
                    onChange={(e) =>
                      setSelectedFile(
                        e.target.files[0]
                      )
                    }
                  />
                </label>

                {uploadStatus && (
                  <div className="status-message" role="status">
                    {uploadStatus.includes("successfully") ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <LoaderCircle className="spin-icon" size={18} />
                    )}
                    <span>{uploadStatus}</span>
                  </div>
                )}

                <motion.button
                  className="primary-button wide"
                  onClick={uploadTune}
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <UploadCloud size={18} />
                  Upload Tune
                </motion.button>
              </motion.div>

              <motion.div
                className="library-panel glass-panel"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: 0.08 }}
              >
                <div className="library-header">
                  <div className="section-heading">
                    <span className="eyebrow">
                      <Library size={16} />
                      Available Tunes
                    </span>
                    <h3>Tune Library</h3>
                  </div>
                  <label className="search-field">
                    <Search size={18} />
                    <input
                      type="search"
                      placeholder="Search tunes"
                      value={tuneSearch}
                      onChange={(e) => setTuneSearch(e.target.value)}
                    />
                  </label>
                </div>

                <div className="tune-table">
                  {filteredTunes.length === 0 ? (
                    renderTuneEmptyState()
                  ) : filteredTunes.map((tune, index) => (
                    <article className="tune-row" key={`${tune}-${index}`}>
                      <div>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <strong>{tune}</strong>
                      </div>

                      <audio
                        controls
                        src={
                          "http://127.0.0.1:8000/play/" +
                          tune
                        }
                      />
                    </article>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </section>
        </motion.div>
        )}
        </AnimatePresence>
      </main>

      <footer className="footer">
        <div>
          <strong>Hare Krishna Tune Finder</strong>
          <span>Modern devotional audio recognition</span>
        </div>
        <nav aria-label="Footer navigation">
          {navLinks.map((link) => (
            <button
              key={link.target}
              onClick={() => openPage(link.target)}
              type="button"
            >
              {link.label}
            </button>
          ))}
        </nav>
        <p>Copyright 2026 Hare Krishna Tune Finder</p>
      </footer>
    </div>
  );
}

export default PremiumApp;
