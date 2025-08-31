import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

// POST /api/upload/image
export async function POST(req: Request) {
  try {
    // フォームデータを取得
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "ファイルがありません" }, { status: 400 });
    }

    // 保存先ディレクトリ
    const uploadDir = path.join(process.cwd(), "public/image");

    // ディレクトリが存在しなければ作成
    await fs.mkdir(uploadDir, { recursive: true });

    // ファイル名をユニークに生成
    const ext = path.extname(file.name);
    const baseName = path.basename(file.name, ext);
    const fileName = `${baseName}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    // ArrayBuffer → Buffer に変換して保存
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // 公開URL（Next.jsの`public`配下はそのまま配信される）
    const fileUrl = `/image/${fileName}`;

    return NextResponse.json({ url: fileUrl }, { status: 200 });
  } catch (error) {
    console.error("画像アップロードエラー:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}