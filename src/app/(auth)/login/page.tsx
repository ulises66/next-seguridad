"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type LoginForm = {
    username: string;
    password: string;
};

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState<LoginForm>({ username: "", password: "" });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const resp = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!resp.ok) {
                const err = (await resp.json().catch(() => ({}))) as { message?: string };
                setError(err?.message ?? "Login fallido");
                return;
            }

            router.push("/profile");
        } catch {
            setError("Error de red");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="max-w-sm mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Iniciar sesión</h1>
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="flex flex-col">
                    <label className="text-sm mb-1" htmlFor="username">Usuario</label>
                    <input
                        id="username"
                        className="border rounded px-3 py-2"
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        placeholder="admin"
                        required
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-sm mb-1" htmlFor="password">Contraseña</label>
                    <input
                        id="password"
                        className="border rounded px-3 py-2"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="1234"
                        required
                    />
                </div>

                <button
                    disabled={loading}
                    className="w-full rounded bg-black text-white py-2"
                >
                    {loading ? "Ingresando..." : "Ingresar"}
                </button>

                {error && <p className="text-red-600 text-sm">{error}</p>}
            </form>
        </main>
    );
}
