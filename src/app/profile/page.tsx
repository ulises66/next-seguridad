import { headers } from "next/headers";

type ProfileResponse = {
    message: string;
    user?: { id: number; username: string; role: string; iat?: number; exp?: number };
};

export default async function ProfilePage() {
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
    const baseUrl = `${proto}://${host}`;

    // 🔑 reenviar cookies del request del usuario a tu API interna
    const cookieHeader = h.get("cookie") ?? "";

    const resp = await fetch(`${baseUrl}/api/profile`, {
        cache: "no-store",
        headers: { cookie: cookieHeader },
    });

    if (resp.status === 401) {
        return (
            <main className="max-w-lg mx-auto p-6">
                <h1 className="text-xl font-semibold">No autenticado</h1>
                <p className="mt-2">Por favor inicia sesión.</p>
            </main>
        );
    }

    const data = (await resp.json()) as ProfileResponse;

    return (
        <main className="max-w-lg mx-auto p-6">
            <h1 className="text-2xl font-semibold">Perfil</h1>
            <pre className="mt-4 bg-gray-100 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
        </main>
    );
}
