"use client";

import { useEffect, useState } from "react";

export type AdminToastDetail = {
  message: string;
  type?: "success" | "error";
};

export function notifyAdminToast(detail: AdminToastDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AdminToastDetail>("rajjobs:admin-toast", { detail }));
}

export default function AdminToast() {
  const [toast, setToast] = useState<AdminToastDetail | null>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const showToast = (event: Event) => {
      const detail = (event as CustomEvent<AdminToastDetail>).detail;
      if (!detail?.message) return;
      setToast(detail);
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => setToast(null), 4000);
    };
    window.addEventListener("rajjobs:admin-toast", showToast);
    return () => {
      window.removeEventListener("rajjobs:admin-toast", showToast);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div role="status" aria-live="polite" style={{ position: "fixed", right: 24, bottom: 24, zIndex: 10000, display: "flex", alignItems: "center", gap: 10, maxWidth: 380, padding: "14px 16px", borderRadius: 10, color: isError ? "#991b1b" : "#065f46", background: isError ? "#fef2f2" : "#ecfdf5", border: `1px solid ${isError ? "#fecaca" : "#a7f3d0"}`, boxShadow: "0 12px 30px rgba(15,23,42,0.18)", fontSize: 14, fontWeight: 600 }}>
      <span aria-hidden="true">{isError ? "⚠️" : "✓"}</span>
      <span>{toast.message}</span>
      <button type="button" onClick={() => setToast(null)} aria-label="Close notification" style={{ marginLeft: "auto", border: 0, background: "transparent", color: "inherit", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
    </div>
  );
}
