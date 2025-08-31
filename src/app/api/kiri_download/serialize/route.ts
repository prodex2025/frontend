// GET /api/kiri_download/[serialize]
// 完成（code=200）になったモデルの ZIP を public/model/[serialize]/model.zip に保存する API
//
// 注意:
// - ここでは「完成状態（code=200）」である前提。未完成(2000)やエラー(2001/2009)の場合は 409 を返す。
// - 解凍は別工程（後で adm-zip/unzipper などを使って展開予定）。
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import https from "https";

const API_KEY = process.env.KIRI_API_KEY!;

// Kiri の modelUrl を取得（完成時のみ URL が返る）
async function getModelUrl(serialize: string): Promise<{ code: number; modelUrl?: string; message?: string }> {
  const url = `https://api.kiriengine.app/api/v1/open/model/getModelZip?serialize=${serialize}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${API_KEY}` }, cache: "no-store" });
  const json = await res.json();

  // 完成なら modelUrl が入っている
  if (json?.code === 200 && json?.data?.modelUrl) {
    return { code: 200, modelUrl: json.data.modelUrl };
  }

  // それ以外はそのままコード/メッセージを返却
  return { code: json?.code ?? 500, message: json?.message ?? "Unknown status" };
}

// ZIP を保存
function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Download failed: ${res.statusCode}`));
        return;
      }
      const out = fs.createWriteStream(dest);
      res.pipe(out);
      out.on("finish", () => out.close(() => resolve()));
      out.on("error", (err) => {
        fs.unlink(dest, () => reject(err));
      });
    });
  });
}

export async function GET(
  _req: Request,
  { params }: { params: { serialize: string } }
) {
  const { serialize } = params;
  if (!serialize) {
    return NextResponse.json({ code: 400, message: "serialize が指定されていません" }, { status: 400 });
  }

  try {
    // まず現在の状態を確認
    const status = await getModelUrl(serialize);

    // 未完成 or 生成不可/動画不適合 → ダウンロードを実行せずに 409 を返す
    if (status.code !== 200 || !status.modelUrl) {
      // code をそのまま返すとフロントが分岐しやすい
      return NextResponse.json(
        {
          code: status.code,
          message:
            status.code === 2000
              ? "モデル生成中です"
              : status.code === 2001
              ? "この動画からはモデル生成ができませんでした"
              : status.code === 2009
              ? "動画が要件を満たしていません（アップロード不可）"
              : status.message ?? "モデルが未準備です",
        },
        { status: 409 }
      );
    }

    // 保存先: public/model/[serialize]/model.zip
    const dir = path.join(process.cwd(), "public", "model", serialize);
    fs.mkdirSync(dir, { recursive: true });
    const zipPath = path.join(dir, "model.zip");

    // ZIP ダウンロード
    await downloadFile(status.modelUrl, zipPath);

    return NextResponse.json({
      code: 200,
      message: "ZIP downloaded",
      zip: `/model/${serialize}/model.zip`,
      folder: `/model/${serialize}/`,
    });
  } catch (e: any) {
    return NextResponse.json({ code: 500, message: e.message || "download failed" }, { status: 500 });
  }
}
