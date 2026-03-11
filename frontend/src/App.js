import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function App() {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState("");

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setMessage("Only .csv and .xlsx files are allowed (max 5 MB).");
      setStatus("error");
      return;
    }
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setStatus("idle");
      setMessage("");
      setSummary("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please upload a file first.");
      setStatus("error");
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("");
    setSummary("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email);

    try {
      const res = await axios.post(`${API_URL}/api/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });
      setStatus("success");
      setMessage(res.data.message);
      setSummary(res.data.summary);
    } catch (err) {
      setStatus("error");
      setMessage(
        err.response?.data?.error || "Something went wrong. Please try again."
      );
    }
  };

  const removeFile = () => {
    setFile(null);
    setStatus("idle");
    setMessage("");
    setSummary("");
  };

  return (
    <div className="app">
      {/* Background decoration */}
      <div className="bg-blur bg-blur-1" />
      <div className="bg-blur bg-blur-2" />

      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="logo">
            <span className="logo-icon">🐇</span>
            <span className="logo-text">Rabbitt AI</span>
          </div>
          <h1 className="title">Sales Insight Automator</h1>
          <p className="subtitle">
            Upload your sales data and receive an AI-generated executive summary
            straight to your inbox.
          </p>
        </header>

        {/* Steps indicator */}
        <div className="steps">
          <div className={`step ${file ? "step-done" : "step-active"}`}>
            <span className="step-num">{file ? "✓" : "1"}</span>
            <span className="step-label">Upload File</span>
          </div>
          <div className="step-line" />
          <div
            className={`step ${
              status === "success"
                ? "step-done"
                : file
                ? "step-active"
                : ""
            }`}
          >
            <span className="step-num">
              {status === "success" ? "✓" : "2"}
            </span>
            <span className="step-label">Enter Email</span>
          </div>
          <div className="step-line" />
          <div className={`step ${status === "success" ? "step-done" : ""}`}>
            <span className="step-num">
              {status === "success" ? "✓" : "3"}
            </span>
            <span className="step-label">Get Summary</span>
          </div>
        </div>

        {/* Main card */}
        <form className="card" onSubmit={handleSubmit}>
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? "dropzone-active" : ""} ${
              file ? "dropzone-has-file" : ""
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="file-info">
                <span className="file-icon">📄</span>
                <div>
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  type="button"
                  className="file-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="dropzone-content">
                <span className="upload-icon">📁</span>
                <p className="dropzone-text">
                  {isDragActive
                    ? "Drop it here..."
                    : "Drag & drop your file here"}
                </p>
                <p className="dropzone-hint">
                  or click to browse &bull; .csv, .xlsx up to 5 MB
                </p>
              </div>
            )}
          </div>

          {/* Email input */}
          <div className="input-group">
            <label htmlFor="email" className="input-label">
              Recipient Email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="e.g. ceo@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <>
                <span className="spinner" />
                Analyzing &amp; Sending...
              </>
            ) : (
              <>🚀 Generate &amp; Send Summary</>
            )}
          </button>

          {/* Status messages */}
          {message && (
            <div className={`alert alert-${status}`}>
              {status === "success" && <span>✅ </span>}
              {status === "error" && <span>❌ </span>}
              {message}
            </div>
          )}
        </form>

        {/* Summary preview */}
        {summary && (
          <div className="summary-card">
            <h2 className="summary-title">📊 Generated Summary Preview</h2>
            <div
              className="summary-body"
              dangerouslySetInnerHTML={{
                __html: summary
                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                  .replace(/\n/g, "<br />"),
              }}
            />
          </div>
        )}

        {/* Footer */}
        <footer className="footer">
          Powered by <strong>Groq</strong> &bull; Built with ❤️ by Rabbitt AI
        </footer>
      </div>
    </div>
  );
}

export default App;
