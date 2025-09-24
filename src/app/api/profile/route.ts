import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const EXPRESS_URL = process.env.EXPRESS_API_URL as string;
const COOKIE_NAME = (process.env.ACCESS_TOKEN_COOKIE as string) || "access_token";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
        return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    const resp = await fetch(`${EXPRESS_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
}
