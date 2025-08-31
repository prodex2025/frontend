import { NextResponse } from "next/server";
import type { Dishes, Dish_allergy } from "@/data/types"; // 型を types.ts から import
import { dishes, dish_allergy } from "@/data/mockData";   // 既存のモック配列を利用

/**
 * GET /api/dishes
 * - 登録済みの料理一覧を返す（モック）
 */
export async function GET() {
  return NextResponse.json(dishes);
}

/**
 * POST /api/dishes
 * - 新しい料理を追加
 * - 併せてアレルギー（dish_allergy）も保存
 * - video_url は Kiri API 完了まで pending を入れておく
 */
export async function POST(req: Request) {
  try {
    // リクエストボディを受け取り
    const body = await req.json() as {
      name: string;
      price: number | string;
      description?: string;
      image_url?: string;
      serialize?: string;           // Kiri API の serialize（未完了の間はこれを使って pending パスに）
      allergies?: number[];         // 選択されたアレルギーID配列（例: [6,7]）
      restaurant_id?: number;       // 将来的にログインから渡す用。今は未使用
    };

    // いったん固定（ログイン実装後に差し替え）
    const restaurantId = 1;
    // TODO: const restaurantId = session.user.restaurant_id;

    // --- dishes 用の新規 ID を採番（単純に最後尾+1） ---
    const newDishId = dishes.length > 0 ? dishes[dishes.length - 1].id + 1 : 1;

    // --- Dish を組み立て ---
    const newDish: Dishes = {
      id: newDishId,
      restaurant_id: restaurantId,
      name: body.name,
      price: Number(body.price),                 // 数値に正規化
      description: body.description ?? "",
      image_url: body.image_url ?? "",

      /**
       * video_url の扱い
       * - Kiri は非同期生成なのでこの時点では確定URLが無い
       * - serialize が来ているなら pending パスを暫定保存
       * - 後続のバッチ（zip DL & 解凍）で最終URLに更新
       */
      video_url: body.serialize
        ? `/models/pending/${body.serialize}.zip`
        : undefined,
    };

    // --- 料理をモック配列に追加 ---
    dishes.push(newDish);

    // --- アレルギー紐付け（dish_allergy）を追加 ---
    // 受け取った配列が配列でなければスキップ
    const allergies = Array.isArray(body.allergies) ? body.allergies : [];

    // dish_allergy の ID 採番用に現在の最大IDを起点にする
    let nextDishAllergyId =
      dish_allergy.length > 0 ? dish_allergy[dish_allergy.length - 1].id + 1 : 1;

    // バリデーション：number のみ通す
    const createdLinks: Dish_allergy[] = [];
    for (const allergyId of allergies) {
      if (typeof allergyId !== "number" || Number.isNaN(allergyId)) continue;

      const link: Dish_allergy = {
        id: nextDishAllergyId++,
        dish: newDishId,     // いま追加した料理IDに紐付け
        allergy: allergyId,  // 選択されたアレルギーID
      };

      dish_allergy.push(link);
      createdLinks.push(link);
    }

    // --- レスポンス ---
    // 追加した料理と、作成された dish_allergy のリンクを返しておくとフロントが扱いやすい
    return NextResponse.json(
      {
        message: "✅ メニュー追加成功",
        dish: newDish,
        dish_allergies: createdLinks,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/dishes error:", error);
    return NextResponse.json(
      { message: "❌ メニュー追加失敗" },
      { status: 500 }
    );
  }
}