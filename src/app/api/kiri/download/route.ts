// Kiri の生成済みモデルZIPを取得→解凍→/public/model/<serialize>/ に保存するAPI
// POST /api/kiri/download  { serialize: string }
//
// 返却: {
//   serialize: string,
//   baseUrl: string,               // 例: /model/<serialize>/
//   files: string[],               // 保存されたファイル名の配列
//   primaryObjUrl?: string         // 代表的に表示させたい .obj へのURL（存在すれば）
// }

import { NextRequest, NextResponse } from "next/server";
import path from "path";
import https from "https";
import fs from "fs/promises";                      // Promise系（writeFile, unlink など）
import { existsSync, mkdirSync, createWriteStream, createReadStream } from "fs"; // Stream系
import unzipper from "unzipper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ====== 設定値（必要に応じて調整） ======
const POLL_INTERVAL_MS = 3000; // Kiri の ZIP URL を取りに行く間隔
const MAX_RETRY = 40;          // 最大リトライ回数（3秒 * 40 = 約2分）

// ▼ Kiri から「ZIPダウンロードURL」を取得できるまでポーリング
async function waitForModelZipUrl(serialize: string): Promise<string> {
  const API_KEY = process.env.KIRI_API_KEY;
  if (!API_KEY) throw new Error("KIRI_API_KEY is not set");

  const url = `https://api.kiriengine.app/api/v1/open/model/getModelZip?serialize=${encodeURIComponent(serialize)}`;

  for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${API_KEY}` },
      });
      const json = await res.json();

      // Kiri側の仕様（あなたの情報に合わせて）
      // code: 200  → ZIPダウンロードURLが json.data.modelUrl に入っている
      // code: 2000 → 生成中
      // code: 2001 → 生成不可
      // code: 2009 → 動画が要件を満たさずアップ不可
      if (json.code === 200 && json?.data?.modelUrl) {
        return json.data.modelUrl as string;
      }
      if (json.code === 2000) {
        // 生成中：次のループで再試行
      } else {
        // その他はエラー扱いにして明示
        throw new Error(`Kiri returned error code=${json.code}`);
      }
    } catch (e) {
      // ネットワーク/一時的エラーはログだけ出して再試行
      console.warn(`[waitForModelZipUrl] attempt=${attempt} error=`, (e as Error)?.message);
    }

    // 次回まで待機
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error("Timeout: could not obtain model zip url from Kiri");
}

// ▼ https で ZIP をローカルに保存
async function downloadToFile(fileUrl: string, destPath: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const file = createWriteStream(destPath);
    https
      .get(fileUrl, (res) => {
        if (res.statusCode !== 200) {
          file.close();
          return reject(new Error(`Download failed. status=${res.statusCode}`));
        }
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve(); // ← resolve をコールバックとして渡さず、関数呼び出しでOK
        });
        file.on("error", reject);
      })
      .on("error", reject);
  });
}

// ▼ ZIP を /public/model/<serialize>/ に解凍
async function extractZipToPublic(zipPath: string, serialize: string): Promise<string[]> {
  const publicDir = path.join(process.cwd(), "public");
  const destDir = path.join(publicDir, "model", serialize);

  // 保存先ディレクトリが無ければ作成
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

  // unzipper.Extract を使って展開
  // 型定義の関係で .promise() にエラーが出ることがありますが、そのままでOKな場合が多いです。
  await new Promise<void>((resolve, reject) => {
    // createReadStream は fs.promises ではなく fs から！
    createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: destDir }))
      .on("close", () => resolve())
      .on("error", reject);
  });

  // 展開後にディレクトリ内のファイル一覧を返す
  const names = await fs.readdir(destDir);
  return names;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as { serialize?: string } | null;
    const serialize = body?.serialize?.trim();
    if (!serialize) {
      return NextResponse.json({ error: "serialize is required" }, { status: 400 });
    }

    // 1) ZIPダウンロードURLの準備完了を待つ（ポーリング）
    const zipUrl = await waitForModelZipUrl(serialize);

    // 2) 一時ディレクトリ＆ファイル
    const tmpDir = path.join(process.cwd(), "tmp");
    if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });
    const zipPath = path.join(tmpDir, `${serialize}.zip`);

    // 3) ZIP をダウンロード
    await downloadToFile(zipUrl, zipPath);

    // 4) ZIP を /public/model/<serialize>/ に展開
    const files = await extractZipToPublic(zipPath, serialize);

    // 5) 一時ZIPは削除（失敗しても無視）
    await fs.unlink(zipPath).catch(() => {});

    // 6) 代表OBJを推測（LowPoly優先→通常）
    const primaryObj =
      files.find((f) => /3DModel_LowPoly\.obj$/i.test(f)) ??
      files.find((f) => /3DModel\.obj$/i.test(f));

    const baseUrl = `/model/${serialize}/`;
    const resp = {
      serialize,
      baseUrl,                   // このベースに OBJ/MTL/JPG を相対参照
      files,                     // 展開されたファイル名の一覧
      primaryObjUrl: primaryObj ? `${baseUrl}${primaryObj}` : undefined,
    };

    // ここで DB 更新を行うなら（例）:
    // - dishes テーブルの対象レコードを serialize で特定
    // - video_url を baseUrl に更新（または primaryObjUrl を保存）
    //
    // 例: await updateDishBySerialize(serialize, { video_url: baseUrl });

    return NextResponse.json(resp, { status: 200 });
  } catch (e: any) {
    console.error("kiri/download error:", e);
    return NextResponse.json({ error: e?.message ?? "download failed" }, { status: 500 });
  }
}