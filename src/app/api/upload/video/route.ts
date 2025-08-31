import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { existsSync, mkdirSync, createWriteStream } from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

export const runtime = "nodejs";        // ← App Router: Node ランタイムを明示
export const dynamic = "force-dynamic"; // ← 動的ルート

// ffmpeg バイナリのパス設定（fluent-ffmpeg に教える）
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

/**
 * 受け取った動画を /public/video に保存
 * - mov の場合は mp4(H.264/AAC) に変換
 * - mp4 の場合はそのまま保存
 * 返り値: { url, converted, mime, filename }
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("video") as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file. Expect field "video".' }, { status: 400 });
    }

    // 保存先の用意
    const publicDir = path.join(process.cwd(), "public");
    const videoOutDir = path.join(publicDir, "video");
    if (!existsSync(videoOutDir)) mkdirSync(videoOutDir, { recursive: true });

    // 受け取ったファイルを一旦 /tmp に保存
    const arrayBuf = await file.arrayBuffer();
    const buf = Buffer.from(arrayBuf);
    const tmpDir = path.join(process.cwd(), "tmp");
    if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

    // 元ファイル名・拡張子推定
    const origName = file.name || "upload.mov";
    const origMime = file.type || "video/quicktime";
    const ext = path.extname(origName).toLowerCase() || ".mov";

    const baseName = `${Date.now()}_${origName.replace(/\s+/g, "_")}`;
    const tmpInPath = path.join(tmpDir, baseName);

    await fs.writeFile(tmpInPath, buf);

    const needsConvert =
      ext === ".mov" ||
      origMime === "video/quicktime" ||
      origMime === "" // 不明な場合も念のため変換したいなら true にしてOK
      ;

    let finalFilename = "";
    let finalPath = "";

    if (needsConvert) {
      // 変換先ファイル名（.mp4）
      finalFilename = baseName.replace(/\.[^.]+$/, "") + ".mp4";
      finalPath = path.join(videoOutDir, finalFilename);

      await new Promise<void>((resolve, reject) => {
        ffmpeg(tmpInPath)
          // H.264 / AAC にする（互換性重視）
          .videoCodec("libx264")
          .audioCodec("aac")
          .outputOptions([
            "-movflags +faststart", // ストリーミング再生を速く
            "-pix_fmt yuv420p",     // 互換性の高いピクセルフォーマット
          ])
          .on("end", () => resolve())
          .on("error", (err) => reject(err))
          .save(finalPath);
      });
    } else {
      // mp4 等ならそのまま public/video に保存
      finalFilename = baseName;
      finalPath = path.join(videoOutDir, finalFilename);
      await fs.copyFile(tmpInPath, finalPath);
    }

    // tmp を削除（不要なら残してもOK）
    await fs.unlink(tmpInPath).catch(() => {});

    // クライアントから参照するURL
    const urlPath = `/video/${finalFilename}`;

    return NextResponse.json({
      url: urlPath,
      converted: needsConvert,
      mime: needsConvert ? "video/mp4" : origMime,
      filename: finalFilename,
    });
  } catch (e: any) {
    console.error("video upload error:", e);
    return NextResponse.json({ error: e?.message ?? "upload failed" }, { status: 500 });
  }
}
