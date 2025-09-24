import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = (process.env.ACCESS_TOKEN_COOKIE as string) || "access_token";

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const isProtected = pathname.startsWith("/profile");
    if (!isProtected) return NextResponse.next();

    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
        const url = new URL("/login", req.url); // correcto aunque uses /(auth)/login
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/profile"],
};
