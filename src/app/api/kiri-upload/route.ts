import { NextRequest, NextResponse } from "next/server";
import FormData from "form-data";

/**
 * Kiri Engine: 動画アップロード → 3D生成ジョブ起票
 * - App Router向け: req.formData() で multipart/form-data をパース
 * - Web File を Buffer 化して form-data に詰め直し、Kiri API へ中継
 * - レスポンスはフロントで扱いやすいように { code, taskId, raw } に正規化
 *
 * 期待するフロントからの送信:
 * <input type="file" name="video" accept="video/*" />
 */
export async function POST(req: NextRequest) {
  try {
    const API_KEY = process.env.KIRI_API_KEY;
    if (!API_KEY) {
      return NextResponse.json(
        { error: "KIRI_API_KEY is not set" },
        { status: 500 }
      );
    }

    // 1) multipart/form-data をパース (App Router ではこれでOK)
    const form = await req.formData();
    const video = form.get("video") as File | null;
    if (!video) {
      return NextResponse.json(
        { error: 'No file. Expected field name "video".' },
        { status: 400 }
      );
    }

    // 2) Web File → Buffer に変換
    const arrayBuf = await video.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    // 3) Kiri API に送る form-data を組み立て
    //    ※ form-data には Buffer と filename / contentType を明示
    const fd = new FormData();
    fd.append("videoFile", buffer, {
      filename: video.name || "upload.mp4",
      contentType: video.type || "video/mp4",
      knownLength: buffer.length,
    });
    fd.append("modelQuality", "1");      // Medium
    fd.append("textureQuality", "1");    // 2K
    fd.append("fileFormat", "OBJ");      // 出力フォーマット
    fd.append("isMask", "1");            // 自動マスクON
    fd.append("textureSmoothing", "1");  // テクスチャスムージングON

    // 4) Kiri API に POST
    const uploadRes = await fetch(
      "https://api.kiriengine.app/api/v1/open/photo/video",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          ...fd.getHeaders(),
        } as any, // getHeaders() は form-data 固有
        body: fd as any,
      }
    );

    const json = await uploadRes.json();

    // 5) フロントで扱いやすいように正規化した形で返す
    // Kiriのレスポンスは実装により { taskId } or { data:{ serialize } } など揺れがある想定
    const code: number | undefined = json?.code;
    const taskId: string | undefined =
      json?.taskId ?? json?.data?.serialize ?? json?.data?.taskId;

    // 参考: Kiriコード
    // - 200  : 完了（このAPIでは基本起票直後なので滅多に無い）
    // - 2000 : 受付・処理中（想定の正常系）
    // - 2001 : 生成不可
    // - 2009 : 動画が要件未満
    // 失敗時も raw を返してデバッグしやすく
    return NextResponse.json(
      {
        code: code ?? uploadRes.status,
        taskId,       // ← フロントはこれを video_task_id として保存
        raw: json,    // ← 必要に応じて参照
      },
      { status: uploadRes.ok ? 200 : 400 }
    );
  } catch (err: any) {
    console.error("Kiri upload error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Upload failed" },
      { status: 500 }
    );
  }
}
