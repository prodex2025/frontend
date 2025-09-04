// app/api/kiri/finalize/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import https from "https";
import AdmZip from "adm-zip";
import { dishes } from "@/data/mockData";

export const runtime = "nodejs";

/**
 * POST /api/kiri/finalize
 * body: { taskId: string, dishId: number, modelUrl: string }
 * - ZIP を保存→解凍→モック更新
 */
export async function POST(req: Request) {
  try {
    const { taskId, dishId, modelUrl } = await req.json();

    if (!taskId || !dishId || !modelUrl) {
      return NextResponse.json({ error: "taskId/dishId/modelUrl required" }, { status: 400 });
    }

    // 保存先
    const publicDir = path.join(process.cwd(), "public");
    const modelDir = path.join(publicDir, "model", taskId);
    const zipPath = path.join(publicDir, "model", `${taskId}.zip`);

    // ディレクトリ作成
    fs.mkdirSync(path.dirname(zipPath), { recursive: true });

    // ZIPダウンロード
    await new Promise<void>((resolve, reject) => {
      const fileStream = fs.createWriteStream(zipPath);
      https.get(modelUrl, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`download failed: ${res.statusCode}`));
          return;
        }
        res.pipe(fileStream);
        fileStream.on("finish", () => {
          fileStream.close();
          resolve();
        });
        fileStream.on("error", reject);
      }).on("error", reject);
    });

    // 解凍
    fs.mkdirSync(modelDir, { recursive: true });
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(modelDir, true);

    // モック更新（LowPoly を優先して表示用に使う例）
    const objPathWeb =
      fs.existsSync(path.join(modelDir, "3DModel_LowPoly.obj"))
        ? `/model/${taskId}/3DModel_LowPoly.obj`
        : `/model/${taskId}/3DModel.obj`;

    const target = dishes.find((d) => d.id === Number(dishId));
    if (target) {
      target.video_url = objPathWeb;
      // video_task_id を持たせているなら、ここで消す/成功フラグに変える等
      // (型にないならスキップ)
      (target as any).video_task_id = undefined;
    }

    return NextResponse.json({
      ok: true,
      video_url: objPathWeb,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "finalize failed" }, { status: 500 });
  }
}
