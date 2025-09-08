import { NextResponse } from 'next/server';  

// Next.js app router ではデフォルトが "edge runtime" になる場合があるため、
// Kiri API への通信やファイル操作を安定させるために "nodejs" を指定する。
export const runtime = 'nodejs';

/**
 * POST /api/kiri_upload
 * - フロントから送られた動画ファイルを受け取る
 * - Kiri Engine API にそのまま中継し、3Dモデル生成のジョブを依頼する
 * - 戻り値として Kiri 側の "serialize" (= taskId) を返す
 */
export async function POST(req: Request) {
  try {
    // 1. 環境変数から KIRI_API_KEY を取得
    const API_KEY = process.env.KIRI_API_KEY;
    if (!API_KEY) {
      // APIキーが設定されていない場合は即エラー
      return NextResponse.json({ error: 'KIRI_API_KEY is not set' }, { status: 500 });
    }

    // 2. フロントから送られた multipart/form-data を取得
    //    app router では req.formData() が標準で使える
    const form = await req.formData();

    // 3. 動画ファイルを取り出す（input の name="video" と一致させる）
    const video = form.get('video') as File | null;
    if (!video) {
      return NextResponse.json({ error: 'video is required' }, { status: 400 });
    }

    // 4. File → Blob に変換
    //    Node.js 18 以降は fetch / FormData / Blob が標準実装されているので追加パッケージ不要
    const bytes = await video.arrayBuffer();
    const blob = new Blob([Buffer.from(bytes)], { type: video.type || 'video/mp4' });

    // 5. Kiri API に送る form-data を作成
    //    Kiri API が求めるキーは "videoFile"
    const fd = new FormData();
    fd.append('videoFile', blob, video.name);
    fd.append('modelQuality', '1');     // Medium品質
    fd.append('textureQuality', '1');   // 2Kテクスチャ
    fd.append('fileFormat', 'OBJ');     // 出力フォーマットは OBJ
    fd.append('isMask', '1');           // 自動マスクON
    fd.append('textureSmoothing', '1'); // テクスチャスムージングON

    // 6. Kiri API にリクエスト送信
    const res = await fetch('https://api.kiriengine.app/api/v1/open/photo/video', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`, // 認証ヘッダ
      },
      body: fd, // 作成した form-data をそのまま送信
    });

    // 7. レスポンスを JSON として取得
    const json = await res.json();

    // 8. Kiri 側から返ってくる "serialize" (= taskId) を抽出
    //    - code=2000: モデル生成中（serialize だけ返る）
    //    - code=200 : モデル生成完了
    //    - その他   : エラー
    const taskId = json?.data?.serialize ?? null;

    // 9. フロントに返すデータ
    //    - taskId: 後続で生成完了をチェックするためのID
    //    - code:   Kiri API が返すステータスコード
    //    - raw:    デバッグ用にそのまま返す
    return NextResponse.json(
      { code: json.code, taskId, raw: json },
      { status: res.status }
    );

  } catch (e) {
    // 10. サーバ側の例外処理
    console.error('kiri upload error', e);
    return NextResponse.json({ error: 'kiri upload failed' }, { status: 500 });
  }
}