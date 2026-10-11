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
    const { email, password, name } = body;

    if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Nama, email, dan password wajib diisi." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (isAuthRateLimited(req, normalizedEmail)) {
      return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password minimal 8 karakter." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan login." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name.trim(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const res = NextResponse.json(
      { success: true, user },
      { status: 201 }
    );

    const cookieOpts = getCookieOptions();
    res.cookies.set(COOKIE_NAME, token, cookieOpts);

    return res;
  } catch (error: any) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Email sudah terdaftar. Silakan login." }, { status: 409 });
    }
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Gagal mendaftarkan akun. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
