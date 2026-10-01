import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signSessionToken, COOKIE_NAME, getCookieOptions } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Nama, email, dan password wajib diisi." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter." },
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
    return NextResponse.json(
      { error: "Gagal mendaftarkan akun. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
