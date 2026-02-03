"use client";

import React from "react";
import { signIn } from "next-auth/react";

type LoginProps = {
    isModal?: boolean;
    onLogin?: () => void;
};

export default function Login({ isModal, onLogin }: LoginProps) {
    const handleGoogle = async () => {
        // si tu modal necesita cerrarse antes, lo resuelve esto
        onLogin?.();

        // login real con NextAuth
        await signIn("google", { callbackUrl: "/" });
    };

    return (
        <button
            type="button"
            onClick={handleGoogle}
            className="btn btn-primary"
            style={{ width: "100%" }}
        >
            Continuar con Google
        </button>
    );
}
