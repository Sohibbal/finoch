import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signSessionToken, COOKIE_NAME, getCookieOptions } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email atau password salah." },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
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
    return NextResponse.json(
      { error: "Gagal masuk. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
