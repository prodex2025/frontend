// app/api/allergies/route.ts
import { NextRequest, NextResponse } from "next/server";
import type { Allergy } from "@/data/types";
import { allergy, dish_allergy } from "@/data/mockData";

export const dynamic = "force-dynamic";

/* utils */
const toNumU = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
};
const nextIdFrom = (arr: { id: number }[]) =>
  arr.length ? Math.max(...arr.map((r) => r.id)) + 1 : 1;

/** GET /api/allergies?ids=1,3&q=小麦 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const idsStr = url.searchParams.get("ids");
    const q = (url.searchParams.get("q") || "").trim();

    let list: Allergy[] = [...allergy];

    if (idsStr) {
      const idSet = new Set(
        idsStr
          .split(",")
          .map((s) => Number(s.trim()))
          .filter((n) => Number.isFinite(n))
      );
      list = list.filter((a) => idSet.has(a.id));
    }

    if (q) {
      const lower = q.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(lower));
    }

    return NextResponse.json<Allergy[]>(list);
  } catch (e) {
    console.error("GET /api/allergies error:", e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

/** POST /api/allergies  body: { name: string } */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { name?: unknown };
    const name = String(body?.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ message: "name は必須です" }, { status: 400 });
    }

    const newId = nextIdFrom(allergy);
    const rec: Allergy = { id: newId, name };
    allergy.push(rec);

    return NextResponse.json({ message: "作成しました", allergy: rec }, { status: 201 });
  } catch (e) {
    console.error("POST /api/allergies error:", e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}