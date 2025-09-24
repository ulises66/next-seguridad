import { NextResponse } from "next/server";

type LoginRequestBody = {
    username: string;
    password: string;
};

const EXPRESS_URL = process.env.EXPRESS_API_URL as string;
const COOKIE_NAME = (process.env.ACCESS_TOKEN_COOKIE as string) || "access_token";
const COOKIE_SECURE = (process.env.COOKIE_SECURE || "false") === "true";

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as LoginRequestBody;

        const resp = await fetch(`${EXPRESS_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!resp.ok) {
            const err = (await resp.json().catch(() => ({}))) as { message?: string };
            return NextResponse.json(err, { status: resp.status });
        }

        const { token } = (await resp.json()) as { token: string };

        const res = NextResponse.json({ ok: true });
        res.cookies.set(COOKIE_NAME, token, {
            httpOnly: true,
            secure: COOKIE_SECURE,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60, // 1h
        });

        return res;
    } catch {
        return NextResponse.json({ message: "Error de servidor" }, { status: 500 });
    }
}
