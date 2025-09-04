// app/api/dish_allergies/route.ts
import { NextRequest, NextResponse } from "next/server";
import type { Dish_allergy } from "@/data/types";
import { dish_allergy } from "@/data/mockData";

export const dynamic = "force-dynamic";

/* utils */
const toNumQ = (v: string | null): number | null => {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
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

/** GET /api/dish_allergies?dishId=1&allergyId=3 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const dishId = toNumQ(url.searchParams.get("dishId"));
    const allergyId = toNumQ(url.searchParams.get("allergyId"));

    let list = [...dish_allergy];

    if (dishId != null) list = list.filter((r) => r.dish === dishId);
    if (allergyId != null) list = list.filter((r) => r.allergy === allergyId);

    return NextResponse.json<Dish_allergy[]>(list);
  } catch (e) {
    console.error("GET /api/dish_allergies error:", e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

/** POST /api/dish_allergies  body: { dishId: number, allergyIds: number[] } */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { dishId?: unknown; allergyIds?: unknown };
    const dishId = toNumU(body?.dishId);
    const ids = Array.isArray(body?.allergyIds)
      ? [...new Set((body!.allergyIds as unknown[]).map((v) => toNumU(v)).filter((n): n is number => n != null))]
      : [];

    if (dishId == null || dishId <= 0) {
      return NextResponse.json({ message: "dishId が不正です" }, { status: 400 });
    }
    if (ids.length === 0) {
      return NextResponse.json({ message: "allergyIds は1件以上必要です" }, { status: 400 });
    }

    let nextId = nextIdFrom(dish_allergy);
    const created: Dish_allergy[] = [];

    for (const allergyId of ids) {
      // 既存重複スキップ
      const dup = dish_allergy.find((r) => r.dish === dishId && r.allergy === allergyId);
      if (dup) continue;

      const rec: Dish_allergy = { id: nextId++, dish: dishId, allergy: allergyId };
      dish_allergy.push(rec);
      created.push(rec);
    }

    return NextResponse.json({ message: "作成しました", created }, { status: 201 });
  } catch (e) {
    console.error("POST /api/dish_allergies error:", e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

/** PUT /api/dish_allergies  body: { dishId: number, allergyIds: number[] }  ※完全置換 */
export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as { dishId?: unknown; allergyIds?: unknown };
    const dishId = toNumU(body?.dishId);
    const ids = Array.isArray(body?.allergyIds)
      ? [...new Set((body!.allergyIds as unknown[]).map((v) => toNumU(v)).filter((n): n is number => n != null))]
      : [];

    if (dishId == null || dishId <= 0) {
      return NextResponse.json({ message: "dishId が不正です" }, { status: 400 });
    }

    // 既存を全消し
    for (let i = dish_allergy.length - 1; i >= 0; i--) {
      if (dish_allergy[i].dish === dishId) dish_allergy.splice(i, 1);
    }

    // 空配列なら「全消し」のみで終了
    if (ids.length === 0) {
      return NextResponse.json({ message: "置換しました（空配列）", created: [] });
    }

    // 追加
    let nextId = nextIdFrom(dish_allergy);
    const created: Dish_allergy[] = [];
    for (const allergyId of ids) {
      const rec: Dish_allergy = { id: nextId++, dish: dishId, allergy: allergyId };
      dish_allergy.push(rec);
      created.push(rec);
    }

    return NextResponse.json({ message: "置換しました", created });
  } catch (e) {
    console.error("PUT /api/dish_allergies error:", e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/dish_allergies
 * - ?id=123                       … リンク1件を削除
 * - ?dishId=1&allergyId=3         … dish+allergy の組を削除
 * - ?dishId=1                     … 該当 dish のリンクを全削除
 */
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = toNumQ(url.searchParams.get("id"));
    const dishId = toNumQ(url.searchParams.get("dishId"));
    const allergyId = toNumQ(url.searchParams.get("allergyId"));

    // 1) id 指定
    if (id != null) {
      const idx = dish_allergy.findIndex((r) => r.id === id);
      if (idx === -1) return NextResponse.json({ message: "not found" }, { status: 404 });
      const [deleted] = dish_allergy.splice(idx, 1);
      return NextResponse.json({ message: "削除しました", deleted });
    }

    // 2) dishId+allergyId 指定（組み合わせ1件）
    if (dishId != null && allergyId != null) {
      const idx = dish_allergy.findIndex((r) => r.dish === dishId && r.allergy === allergyId);
      if (idx === -1) return NextResponse.json({ message: "not found" }, { status: 404 });
      const [deleted] = dish_allergy.splice(idx, 1);
      return NextResponse.json({ message: "削除しました", deleted });
    }

    // 3) dishId のみ（該当 dish のリンク全削除）
    if (dishId != null) {
      const removed: Dish_allergy[] = [];
      for (let i = dish_allergy.length - 1; i >= 0; i--) {
        if (dish_allergy[i].dish === dishId) {
          removed.push(dish_allergy[i]);
          dish_allergy.splice(i, 1);
        }
      }
      return NextResponse.json({ message: "削除しました", deleted: removed });
    }

    return NextResponse.json({ message: "削除条件が指定されていません" }, { status: 400 });
  } catch (e) {
    console.error("DELETE /api/dish_allergies error:", e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
