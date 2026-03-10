"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function CheckoutForm({ amount }: { amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/paiement/confirmation`,
        payment_method_data: {
          billing_details: {
            address: {
              country: "FR",
            },
          },
        },
      },
    });
    if (error) {
      setError(error.message ?? "Une erreur est survenue");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={{
        layout: "tabs",
        fields: { billingDetails: { address: { country: "never" } } }
      }} />
      {error && (
        <div style={{
          marginTop: 12,
          padding: "10px 14px",
          background: "#fff5f5",
          border: "1px solid #fed7d7",
          borderRadius: 8,
          color: "#c53030",
          fontSize: 13,
          fontFamily: "Inter, sans-serif",
        }}>
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        style={{
          width: "100%",
          marginTop: 20,
          padding: "14px",
          background: loading ? "#9CA3AF" : "#1DB954",
          color: "white",
          border: "none",
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 600,
          fontFamily: "Inter, sans-serif",
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: loading ? "none" : "0 4px 16px rgba(29,185,84,0.3)",
          transition: "all 0.18s",
          letterSpacing: "0.1px",
        }}
      >
        {loading ? "Traitement en cours..." : `Payer ${(amount / 100).toFixed(2)} €`}
      </button>
    </form>
  );
}

export default function PaiementPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount] = useState(10000);

  useEffect(() => {
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        connectedAccountId: "acct_1T9VMoGwg9253b3F",
        plan: "starter",
      }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, []);

  if (!clientSecret) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fafafa",
        fontFamily: "Inter, sans-serif",
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 32, height: 32,
            border: "2px solid #e5e7eb",
            borderTopColor: "#1DB954",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
            margin: "0 auto 12px",
          }} />
          <p style={{ color: "#9CA3AF", fontSize: 14 }}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Manrope:wght@700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fafafa; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#fafafa",
        display: "flex",
        fontFamily: "Inter, sans-serif",
        color: "#111",
      }}>

        {/* ── Panneau gauche ── */}
        <div style={{
          width: 400,
          minHeight: "100vh",
          background: "#0a0a0a",
          padding: "48px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 64 }}>
              <div style={{
                width: 32, height: 32,
                background: "#1DB954",
                borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ width: 12, height: 12, background: "white", borderRadius: 3 }} />
              </div>
              <span style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 16, color: "white" }}>
                ProBoost
              </span>
            </div>

            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              border: "1px solid #1e293b", borderRadius: 20,
              padding: "4px 12px", marginBottom: 24,
              background: "rgba(29,185,84,0.08)",
            }}>
              <div style={{ width: 6, height: 6, background: "#1DB954", borderRadius: "50%" }} />
              <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>Recouvrement automatisé</span>
            </div>

            {/* Montant */}
            <p style={{
              fontSize: 11, color: "#475569", fontWeight: 600,
              letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10,
            }}>
              Montant à régler
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 40 }}>
              <span style={{
                fontFamily: "Manrope, sans-serif",
                fontWeight: 900, fontSize: 58,
                color: "white", letterSpacing: "-3px", lineHeight: 1,
              }}>
                {(amount / 100).toFixed(2)}
              </span>
              <span style={{ color: "#475569", fontSize: 26, fontWeight: 400 }}>€</span>
            </div>

            {/* Détails */}
            <div style={{ borderTop: "1px solid #1e293b", paddingTop: 28 }}>
              {[
                { label: "Référence", value: "FAC-2024-0892" },
                { label: "Émetteur", value: "Entreprise SAS" },
                { label: "Date d'émission", value: "01/11/2024" },
                { label: "Échéance", value: "Dépassée", color: "#f87171" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 14,
                }}>
                  <span style={{ color: "#475569", fontSize: 13 }}>{label}</span>
                  <span style={{ color: color ?? "#cbd5e1", fontSize: 13, fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer sécurité */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#374151", fontSize: 12 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Paiement sécurisé par Stripe
          </div>
        </div>

        {/* ── Panneau droit ── */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
        }}>
          <div style={{ width: "100%", maxWidth: 400, animation: "fadeUp 0.5s ease forwards" }}>
            <h2 style={{
              fontFamily: "Manrope, sans-serif",
              fontWeight: 900, fontSize: 24,
              color: "#0a0a0a", marginBottom: 4,
              letterSpacing: "-0.8px",
            }}>
              Règlement de facture
            </h2>
            <p style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 32, fontWeight: 300 }}>
              Choisissez votre moyen de paiement
            </p>

            <Elements stripe={stripePromise} options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#1DB954",
                  colorBackground: "#ffffff",
                  colorText: "#0a0a0a",
                  colorDanger: "#c53030",
                  fontFamily: "Inter, system-ui, sans-serif",
                  borderRadius: "8px",
                  spacingUnit: "4px",
                },
                rules: {
                  ".Input": {
                    border: "1px solid #e5e7eb",
                    boxShadow: "none",
                    padding: "11px 13px",
                    fontSize: "14px",
                  },
                  ".Input:focus": {
                    border: "1.5px solid #1DB954",
                    boxShadow: "0 0 0 3px rgba(29,185,84,0.08)",
                  },
                  ".Label": {
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#6B7280",
                    letterSpacing: "0.3px",
                  },
                  ".Tab": {
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "none",
                  },
                  ".Tab--selected": {
                    border: "1.5px solid #1DB954",
                    background: "#f0fdf4",
                    boxShadow: "none",
                  },
                }
              }
            }}>
              <CheckoutForm amount={amount} />
            </Elements>

            <p style={{
              marginTop: 18, textAlign: "center",
              color: "#d1d5db", fontSize: 12,
            }}>
              Vos données bancaires ne sont jamais stockées
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
