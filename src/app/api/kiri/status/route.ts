// app/api/kiri/status/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * GET /api/kiri/status?taskId=xxxx
 * Kiri の生成状況を確認する（ready=false/true を返す）
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json({ error: "taskId is required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.kiriengine.app/api/v1/open/model/getModelZip?serialize=${taskId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${process.env.KIRI_API_KEY ?? ""}` },
        cache: "no-store",
      }
    );

    const json = await res.json();
    // code: 200=完成, 2000=処理中, 2001=生成不可, 2009=動画要件NG
    if (json.code === 200) {
      return NextResponse.json({
        ok: true,
        code: json.code,
        ready: true,
        modelUrl: json.data?.modelUrl ?? null,
      });
    }
    if (json.code === 2000) {
      return NextResponse.json({ ok: true, code: json.code, ready: false });
    }
    // 失敗系
    return NextResponse.json(
      {
        ok: false,
        code: json.code,
        ready: false,
        message:
          json.code === 2001
            ? "この動画からは3Dモデルを生成できませんでした。"
            : json.code === 2009
            ? "動画が要件を満たしていません（手ブレ・被写体がフレーム外 など）。"
            : "3Dモデル生成に失敗しました。",
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json({ ok: false, error: "status check failed" }, { status: 500 });
  }
}
