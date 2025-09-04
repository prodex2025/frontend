// app/api/dishes/route.ts
import { NextRequest, NextResponse } from "next/server";
import type { Dishes, Dish_allergy } from "@/data/types";   // 型
import { dishes, dish_allergy } from "@/data/mockData";     // モック配列（DB置換予定）
import { enqueueKiriJob, startKiriPoller } from "@/lib/kiri-poller";

// 毎回最新を返す（App Router キャッシュ無効化）
export const dynamic = "force-dynamic";

// アプリ起動時に1回だけポーラーを起動（内部で多重起動ガード済み）
startKiriPoller();

/* ------------------ utils ------------------ */
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

/* ------------------ GET /api/dishes ------------------ */
/**
 * 返却は常に配列。
 * - /api/dishes?restaurantId=10
 * - /api/dishes?restaurantId=10&dishId=2  → [単一 or 空配列]
 * - /api/dishes?dishId=2                  → [単一 or 空配列]
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const restaurantId = toNumQ(url.searchParams.get("restaurantId"));
    const dishId = toNumQ(url.searchParams.get("dishId"));

    let list: Dishes[] = Array.isArray(dishes) ? [...dishes] : [];

    if (restaurantId != null) {
      list = list.filter((d) => d.restaurant_id === restaurantId);
    }

    if (dishId != null) {
      const found = list.find((d) => d.id === dishId);
      return NextResponse.json<Dishes[]>(found ? [found] : []);
    }

    return NextResponse.json<Dishes[]>(list);
  } catch (error) {
    console.error("GET /api/dishes error:", error);
    return NextResponse.json({ message: "❌ 内部エラーが発生しました。" }, { status: 500 });
  }
}

/* ------------------ POST /api/dishes ------------------ */
/**
 * 受信ボディ例:
 * {
 *   name: string;
 *   price: number|string;
 *   description?: string;
 *   image_url?: string;       // 画像アップAPIの保存パス
 *   video_task_id?: string;   // Kiri の serialize（生成ジョブID）
 *   allergies?: number[];     // 中間テーブルへ保存するアレルギーID配列
 *   restaurant_id: number;    // ★固定廃止→ここから取得
 * }
 */
type PostBody = {
  name: string;
  price: number | string;
  description?: string;
  image_url?: string;
  video_task_id?: string;
  allergies?: unknown;
  restaurant_id?: number | string;
};

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const qRestaurantId = toNumQ(url.searchParams.get("restaurantId")); // フォールバック用（任意）

    const body = (await req.json()) as PostBody;

    // 必須: name / price / restaurant_id
    const name = String(body?.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ message: "❌ name は必須です。" }, { status: 400 });
    }

    const price = toNumU(body?.price);
    if (price == null || price < 0) {
      return NextResponse.json({ message: "❌ price が不正です（0以上の数値）。" }, { status: 400 });
    }

    // ✅ 固定を廃止。body.restaurant_id を優先し、なければ ?restaurantId= を使う
    const restaurantId = toNumU(body?.restaurant_id) ?? qRestaurantId;
    if (restaurantId == null || restaurantId <= 0) {
      return NextResponse.json(
        { message: "❌ restaurant_id が不正です（body か ?restaurantId= で正の数値を渡してください）。" },
        { status: 400 }
      );
    }

    const description = String(body?.description ?? "");
    const image_url = String(body?.image_url ?? "");
    const video_task_id =
      typeof body?.video_task_id === "string" && body.video_task_id.trim()
        ? body.video_task_id.trim()
        : undefined;

    // アレルギーID配列を正規化・重複除去
    const allergyIds: number[] = Array.isArray(body?.allergies)
      ? [
          ...new Set(
            (body!.allergies as unknown[])
              .map((v) => toNumU(v))
              .filter((n): n is number => n != null)
          ),
        ]
      : [];

    // 採番
    const newDishId = nextIdFrom(dishes);

    // Dish作成（video_url は Kiri 完了まで undefined）
    const newDish: Dishes = {
      id: newDishId,
      restaurant_id: restaurantId,
      name,
      price,
      description,
      image_url,
      video_url: undefined,
    };

    dishes.push(newDish);

    // 中間テーブル作成
    let nextLinkId = nextIdFrom(dish_allergy);
    const createdLinks: Dish_allergy[] = [];
    for (const allergyId of allergyIds) {
      const link: Dish_allergy = { id: nextLinkId++, dish: newDishId, allergy: allergyId };
      dish_allergy.push(link);
      createdLinks.push(link);
    }

    // Kiri の生成ジョブをキュー投入（完了時に dishes[].video_url を更新する想定）
    if (video_task_id) {
      enqueueKiriJob(video_task_id, newDishId);
    }

    return NextResponse.json(
      {
        message: "✅ メニューを追加しました。3Dモデルはバックグラウンドで生成・反映されます。",
        dish: newDish,
        dish_allergies: createdLinks,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/dishes error:", error);
    return NextResponse.json({ message: "❌ メニュー追加に失敗しました。" }, { status: 500 });
  }
}

/* ------------------ DELETE /api/dishes ------------------ */
/**
 * 指定IDの料理を削除。対応入力:
 * - /api/dishes?id=123
 * - body: { "id": 123 }
 * 紐づく dish_allergy も同時に削除。
 */
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("id");
    let idUnknown: unknown = q;

    if (!q) {
      try {
        const b = (await req.json()) as { id?: unknown } | undefined;
        idUnknown = b?.id;
      } catch {
        /* 空ボディは無視 */
      }
    }

    const dishId = toNumU(idUnknown);
    if (dishId == null || dishId <= 0) {
      return NextResponse.json(
        { message: "❌ id が不正です。?id= または JSON ボディ { id } で指定してください。" },
        { status: 400 }
      );
    }

    const idx = dishes.findIndex((d) => d.id === dishId);
    if (idx === -1) {
      return NextResponse.json(
        { message: `❌ 指定された料理（id=${dishId}）は存在しません。` },
        { status: 404 }
      );
    }

    // 料理を削除
    const [deletedDish] = dishes.splice(idx, 1);

    // 紐付く dish_allergy も削除
    const removedLinks: Dish_allergy[] = [];
    for (let i = dish_allergy.length - 1; i >= 0; i--) {
      if (dish_allergy[i].dish === dishId) {
        removedLinks.push(dish_allergy[i]);
        dish_allergy.splice(i, 1);
      }
    }

    return NextResponse.json(
      {
        message: "✅ 削除に成功しました。",
        deleted_dish: deletedDish,
        deleted_allergy_links: removedLinks,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/dishes error:", error);
    return NextResponse.json(
      { message: "❌ 予期せぬエラーが発生しました。" },
      { status: 500 }
    );
  }
}