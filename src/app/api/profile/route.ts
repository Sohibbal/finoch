import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/jwt";

export async function GET(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user, profile] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, email: true, name: true } }),
      prisma.profile.findUnique({ where: { userId: session.userId } }).catch(() => null),
    ]);

    return NextResponse.json(
      {
        user,
        profile: {
          nickname: profile?.nickname || user?.name || "Kawan",
          userId: session.userId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memuat profil pengguna" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "JSON tidak valid." }, { status: 400 });
    }

    const nickname = typeof body.nickname === "string" && body.nickname.trim()
      ? body.nickname.trim()
      : undefined;

    let profile = null;
    if (nickname) {
      profile = await prisma.profile.upsert({
        where: { userId: session.userId },
        update: { nickname, updatedAt: new Date() },
        create: { userId: session.userId, nickname },
      });
    }

    return NextResponse.json({ profile, success: true }, { status: 200 });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan profil" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  return POST(req);
}

