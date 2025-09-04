import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/**
 * POST /api/upload/image
 * - フロントから送られた画像ファイルを public/image フォルダに保存
 * - 保存した画像の URL を返す
 */
export async function POST(req: Request) {
  try {
    // 1. フロントから送られた multipart/form-data を取得
    const formData = await req.formData();

    // 2. フィールド名 "file" の画像を取り出す
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    // 3. ファイルをバイト配列に変換
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. 保存先のパスを決定
    //    public/image/ 以下に保存する
    const uploadDir = path.join(process.cwd(), "public", "image");

    // public/image ディレクトリが存在しない場合は作成
    await fs.mkdir(uploadDir, { recursive: true });

    // オリジナルのファイル名を使う（必要に応じて UUID に置き換えてもOK）
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    // 5. ファイルを保存
    await fs.writeFile(filePath, buffer);

    // 6. フロントに返す URL を生成
    //    Next.js の public/ 配下は自動的にルート直下からアクセスできる
    const fileUrl = `/image/${fileName}`;

    return NextResponse.json({ url: fileUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}