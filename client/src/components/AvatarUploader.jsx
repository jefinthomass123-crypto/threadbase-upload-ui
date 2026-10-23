
import { useEffect, useState } from "react";
import apiClient from "../services/apiClient";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_SIZE = 5 * 1024 * 1024;

export default function AvatarUploader() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFile(selectedFile) {
    if (!selectedFile) return;

    setError("");
    setUploadedUrl("");
    setProgress(0);

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setFile(null);
      setPreviewUrl("");
      setError("Please select a JPEG, PNG, WEBP, or GIF image.");
      return;
    }

    if (selectedFile.size > MAX_SIZE) {
      setFile(null);
      setPreviewUrl("");
      setError("Image size must not exceed 5MB.");
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function handleChange(e) {
    handleFile(e.target.files[0]);
    e.target.value = "";
  }

  async function upload() {
    if (!file || uploading) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setError("");
    setUploadedUrl("");
    setProgress(0);
    setUploading(true);
try {
  const response = await apiClient.post("/api/upload", formData, {
    onUploadProgress: (event) => {
      if (event.total) {
        const percentage = Math.round(
          (event.loaded * 100) / event.total
        );
        setProgress(percentage);
      }
    },
  });

  const returnedUrl = response.data.url;

  const fullUrl = returnedUrl.startsWith("http")
    ? returnedUrl
    : `http://localhost:3001${
        returnedUrl.startsWith("/") ? "" : "/"
      }${returnedUrl}`;

  setUploadedUrl(fullUrl);
  setProgress(100);
} catch (err) {
  setError(
    err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Upload failed. Please try again."
  );
} finally {
  setUploading(false);
}
  }
  return (
    <main
      style={{
        width: "100%",
        maxWidth: "520px",
        margin: "40px auto",
        padding: "24px",
        boxSizing: "border-box",
        fontFamily: "Arial, sans-serif",
        color: "#1f2937",
      }}
    >
      <section
        style={{
          padding: "28px",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          background: "#ffffff",
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ margin: "0 0 8px", fontSize: "24px" }}>
          Upload your avatar
        </h2>

        <p style={{ margin: "0 0 24px", color: "#6b7280", lineHeight: 1.5 }}>
          Choose an image or drag it into the box below.
        </p>

        <label
          className={`drop-zone ${isDragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            minHeight: "150px",
            padding: "24px",
            boxSizing: "border-box",
            border: `2px dashed ${isDragging ? "#2563eb" : "#cbd5e1"}`,
            borderRadius: "12px",
            background: isDragging ? "#eff6ff" : "#f8fafc",
            textAlign: "center",
            cursor: "pointer",
            overflowWrap: "anywhere",
          }}
        >
          <span style={{ fontSize: "32px" }}>↑</span>

          <span style={{ fontWeight: "600" }}>
            Drop your image here or click to browse
          </span>

          <span style={{ fontSize: "13px", color: "#64748b" }}>
            JPEG, PNG, WEBP or GIF · Maximum 5MB
          </span>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleChange}
            style={{ maxWidth: "100%" }}
          />
        </label>

        {previewUrl && (
          <div
            className="preview"
            style={{
              marginTop: "24px",
              padding: "16px",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            <h3 style={{ margin: "0 0 14px", fontSize: "16px" }}>
              Image preview
            </h3>

            <img
              src={previewUrl}
              alt="Selected avatar preview"
              style={{
                display: "block",
                width: "180px",
                height: "180px",
                maxWidth: "100%",
                objectFit: "contain",
                margin: "0 auto",
                borderRadius: "10px",
              }}
            />

            <p
              style={{
                margin: "12px 0 0",
                fontSize: "13px",
                color: "#64748b",
                overflowWrap: "anywhere",
              }}
            >
              {file?.name}
            </p>
          </div>
        )}

        {error && (
          <p
            className="error"
            role="alert"
            style={{
              margin: "16px 0 0",
              padding: "12px",
              borderRadius: "8px",
              background: "#fef2f2",
              color: "#b91c1c",
              overflowWrap: "anywhere",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={upload}
          disabled={!file || uploading}
          style={{
            display: "block",
            width: "100%",
            marginTop: "20px",
            padding: "13px 16px",
            border: "none",
            borderRadius: "9px",
            background: !file || uploading ? "#94a3b8" : "#2563eb",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: "600",
            cursor: !file || uploading ? "not-allowed" : "pointer",
            boxSizing: "border-box",
          }}
        >
          {uploading ? "Uploading..." : "Upload avatar"}
        </button>

        <div style={{ marginTop: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              marginBottom: "8px",
              fontSize: "13px",
            }}
          >
            <span>Upload progress</span>
            <span>{progress}%</span>
          </div>

          <div
            className="bar"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{
              width: "100%",
              height: "10px",
              background: "#e5e7eb",
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            <div
              className="fill"
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#2563eb",
                borderRadius: "999px",
                transition: "width 0.2s ease",
              }}
            />
          </div>
        </div>

        {uploadedUrl && (
          <p style={{ margin: "16px 0 0", overflowWrap: "anywhere" }}>
            Upload successful!{" "}
            <a href={uploadedUrl} target="_blank" rel="noreferrer">
              View uploaded image
            </a>
          </p>
        )}
      </section>
    </main>
  );
}
