// app/api/upload/video/route.ts
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { existsSync, mkdirSync } from "fs";
import { randomUUID } from "crypto";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

// App Router は Node ランタイムで動かす（ffmpeg を使うため）
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ffmpeg バイナリのパスを fluent-ffmpeg に教える
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

// 受け付ける最大サイズ（例：300MB）
const MAX_BYTES = 300 * 1024 * 1024;

// 許可する拡張子/ MIME
const VIDEO_MIMES = new Set([
  "video/mp4",
  "video/quicktime", // .mov
  "video/x-matroska",
  "video/webm",
]);
const MOV_EXTS = new Set([".mov", ".qt"]);

/**
 * POST /api/upload/video
 * 受け取った動画を /public/video に保存
 * - .mov（または QuickTime）なら mp4(H.264/AAC) に変換
 * - mp4 などならそのまま保存
 * レスポンス: { url, converted, mime, filename }
 */
export async function POST(req: NextRequest) {
  let tmpInPath = "";
  try {
    const form = await req.formData();
    const file = form.get("video") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file. Expect field "video".' },
        { status: 400 }
      );
    }

    // 簡易サイズチェック（File.size はブラウザが送ってくる値）
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File too large." },
        { status: 413 }
      );
    }

    // 基本情報
    const origName = (file.name || "upload").replace(/\s+/g, "_");
    const mime = file.type || "application/octet-stream";
    const ext = (path.extname(origName) || "").toLowerCase();

    // video 以外を弾く（拡張子だけに依存しない）
    if (!VIDEO_MIMES.has(mime) && !ext) {
      return NextResponse.json(
        { error: "Unsupported file type." },
        { status: 415 }
      );
    }

    // 保存先準備
    const publicDir = path.join(process.cwd(), "public");
    const outDir = path.join(publicDir, "video");
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    // 一時保存先
    const tmpDir = path.join(process.cwd(), "tmp");
    if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

    // まず一時ファイルに書き出し
    const bytes = Buffer.from(await file.arrayBuffer());
    // 一時ファイルは .mov / .mp4 といった元拡張子のままでOK
    const tmpName = `${Date.now()}_${origName}`;
    tmpInPath = path.join(tmpDir, tmpName);
    await fs.writeFile(tmpInPath, bytes);

    // 変換が必要かどうか判定
    const needsConvert =
      mime === "video/quicktime" || MOV_EXTS.has(ext);

    // 出力ファイル名は UUID で衝突を避ける
    // 変換あり：.mp4 で保存
    // 変換なし：拡張子を維持（.mp4 など）
    const finalName = needsConvert
      ? `${randomUUID()}.mp4`
      : `${randomUUID()}${ext || ".mp4"}`; // 拡張子不明時は mp4 に寄せる
    const finalPath = path.join(outDir, finalName);

    if (needsConvert) {
      // .mov → .mp4 (H.264/AAC)
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tmpInPath)
          .videoCodec("libx264")
          .audioCodec("aac")
          .outputOptions([
            "-movflags +faststart", // プログレッシブ再生を早く
            "-pix_fmt yuv420p",     // 互換性高いピクセルフォーマット
          ])
          .on("end", () => resolve())
          .on("error", (err) => reject(err))
          .save(finalPath);
      });
    } else {
      // mp4 などはそのまま配置
      await fs.copyFile(tmpInPath, finalPath);
    }

    // 一時ファイル削除（失敗しても無視）
    try { await fs.unlink(tmpInPath); } catch {}

    // public 配下は / から直接参照できる
    const url = `/video/${finalName}`;

    return NextResponse.json({
      url,
      converted: needsConvert,
      mime: needsConvert ? "video/mp4" : mime,
      filename: finalName,
    });
  } catch (e: any) {
    console.error("video upload error:", e);
    // 失敗時に一時ファイルが残っていたら掃除
    if (tmpInPath) {
      try { await fs.unlink(tmpInPath); } catch {}
    }
    return NextResponse.json(
      { error: e?.message ?? "upload failed" },
      { status: 500 }
    );
  }
}