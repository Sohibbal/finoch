import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { isAuthRateLimited } from "@/lib/auth/rate-limit";
import { prisma } from "@/lib/prisma";
import { signSessionToken, COOKIE_NAME, getCookieOptions } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "JSON tidak valid." }, { status: 400 });
    }
    const { email, password } = body;

    if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (isAuthRateLimited(req, normalizedEmail)) {
      return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
    }
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    const dummyHash = "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
    const isValid = await bcrypt.compare(password, user?.password ?? dummyHash);
    if (!user || !isValid) {
      return NextResponse.json(
        { error: "Email atau password salah." },
        { status: 401 }
      );
    }

    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });

    const cookieOpts = getCookieOptions();
    res.cookies.set(COOKIE_NAME, token, cookieOpts);

    return res;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Gagal masuk. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
