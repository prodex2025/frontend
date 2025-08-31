// GET /api/kiri_status/[serialize]
// Kiri Engine のモデル生成ステータスを確認する API（プロキシ）
//
// 仕様（Kiri Engine 側レスポンスに準拠）
// - code: 200    → 完成（data.modelUrl が取得可能）
// - code: 2000   → 処理中（まだ出来ていない）
// - code: 2001   → 生成不可（この素材からはモデルを作れない）
// - code: 2009   → 動画が要件を満たしていないためアップロード不可
//
// 本APIはそのまま code や data を返す。フロントで分岐しやすくするため。
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { serialize: string } }
) {
  const API_KEY = process.env.KIRI_API_KEY!;
  const { serialize } = params;

  if (!serialize) {
    return NextResponse.json({ code: 400, message: "serialize が指定されていません" }, { status: 400 });
  }

  const url = `https://api.kiriengine.app/api/v1/open/model/getModelZip?serialize=${serialize}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${API_KEY}` },
      cache: "no-store",
    });
    const json = await res.json();

    // ここでは Kiri のレスポンスをそのまま返す（code と message/data を維持）
    // フロント側で code に応じて分岐・表示を行う
    return NextResponse.json(json, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ code: 500, message: e.message || "status check failed" }, { status: 500 });
  }
}