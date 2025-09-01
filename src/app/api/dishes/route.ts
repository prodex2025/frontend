import { NextResponse } from "next/server";
import type { Dishes, Dish_allergy } from "@/data/types";   // 型
import { dishes, dish_allergy } from "@/data/mockData";     // モック配列（DB置換予定）
import { enqueueKiriJob, startKiriPoller } from "@/lib/kiri-poller";

// （重要）アプリ起動時に 1 回だけポーラーを起動。
// 複数回呼ばれても内部で弾く実装なので安全。
startKiriPoller();

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
 * - アレルギー（dish_allergy 中間テーブル）も同時に保存
 * - Kiri での 3D モデル生成は非同期のため、ここでは video_url は未確定
 *   -> フロントは video_url が undefined の間、「生成中」表示にしておく
 *
 * 受け取り想定のボディ（JSON）
 * {
 *   name: string;
 *   price: number | string;
 *   description?: string;
 *   image_url?: string;         // /api/upload/image で保存したパス
 *   video_task_id?: string;     // ★ Kiri の serialize（= 生成ジョブID） ← 重要
 *   allergies?: number[];       // 中間テーブルへ保存するアレルギーID配列
 * }
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name: string;
      price: number | string;
      description?: string;
      image_url?: string;
      video_task_id?: string;     // ← ここを使ってキューへ投入
      allergies?: number[];
      restaurant_id?: number;     // 将来ログインから受ける想定。今は未使用
    };

    // いったん固定。ログイン導入後はセッションから取得に置換予定。
    const restaurantId = 1;

    // --- 新規 ID 採番（単純に最後尾+1） ---
    const newDishId = dishes.length > 0 ? dishes[dishes.length - 1].id + 1 : 1;

    // --- Dish レコードを組み立て ---
    const newDish: Dishes = {
      id: newDishId,
      restaurant_id: restaurantId,
      name: body.name,
      price: Number(body.price),            // 数値に正規化
      description: body.description ?? "",
      image_url: body.image_url ?? "",

      /**
       * video_url の扱い（超重要）
       * - ここでは Kiri の非同期生成がまだ終わっていないので確定URLは無い。
       * - よって「undefined」のまま保存しておく。
       * - バックグラウンドのポーラーが完成を検知したら
       *   `dishes` の該当要素の `video_url` を
       *   `/model/<serialize>/3DModel.obj` のような完成パスへ更新する。
       *
       * UI 側は:
       * - video_url === undefined       -> 「生成中」
       * - video_error_code が入っている -> エラー文言を表示（2001/2009 など）
       * - video_url が文字列             -> 3Dを表示
       */
      video_url: undefined,
    };

    // --- モック配列に Dish を追加 ---
    dishes.push(newDish);

    // --- 中間テーブル dish_allergy を保存 ---
    const allergies = Array.isArray(body.allergies) ? body.allergies : [];
    let nextDishAllergyId =
      dish_allergy.length > 0 ? dish_allergy[dish_allergy.length - 1].id + 1 : 1;

    const createdLinks: Dish_allergy[] = [];
    for (const allergyId of allergies) {
      if (typeof allergyId !== "number" || Number.isNaN(allergyId)) continue;
      const link: Dish_allergy = {
        id: nextDishAllergyId++,
        dish: newDishId,
        allergy: allergyId,
      };
      dish_allergy.push(link);
      createdLinks.push(link);
    }

    // --- ★ Kiri の serialize（= 生成ジョブID）をキューに投入 ---
    //     これにより、サーバ側のポーラーが定期的に Kiri API を叩いて
    //     完成（code=200）になったら ZIP をDL → /public/model/<serialize>/ に解凍 →
    //     dishes の該当要素の video_url を完成パスへ更新する。
    const taskId = body.video_task_id;
    if (taskId && typeof taskId === "string") {
      enqueueKiriJob(taskId, newDishId);
    }

    // --- レスポンス ---
    return NextResponse.json(
      {
        message:
          "✅ メニューを追加しました。3Dモデルはバックグラウンドで生成・反映されます。",
        dish: newDish,
        dish_allergies: createdLinks,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/dishes error:", error);
    return NextResponse.json(
      { message: "❌ メニュー追加に失敗しました" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/dishes
 * - 指定IDの料理を削除（モック配列を直接操作）
 * - 紐づく dish_allergy も削除
 *
 * id の受け取り方:
 * - /api/dishes?id=123  もしくは  body: { "id": 123 }
 */
export async function DELETE(req: Request) {
  try {
    // 1) クエリから id を見る
    const url = new URL(req.url);
    const queryId = url.searchParams.get("id");

    // 2) なければボディから
    let bodyId: unknown = undefined;
    if (!queryId) {
      try {
        const body = (await req.json()) as { id?: unknown } | undefined;
        bodyId = body?.id;
      } catch {
        /* 空ボディは無視 */
      }
    }

    const idRaw = queryId ?? bodyId;
    const dishId = Number(idRaw);

    if (!Number.isFinite(dishId) || dishId <= 0) {
      return NextResponse.json(
        { message: "❌ id が不正です。?id= または JSON ボディ { id } で指定してください。" },
        { status: 400 }
      );
    }

    const idx = dishes.findIndex((d: Dishes) => d.id === dishId);
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
