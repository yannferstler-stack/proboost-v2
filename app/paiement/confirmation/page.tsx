"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    const clientSecret = searchParams.get("payment_intent_client_secret");
    if (!clientSecret) return;
    stripePromise.then((stripe) => {
      if (!stripe) return;
      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        if (paymentIntent?.status === "succeeded") {
          setAmount(paymentIntent.amount);
          setStatus("success");
        } else {
          setStatus("error");
        }
      });
    });
  }, [searchParams]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Manrope:wght@700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fafafa; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0.7); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes drawCheck {
          from { stroke-dashoffset: 60; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      {status === "loading" && (
        <div style={{
          minHeight: "100vh", display: "flex", alignItems: "center",
          justifyContent: "center", background: "#fafafa",
          fontFamily: "Inter, sans-serif",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 32, height: 32,
              border: "2px solid #e5e7eb",
              borderTopColor: "#1DB954",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
              margin: "0 auto 12px",
            }} />
            <p style={{ color: "#9CA3AF", fontSize: 14 }}>Vérification en cours...</p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div style={{
          minHeight: "100vh", display: "flex", alignItems: "center",
          justifyContent: "center", background: "#fafafa",
          fontFamily: "Inter, sans-serif", padding: 24,
        }}>
          <div style={{
            background: "white", borderRadius: 16,
            padding: "48px 40px", maxWidth: 420, width: "100%",
            textAlign: "center", border: "1px solid #f0f0f0",
            boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
            animation: "fadeUp 0.4s ease forwards",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "#fff5f5", border: "1px solid #fed7d7",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
              animation: "scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <h1 style={{
              fontFamily: "Manrope, sans-serif", fontWeight: 900,
              fontSize: 24, color: "#0a0a0a", marginBottom: 8, letterSpacing: "-0.8px",
            }}>
              Paiement échoué
            </h1>
            <p style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 32, lineHeight: 1.7, fontWeight: 300 }}>
              Une erreur est survenue lors du traitement.<br />
              Vérifiez vos informations et réessayez.
            </p>
            <button onClick={() => router.push('/paiement')} style={{
              display: "inline-block",
              padding: "13px 28px",
              background: "#0a0a0a",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}>
              Réessayer
            </button>
          </div>
        </div>
      )}

      {status === "success" && (
        <div style={{
          minHeight: "100vh", display: "flex", alignItems: "center",
          justifyContent: "center", background: "#fafafa",
          fontFamily: "Inter, sans-serif", padding: 24,
        }}>
          <div style={{
            background: "white", borderRadius: 16,
            padding: "52px 44px", maxWidth: 460, width: "100%",
            textAlign: "center", border: "1px solid #f0f0f0",
            boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
            animation: "fadeUp 0.45s ease forwards",
          }}>
            {/* Logo */}
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: 8, marginBottom: 40,
            }}>
              <div style={{
                width: 28, height: 28, background: "#1DB954",
                borderRadius: 7, display: "flex",
                alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ width: 10, height: 10, background: "white", borderRadius: 2 }} />
              </div>
              <span style={{
                fontFamily: "Manrope, sans-serif", fontWeight: 800,
                fontSize: 14, color: "#0a0a0a",
              }}>
                ManaFlow
              </span>
            </div>

            {/* Icône succès */}
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "#f0fdf4", border: "1.5px solid #bbf7d0",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
              animation: "scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.1s both",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="#1DB954" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" style={{
                  strokeDasharray: 60,
                  strokeDashoffset: 60,
                  animation: "drawCheck 0.4s ease 0.4s forwards",
                }} />
              </svg>
            </div>

            <h1 style={{
              fontFamily: "Manrope, sans-serif", fontWeight: 900,
              fontSize: 26, color: "#0a0a0a", marginBottom: 8, letterSpacing: "-1px",
            }}>
              Paiement confirmé
            </h1>
            <p style={{
              color: "#9CA3AF", fontSize: 14, marginBottom: 36,
              lineHeight: 1.7, fontWeight: 300,
            }}>
              Votre règlement a bien été enregistré.
            </p>

            {/* Montant */}
            {amount && (
              <div style={{
                background: "#fafafa", border: "1px solid #f0f0f0",
                borderRadius: 12, padding: "20px 24px", marginBottom: 28,
              }}>
                <p style={{
                  fontSize: 10, color: "#9CA3AF", fontWeight: 600,
                  letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8,
                }}>
                  Montant réglé
                </p>
                <p style={{
                  fontFamily: "Manrope, sans-serif", fontWeight: 900,
                  fontSize: 42, color: "#0a0a0a",
                  letterSpacing: "-2px", lineHeight: 1,
                }}>
                  {(amount / 100).toFixed(2)}
                  <span style={{ fontSize: 20, fontWeight: 400, color: "#9CA3AF", marginLeft: 4 }}>€</span>
                </p>
              </div>
            )}

            {/* Email info */}
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: 6,
              color: "#9CA3AF", fontSize: 13, marginBottom: 32,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Un reçu vous a été envoyé par email
            </div>

            <button onClick={() => router.push('/')} style={{
              display: "inline-block",
              padding: "13px 32px",
              background: "#1DB954",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              boxShadow: "0 4px 16px rgba(29,185,84,0.25)",
              letterSpacing: "0.1px",
            }}>
              Retour à l&apos;accueil →
            </button>

            {/* Badge Stripe */}
            <div style={{
              marginTop: 24, display: "flex", alignItems: "center",
              justifyContent: "center", gap: 5,
              color: "#d1d5db", fontSize: 11,
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Sécurisé par Stripe
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "#fafafa",
      }}>
        <div style={{
          width: 32, height: 32,
          border: "2px solid #e5e7eb",
          borderTopColor: "#1DB954",
          borderRadius: "50%",
        }} />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
