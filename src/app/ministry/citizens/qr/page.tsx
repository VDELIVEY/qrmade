"use client";

import { useMemo, useState, useRef } from "react";
import RoleGuard from "@/components/RoleGuard";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Search, Loader2, AlertCircle, CheckCircle2,
  Camera, Printer, User, ShieldAlert, Shield, Droplet, Fingerprint,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";

const CARD_WIDTH_MM = 85.725;
const CARD_HEIGHT_MM = 53.975;

const formatCardPrintHtml = (frontHtml: string, backHtml: string) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>MedQR Card Print Preview</title>
      <style>
        @page {
          size: ${CARD_WIDTH_MM}mm ${CARD_HEIGHT_MM}mm landscape;
          margin: 0;
        }

        html, body {
          margin: 0;
          padding: 0;
          background: #ffffff;
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        body {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          min-height: 100vh;
        }

        .print-page {
          width: ${CARD_WIDTH_MM}mm;
          height: ${CARD_HEIGHT_MM}mm;
          page-break-after: always;
          break-after: page;
          page-break-inside: avoid;
          break-inside: avoid;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
          padding: 0;
          background: #ffffff;
          box-sizing: border-box;
        }

        .print-page:last-child {
          page-break-after: auto;
          break-after: auto;
        }

        .id-card-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .id-card {
          width: ${CARD_WIDTH_MM}mm !important;
          min-height: ${CARD_HEIGHT_MM}mm !important;
          height: ${CARD_HEIGHT_MM}mm !important;
          max-height: ${CARD_HEIGHT_MM}mm !important;
          background: #ffffff;
          border-radius: 4mm;
          overflow: hidden;
          box-shadow: none;
          position: relative;
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          border: 0.5mm solid #e2e8f0;
          box-sizing: border-box;
        }

        .id-card-header {
          background: linear-gradient(135deg, #0c2340 0%, #1a4480 50%, #0e7490 100%);
          padding: 4mm 5mm 0;
          position: relative;
          overflow: hidden;
        }

        .id-card-header-pattern {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 1px, transparent 1px),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 18px 18px, 24px 24px;
        }

        .id-card-logo-row {
          display: flex;
          align-items: center;
          gap: 2.2mm;
          position: relative;
          z-index: 1;
          margin-bottom: 2mm;
        }

        .id-card-logo-icon {
          width: 8mm;
          height: 8mm;
          background: rgba(255,255,255,0.15);
          border: 0.7px solid rgba(255,255,255,0.3);
          border-radius: 2mm;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .id-card-org {
          color: rgba(255,255,255,0.9);
          font-size: 2.4mm;
          font-weight: 800;
          letter-spacing: 0.45mm;
          text-transform: uppercase;
          line-height: 1.2;
        }

        .id-card-title {
          color: rgba(255,255,255,0.65);
          font-size: 2mm;
          font-weight: 500;
          letter-spacing: 0.25mm;
          margin-top: 0.7mm;
        }

        .id-card-flag {
          margin-left: auto;
          font-size: 6mm;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
        }

        .id-card-label-band {
          background: rgba(255,255,255,0.12);
          border-top: 1px solid rgba(255,255,255,0.15);
          padding: 1.2mm 5mm;
          font-size: 2.2mm;
          font-weight: 700;
          letter-spacing: 0.7mm;
          text-transform: uppercase;
          color: rgba(255,255,255,0.8);
          margin: 0 -5mm;
        }

        .id-card-body {
          display: flex;
          gap: 3.2mm;
          padding: 3.2mm 5mm 2.4mm;
          background: #ffffff;
          align-items: flex-start;
        }

        .id-card-photo-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2mm;
          flex-shrink: 0;
        }

        .id-card-photo-frame {
          width: 24mm;
          height: 30mm;
          border-radius: 2.4mm;
          overflow: hidden;
          border: 0.5mm solid #e2e8f0;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .id-card-photo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .id-card-photo-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: #f1f5f9;
        }

        .id-card-blood-badge {
          display: inline-flex;
          align-items: center;
          gap: 1.2mm;
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: white;
          font-size: 2.7mm;
          font-weight: 800;
          padding: 0.8mm 2.2mm;
          border-radius: 999px;
          letter-spacing: 0.12mm;
        }

        .id-card-info-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2mm;
          min-width: 0;
        }

        .id-card-name {
          font-size: 4.2mm;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
          letter-spacing: -0.08mm;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .id-card-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.2mm;
        }

        .id-card-field {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 2mm;
          padding: 1.2mm 1.8mm;
        }

        .id-card-field-label {
          font-size: 2mm;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.25mm;
          color: #94a3b8;
          margin-bottom: 0.6mm;
        }

        .id-card-field-value {
          font-size: 3mm;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.2;
          overflow-wrap: anywhere;
          word-break: break-word;
          white-space: normal;
        }

        .id-card-mono {
          font-family: "Courier New", monospace !important;
          font-size: 1.9mm !important;
          letter-spacing: 0.08mm;
          color: #0284c7 !important;
          overflow-wrap: anywhere;
          word-break: break-word;
          white-space: normal;
          line-height: 1.25;
        }

        .id-card-footer {
          background: linear-gradient(90deg, #0c2340 0%, #1a4480 100%);
          padding: 1.8mm 5mm;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2mm;
        }

        .id-card-footer-left {
          display: flex;
          align-items: center;
          gap: 1.4mm;
          color: rgba(255,255,255,0.7);
          font-size: 2.4mm;
          font-weight: 500;
          letter-spacing: 0.08mm;
        }

        .id-card-footer-right {
          color: rgba(255,255,255,0.5);
          font-size: 2.2mm;
          font-family: monospace;
          letter-spacing: 0.08mm;
        }

        .id-card-back {
          width: ${CARD_WIDTH_MM}mm !important;
          height: ${CARD_HEIGHT_MM}mm !important;
          min-height: ${CARD_HEIGHT_MM}mm !important;
          max-height: ${CARD_HEIGHT_MM}mm !important;
          background: linear-gradient(135deg, #0c2340 0%, #1a4480 60%, #0e7490 100%);
          border-radius: 4mm;
          overflow: hidden;
          box-shadow: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3.2mm;
          position: relative;
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          border: 0.5mm solid #e2e8f0;
          box-sizing: border-box;
        }

        .id-card-back-qr {
          background: white;
          padding: 2.4mm;
          border-radius: 2.5mm;
          box-shadow: 0 1.2mm 6mm rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .id-card-back-label {
          color: rgba(255,255,255,0.85);
          font-size: 2.6mm;
          font-weight: 700;
          letter-spacing: 0.75mm;
          text-transform: uppercase;
          text-align: center;
        }

        .id-card-back-id {
          color: rgba(255,255,255,0.5);
          font-size: 2.2mm;
          font-family: monospace;
          letter-spacing: 0.12mm;
          text-align: center;
        }

        .id-card-back-qr svg,
        .id-card-back-qr canvas {
          width: 30mm !important;
          height: 30mm !important;
          display: block !important;
        }

        .id-card-header {
          padding: 5mm 5mm 0 !important;
        }

        .id-card-label-band {
          margin: 0 -5mm !important;
          padding: 1.4mm 5mm !important;
        }

        .id-card-body {
          padding: 4mm 5mm 3mm !important;
          gap: 3.2mm !important;
        }

        .id-card-photo-frame {
          width: 24mm !important;
          height: 30mm !important;
        }

        .id-card-photo-col {
          gap: 2mm !important;
        }

        .id-card-blood-badge {
          font-size: 2.6mm !important;
          padding: 0.8mm 2.2mm !important;
        }

        .id-card-name {
          font-size: 4.2mm !important;
          line-height: 1.2 !important;
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
        }

        .id-card-fields {
          gap: 2mm !important;
        }

        .id-card-field {
          padding: 1.2mm 1.8mm !important;
          border-radius: 2mm !important;
        }

        .id-card-field-label {
          font-size: 2mm !important;
        }

        .id-card-field-value {
          font-size: 3mm !important;
          line-height: 1.2 !important;
        }

        .id-card-mono {
          font-size: 2.5mm !important;
        }

        .id-card-footer {
          padding: 1.6mm 5mm !important;
        }

        .id-card-footer-left,
        .id-card-footer-right {
          font-size: 2.4mm !important;
        }

        .id-card-back {
          background: linear-gradient(135deg, #0c2340 0%, #1a4480 60%, #0e7490 100%) !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 4mm !important;
        }

        .id-card-back-qr {
          padding: 2.4mm !important;
          border-radius: 2.5mm !important;
        }

        .id-card-back-qr svg,
        .id-card-back-qr canvas {
          width: 30mm !important;
          height: 30mm !important;
          display: block !important;
        }

        .id-card-back-label {
          font-size: 2.6mm !important;
          letter-spacing: 0.7mm !important;
        }

        .id-card-back-id {
          font-size: 2.2mm !important;
          letter-spacing: 0.3mm !important;
        }
      </style>
    </head>
    <body>
      <div class="print-page">${frontHtml}</div>
      <div class="print-page">${backHtml}</div>
    </body>
  </html>
`;

const getCardPreviewElements = () => {
  const front = document.getElementById("medqr-screen-front");
  const back = document.getElementById("medqr-screen-back");

  if (!front || !back) {
    return null;
  }

  return { front, back };
};

const captureCardCanvas = async (element: HTMLElement) => {
  const clone = element.cloneNode(true) as HTMLElement;
  const wrapper = document.createElement("div");

  wrapper.style.position = "fixed";
  wrapper.style.left = "-9999px";
  wrapper.style.top = "-9999px";
  wrapper.style.width = `${CARD_WIDTH_MM}mm`;
  wrapper.style.height = `${CARD_HEIGHT_MM}mm`;
  wrapper.style.overflow = "hidden";
  wrapper.style.background = "#ffffff";
  wrapper.style.zIndex = "-1";

  Object.assign(clone.style, {
    width: `${CARD_WIDTH_MM}mm`,
    height: `${CARD_HEIGHT_MM}mm`,
    minHeight: `${CARD_HEIGHT_MM}mm`,
    maxHeight: `${CARD_HEIGHT_MM}mm`,
    margin: "0",
    display: "block",
    boxShadow: "none",
    borderRadius: "4mm",
  });

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    const canvas = await html2canvas(clone, {
      backgroundColor: "#ffffff",
      scale: 3,
      useCORS: true,
      allowTaint: false,
      logging: false,
      width: clone.offsetWidth || Math.round(CARD_WIDTH_MM * 3.78),
      height: clone.offsetHeight || Math.round(CARD_HEIGHT_MM * 3.78),
    });

    return canvas;
  } finally {
    wrapper.remove();
  }
};

export default function CitizenQRLookupPage() {
  return (
    <RoleGuard allowedRole={["ministry", "superadmin"]}>
      <CitizenQRLookup />
    </RoleGuard>
  );
}

function CitizenQRLookup() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [patient, setPatient] = useState<any>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const qrValue = useMemo(() => patient?.qr_code || "", [patient]);

  const openPrintPreview = () => {
    const cardPreview = getCardPreviewElements();
    if (!cardPreview) return;

    const markup = formatCardPrintHtml(cardPreview.front.outerHTML, cardPreview.back.outerHTML);
    const blob = new Blob([markup], { type: "text/html;charset=utf-8" });
    const previewUrl = URL.createObjectURL(blob);
    const previewWindow = window.open(previewUrl, "_blank", "width=1000,height=800,noopener,noreferrer");

    if (!previewWindow) {
      alert("Please allow popups so the print preview can open.");
      URL.revokeObjectURL(previewUrl);
      return;
    }

    previewWindow.addEventListener("beforeunload", () => URL.revokeObjectURL(previewUrl), { once: true });
    previewWindow.focus();
  };

  const downloadPrintReadyPdf = async () => {
    const cardPreview = getCardPreviewElements();
    if (!cardPreview) return;

    const pdf = new jsPDF({ unit: "mm", format: [CARD_HEIGHT_MM, CARD_WIDTH_MM], orientation: "landscape" });
    const printTargets = [cardPreview.front, cardPreview.back];

    for (let index = 0; index < printTargets.length; index += 1) {
      if (index > 0) {
        pdf.addPage([CARD_HEIGHT_MM, CARD_WIDTH_MM]);
      }

      const canvas = await captureCardCanvas(printTargets[index]);
      const imageData = canvas.toDataURL("image/png");
      pdf.addImage(imageData, "PNG", 0, 0, CARD_WIDTH_MM, CARD_HEIGHT_MM, undefined, "FAST");
    }

    pdf.save(`medqr-card-${patient?.qr_code || "print"}.pdf`);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPatient(null);
    setUploadError("");

    const trimmed = query.trim();
    if (!trimmed) { setError("Enter a citizen name to search."); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/citizens?search=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch citizens");
      const match = data.patients?.[0];
      if (!match) { setError("Citizen not found in database."); return; }
      setPatient(match);
    } catch (err: any) {
      setError(err?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setUploadError("Image must be smaller than 2MB."); return; }

    setUploading(true);
    setUploadError("");

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      try {
        const res = await fetch("/api/citizens", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: patient.id, photo_url: base64Data }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to upload photo");
        setPatient((prev: any) => ({ ...prev, photo_url: base64Data }));
      } catch (err: any) {
        setUploadError(err.message || "Failed to update photo");
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => { setUploadError("Error reading file."); setUploading(false); };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="no-print">
        <Breadcrumbs
          items={[{ label: 'Ministry', href: '/ministry' }, { label: 'Citizen QR Directory' }]}
          backHref="/ministry"
          backLabel="Dashboard"
        />
      </div>

      <div className="container max-w-4xl mx-auto p-8 fade-in">
        {/* Page Header Banner */}
        <div className="page-header-banner no-print">
          <h1 className="page-header-title">Citizen QR Directory & Health Pass Generator</h1>
          <p className="page-header-subtitle">
            Search registered citizens to view, update photos, and print standardized MedQR digital identity cards.
          </p>
        </div>

        {/* ── Search Panel ─────────────────────────────────────────── */}
        <div className="glass-card p-8 mb-8 card-basic">

        <form onSubmit={handleSearch} style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="form-label">Citizen Name</label>
            <div style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: 20, height: 20, color: "var(--text-muted)" }} />
              <input
                type="text"
                className="input-modern"
                style={{ paddingLeft: "3rem" }}
                placeholder="E.g., John Doe"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: "0.75rem", padding: "1rem 2rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            {loading ? <Loader2 style={{ width: 20, height: 20 }} className="animate-spin" /> : <Search style={{ width: 20, height: 20 }} />}
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && (
          <div className="alert-modern alert-error mt-6" style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            <AlertCircle style={{ width: 24, height: 24, marginTop: 2, flexShrink: 0 }} />
            <div style={{ fontWeight: 700 }}>{error}</div>
          </div>
        )}
      </div>

      {/* ── Result ────────────────────────────────────────────────── */}
      {patient && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Action Bar (hidden when printing) */}
          <div
            className="no-print"
            style={{
              display: "flex", flexWrap: "wrap", alignItems: "center",
              justifyContent: "space-between", gap: "1rem",
              background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)",
              border: "1px solid var(--border-color)", borderRadius: "var(--radius)",
              padding: "1rem 1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <CheckCircle2 style={{ width: 22, height: 22, color: "#059669", flexShrink: 0 }} />
              <div>
                <span style={{ fontWeight: 700, color: "var(--text-main)" }}>Citizen Found: </span>
                <span style={{ color: "var(--text-muted)" }}>{patient.first_name} {patient.last_name}</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" style={{ display: "none" }} />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary"
                disabled={uploading}
                style={{ padding: "0.55rem 1.2rem", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                {uploading ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <Camera style={{ width: 16, height: 16 }} />}
                {patient.photo_url ? "Change Photo" : "Upload Photo"}
              </button>

              <button
                onClick={openPrintPreview}
                className="btn btn-primary"
                style={{ padding: "0.55rem 1.4rem", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <Printer style={{ width: 16, height: 16 }} /> Print Preview
              </button>

              <button
                onClick={downloadPrintReadyPdf}
                className="btn btn-secondary"
                style={{ padding: "0.55rem 1.3rem", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                Download PDF
              </button>
            </div>
          </div>

          {uploadError && (
            <div className="alert-modern alert-error no-print" style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
              <ShieldAlert style={{ width: 20, height: 20, marginTop: 2, flexShrink: 0 }} />
              <div style={{ fontWeight: 700 }}>{uploadError}</div>
            </div>
          )}

          {/* ── Preview labels (screen only) ─────────────────────── */}
          <div className="no-print" style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>

            {/* FRONT label */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <span style={{ background: "var(--primary-gradient)", color: "white", fontSize: "10px", fontWeight: 800, padding: "2px 10px", borderRadius: "999px", letterSpacing: "1px", textTransform: "uppercase" }}>
                  Side 1 — Front
                </span>
              </div>

              {/* ── FRONT card (screen preview) ─────────────────────── */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div id="medqr-screen-front" className="id-card">
                  <div className="id-card-header">
                    <div className="id-card-header-pattern" />
                    <div className="id-card-logo-row">
                      <div className="id-card-logo-icon"><Shield style={{ width: 20, height: 20, color: "white" }} /></div>
                      <div>
                        <div className="id-card-org">MINISTRY OF HEALTH</div>
                        <div className="id-card-title">National Health Registry</div>
                      </div>
                      <div className="id-card-flag">🏥</div>
                    </div>
                    <div className="id-card-label-band">CITIZEN HEALTH IDENTITY CARD</div>
                  </div>

                  <div className="id-card-body">
                    <div className="id-card-photo-col">
                      <div className="id-card-photo-frame">
                        {patient.photo_url
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={patient.photo_url} alt="Citizen" className="id-card-photo-img" />
                          : <div className="id-card-photo-placeholder"><User style={{ width: 40, height: 40, color: "#94a3b8" }} /></div>}
                      </div>
                      <div className="id-card-blood-badge">
                        <Droplet style={{ width: 10, height: 10 }} />{patient.blood_type || "—"}
                      </div>
                    </div>

                    <div className="id-card-info-col">
                      <div className="id-card-name">{patient.first_name} {patient.last_name}</div>
                      <div className="id-card-fields">
                        <div className="id-card-field">
                          <div className="id-card-field-label">Gender</div>
                          <div className="id-card-field-value">{patient.gender || "—"}</div>
                        </div>
                        <div className="id-card-field">
                           <div className="id-card-field-label">Date of Birth</div>
                           <div className="id-card-field-value">{patient.dob || "—"}</div>
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="id-card-footer">
                    <div className="id-card-footer-left">
                      <Fingerprint style={{ width: 14, height: 14, opacity: 0.7 }} />
                      <span>Scan QR code on back</span>
                    </div>
                    <div className="id-card-footer-right">medqr.gov • {new Date().getFullYear()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* BACK label */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <span style={{ background: "linear-gradient(135deg, #0c2340, #1a4480)", color: "white", fontSize: "10px", fontWeight: 800, padding: "2px 10px", borderRadius: "999px", letterSpacing: "1px", textTransform: "uppercase" }}>
                  Side 2 — Back (QR)
                </span>
              </div>

              {/* ── BACK card (screen preview) ───────────────────────── */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div id="medqr-screen-back" className="id-card-back">
                  <div className="id-card-back-qr">
                    {qrValue
                      ? <QRCodeSVG value={qrValue} size={130} level="H" includeMargin={false} bgColor="#ffffff" fgColor="#0f172a" />
                      : <div style={{ width: 130, height: 130, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 12 }}>No QR</div>}
                  </div>
                  <div className="id-card-back-label">Scan to Access Medical Record</div>
                  <div className="id-card-back-id">{patient.qr_code}</div>
                </div>
              </div>
            </div>
          </div>
          {/* ── end screen preview ───────────────────────────────── */}


          {/* ══════════════════════════════════════════════════════
              PRINT ROOT — two-sided (hidden on screen, prints only)
          ══════════════════════════════════════════════════════ */}
          <div className="card-print-root">

            {/* Page 1 — Front */}
            <div className="card-print-page">
              <div className="id-card-wrapper">
                <div className="id-card" id="medqr-id-card-front">
                  <div className="id-card-header">
                    <div className="id-card-header-pattern" />
                    <div className="id-card-logo-row">
                      <div className="id-card-logo-icon"><Shield style={{ width: 20, height: 20, color: "white" }} /></div>
                      <div>
                        <div className="id-card-org">MINISTRY OF HEALTH</div>
                        <div className="id-card-title">National Health Registry</div>
                      </div>
                      <div className="id-card-flag">🏥</div>
                    </div>
                    <div className="id-card-label-band">CITIZEN HEALTH IDENTITY CARD</div>
                  </div>

                  <div className="id-card-body">
                    <div className="id-card-photo-col">
                      <div className="id-card-photo-frame">
                        {patient.photo_url
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={patient.photo_url} alt="Citizen" className="id-card-photo-img" />
                          : <div className="id-card-photo-placeholder"><User style={{ width: 40, height: 40, color: "#94a3b8" }} /></div>}
                      </div>
                      <div className="id-card-blood-badge">
                        <Droplet style={{ width: 10, height: 10 }} />{patient.blood_type || "—"}
                      </div>
                    </div>

                    <div className="id-card-info-col">
                      <div className="id-card-name">{patient.first_name} {patient.last_name}</div>
                      <div className="id-card-fields">
                        <div className="id-card-field">
                          <div className="id-card-field-label">Gender</div>
                          <div className="id-card-field-value">{patient.gender || "—"}</div>
                        </div>
                        <div className="id-card-field">
                          <div className="id-card-field-label">Date of Birth</div>
                          <div className="id-card-field-value">{patient.dob || patient.age || "—"}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="id-card-footer">
                    <div className="id-card-footer-left">
                      <Fingerprint style={{ width: 14, height: 14, opacity: 0.7 }} />
                      <span>Scan QR code on back</span>
                    </div>
                    <div className="id-card-footer-right">medqr.gov • {new Date().getFullYear()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Page 2 — Back (QR code) */}
            <div className="card-print-page">
              <div className="id-card-back" id="medqr-id-card-back">
                <div className="id-card-back-qr">
                  {qrValue
                    ? <QRCodeSVG value={qrValue} size={130} level="H" includeMargin={false} bgColor="#ffffff" fgColor="#0f172a" />
                    : <div style={{ width: 130, height: 130 }} />}
                </div>
                <div className="id-card-back-label">Scan to Access Medical Record</div>
                <div className="id-card-back-id">{patient.qr_code}</div>
              </div>
            </div>

          </div>
          {/* ── end card-print-root ───────────────────────────── */}

        </div>
      )}
    </div>
    </div>
  );
}
