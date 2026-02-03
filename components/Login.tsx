"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";

export default function Login({ isModal }: { isModal?: boolean }) {
    const [loading, setLoading] = useState(false);

    const handleGoogle = async () => {
        try {
            setLoading(true);
            await signIn("google", { callbackUrl: "/" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: isModal ? "1.5rem" : "0" }}>
            <button
                onClick={handleGoogle}
                disabled={loading}
                style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "16px",
                    fontWeight: 600,
                }}
            >
                {loading ? "Iniciando sesión..." : "Continuar con Google"}
            </button>

            <p style={{ marginTop: "12px", fontSize: "13px", color: "#64748b", textAlign: "center" }}>
                Al continuar aceptás los términos y condiciones.
            </p>
        </div>
    );
}
