import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {

  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [tunes, setTunes] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    loadTunes();
  }, []);

  const loadTunes = async () => {

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/tunes"
      );

      const data = await response.json();

      setTunes(data.tunes);

    } catch (error) {

      console.log(error);

    }
  };

  const uploadAudio = async (blob) => {

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

    setMatches(data.matches);

  } catch (error) {

    console.log(error);

    alert("Matching Failed");

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

    loadTunes();

  } catch (error) {

    console.log(error);

    alert(
      "Upload Failed"
    );

  }
};
  const startRecording = async () => {

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

    setRecording(true);
  };

  const stopRecording = () => {

    mediaRecorderRef.current.stop();

    setRecording(false);
  };

  return (
    <div className="container">

      <h1>🎵 Hare Krishna Tune Finder</h1>

      <hr />

      {!isAdmin ? (

  <div>

    <h2>Admin Login</h2>

    <input
      type="text"
      placeholder="Username"
      value={username}
      onChange={(e) =>
        setUsername(e.target.value)
      }
    />

    <br /><br />

    <input
      type="password"
      placeholder="Password"
      value={adminPassword}
      onChange={(e) =>
        setAdminPassword(e.target.value)
      }
    />

    <br /><br />

    <button onClick={loginAdmin}>
      Login
    </button>

  </div>

) : (

  <div>

    <h2>Admin Upload Panel</h2>

    <input
      type="file"
      accept=".mp3"
      onChange={(e) =>
        setSelectedFile(
          e.target.files[0]
        )
      }
    />

    <br /><br />

    <button onClick={uploadTune}>
      Upload Tune
    </button>

  </div>

)}
      <h2>User Recording</h2>

      {!recording ? (
        <button onClick={startRecording}>
          Start Recording
        </button>
      ) : (
        <button onClick={stopRecording}>
          Stop Recording
        </button>
      )}

      {audioURL && (
        <div>

          <h3>Your Recording</h3>

          <audio
            controls
            src={audioURL}
          />

        </div>
      )}

      <hr />

      <h2>Top Matches</h2>

      {matches.map((item, index) => (

        <div key={index}>

          <h3>{item.filename}</h3>

          <p>
            Similarity: {item.score}%
          </p>

          <audio
            controls
            src={
              "http://127.0.0.1:8000/play/" +
              item.filename
            }
          />

          <hr />

        </div>

      ))}


      

      {isAdmin && (
        <>
          <h2>Available Tunes</h2>

          {tunes.map((tune, index) => (
            <div key={index}>
              <p>{tune}</p>

              <audio
                controls
                src={
                  "http://127.0.0.1:8000/play/" +
                  tune
                }
              />

              <hr />
            </div>
          ))}
        </>
      )}

    </div>
  );
}

export default App;