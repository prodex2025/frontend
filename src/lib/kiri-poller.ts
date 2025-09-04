// src/lib/kiri-poller.ts
import path from "path";
import fs from "fs/promises";
import { existsSync, mkdirSync, createWriteStream, createReadStream } from "fs";
import https from "https";
import unzipper from "unzipper";
import { dishes } from "@/data/mockData"; // ← モック配列に直接反映（DB実装時に置換）

type QueueItem = { serialize: string; dishId: number };

// モジュールスコープで1プロセス内の簡易キュー
const queue = new Map<string, QueueItem>(); // key: serialize
let pollerStarted = false;

// 環境変数
const API_KEY = process.env.KIRI_API_KEY ?? "";

// ポーリング間隔(ms)
const POLL_INTERVAL = 5000;

// 直列で1回API確認
async function checkOnce(item: QueueItem) {
  const { serialize, dishId } = item;

  // Kiri: 生成ZIPのURL問い合わせ
  const url = `https://api.kiriengine.app/api/v1/open/model/getModelZip?serialize=${encodeURIComponent(
    serialize
  )}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${API_KEY}` },
  });

  const json = await res.json().catch(() => ({}));
  const code = json?.code;

  if (code === 200) {
    // ✅ 完成 → ZIP URL を取得して保存
    const modelUrl: string = json?.data?.modelUrl;
    await downloadAndExtract(serialize, modelUrl);

    // dishes に video_url を反映（OBJの想定パス）
    const baseUrl = `/model/${serialize}`;
    const dish = dishes.find((d) => d.id === dishId);
    if (dish) {
      dish.video_url = `${baseUrl}/3DModel.obj`; // 使用したいパスに合わせて
      // 失敗情報があれば消す
      (dish as any).video_error_code = undefined;
    }

    // キューから除外
    queue.delete(serialize);
    return "done";
  }

  if (code === 2000) {
    // ⌛ 生成中 → 何もせず次回に持ち越し
    return "pending";
  }

  // ❌ 生成不可・要件NGなど（2001 / 2009 ほか）
  const dish = dishes.find((d) => d.id === dishId);
  if (dish) {
    (dish as any).video_error_code = code;
  }
  queue.delete(serialize);
  return "failed";
}

// ZIP をダウンロード → /public/model/<serialize>/ に解凍
async function downloadAndExtract(serialize: string, modelZipUrl: string) {
  const publicDir = path.join(process.cwd(), "public");
  const outDir = path.join(publicDir, "model", serialize);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const tmpDir = path.join(process.cwd(), "tmp");
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

  const zipPath = path.join(tmpDir, `${serialize}.zip`);
  await downloadFile(modelZipUrl, zipPath);

  await extractZip(zipPath, outDir);

  // ZIP は削除（残したいなら消さなくてもOK）
  await fs.unlink(zipPath).catch(() => {});
}

// https で ZIP 保存
function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const ws = createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Download failed: ${res.statusCode}`));
          return;
        }
        res.pipe(ws);
        ws.on("finish", () => ws.close(() => resolve()));
      })
      .on("error", (err) => reject(err));
  });
}

// unzipper で展開
async function extractZip(zipPath: string, outDir: string): Promise<void> {
  await 
    createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: outDir }))
    .promise();
}

// キュー投入（/api/dishes から呼ぶ）
export function enqueueKiriJob(serialize: string, dishId: number) {
  if (!serialize) return;
  queue.set(serialize, { serialize, dishId });
}

// ポーラー起動（アプリ起動時に1回だけ）
export function startKiriPoller() {
  if (pollerStarted) return;
  pollerStarted = true;

  // シンプルな setInterval ポーラー
  setInterval(async () => {
    if (!API_KEY) return; // キー未設定なら何もしない
    const items = Array.from(queue.values());
    for (const item of items) {
      try {
        await checkOnce(item);
      } catch (e) {
        console.error("kiri poll error:", e);
      }
    }
  }, POLL_INTERVAL);
}
