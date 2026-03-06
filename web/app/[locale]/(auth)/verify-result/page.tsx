"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function VerifyResult() {
  const params = useSearchParams();
  const status = params.get("status");

  const config = {
    success: {
      icon: "✅",
      title: "E-posta Doğrulandı!",
      message: "Hesabın başarıyla aktifleştirildi. Artık giriş yapabilirsin.",
      cta: "Giriş Yap",
      href: "/tr/login",
      color: "#22c55e",
    },
    expired: {
      icon: "⏰",
      title: "Bağlantı Süresi Doldu",
      message: "Doğrulama bağlantısının süresi dolmuş. Lütfen tekrar kayıt ol veya yeni bir doğrulama maili talep et.",
      cta: "Kayıt Ol",
      href: "/tr/register",
      color: "#f59e0b",
    },
    invalid: {
      icon: "❌",
      title: "Geçersiz Bağlantı",
      message: "Bu doğrulama bağlantısı geçersiz. Lütfen doğru bağlantıyı kullandığından emin ol.",
      cta: "Ana Sayfa",
      href: "/tr",
      color: "#ef4444",
    },
  } as const;

  const c = config[status as keyof typeof config] ?? config.invalid;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "rgba(30, 41, 59, 0.9)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          borderRadius: "20px",
          padding: "48px 40px",
          maxWidth: "440px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ fontSize: "56px", marginBottom: "16px", lineHeight: 1 }}>
          {c.icon}
        </div>
        <h1
          style={{
            margin: "0 0 12px",
            color: c.color,
            fontSize: "22px",
            fontWeight: 700,
          }}
        >
          {c.title}
        </h1>
        <p
          style={{
            margin: "0 0 32px",
            color: "#94a3b8",
            fontSize: "15px",
            lineHeight: 1.6,
          }}
        >
          {c.message}
        </p>
        <Link
          href={c.href}
          style={{
            display: "inline-block",
            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "15px",
            textDecoration: "none",
            padding: "12px 32px",
            borderRadius: "10px",
            transition: "opacity 0.2s",
          }}
        >
          {c.cta}
        </Link>
      </div>
    </div>
  );
}

export default function VerifyResultPage() {
  return (
    <Suspense>
      <VerifyResult />
    </Suspense>
  );
}
