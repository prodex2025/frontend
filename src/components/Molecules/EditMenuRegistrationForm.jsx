'use client';

import React, { useState } from "react";
import styles from "@/styles/EditMenuTab.module.css";
import { allergy } from "@/data/mockData";

// コンポーネント
import ApprovalsInput from "@/components/atoms/ApprovalsInput";
import ApprovalsTextarea from "@/components/atoms/ApprovalsTextarea";
import ApprovalsImg from "@/components/atoms/ApprovalsImg";
import ApprovalsVideo from "@/components/atoms/ApprovalsVideo";

/**
 * 🍳 料理新規登録モーダル（追加専用）
 * - 画像は /api/upload/image に保存 → 返ってきたURLを使用
 * - 動画は /api/kiri_upload に中継 → Kiriの serialize(=taskId) を保持して「生成中」状態に
 * - /api/dishes に video_task_id として登録（生成完了後に別フローで video_url を確定）
 */
export default function EditMenuRegistartionForm({ restaurantId,onSuccess, onCancel }) {
  const [selectedAllergies, setSelectedAllergies] = useState([]); // アレルギー選択状態
  const [loading, setLoading] = useState(false);                   // API通信中フラグ
  const [errorMsg, setErrorMsg] = useState("");                    // エラー表示

  // アレルギータグのON/OFF
  const toggleAllergy = (id) => {
    setSelectedAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // Kiriのコードをユーザー向けメッセージに変換
  const msgFromKiriCode = (code) => {
    if (code === 2000) return "動画を送信しました。現在3Dモデルを生成中です。";
    if (code === 2001) return "この動画からは3Dモデルを生成できませんでした。";
    if (code === 2009) return "動画が要件を満たしていません（手ブレ・被写体がフレーム外 など）。別の動画でお試しください。";
    return "動画アップロードに失敗しました。";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrorMsg("");
    setLoading(true);

    try {
      const formEl = e.target;
      const formData = new FormData(formEl);

      // --- 入力バリデーション（最低限） ---
      const name = String(formData.get("name") || "").trim();
      const rawPrice = String(formData.get("price") ?? "").trim();
      const priceNum = Number(rawPrice);
      if (!rawPrice || Number.isNaN(priceNum) || priceNum < 0) {
        throw new Error("価格は0以上の数値で入力してください。");
      }
      if (!name) throw new Error("料理名は必須です。");
      if (Number.isNaN(priceNum) || priceNum < 0) throw new Error("価格は0以上の数値で入力してください。");

      if (!Number.isFinite(Number(restaurantId)) || Number(restaurantId) <= 0) {
        throw new Error("店舗IDが取得できません。画面を再読み込みしてください。");
      }

      // --- 画像アップロード ---
      let imageUrl = "";
      const imageFile = formData.get("image_url");
      if (imageFile && imageFile.size > 0) {
        const imgForm = new FormData();
        imgForm.append("file", imageFile);
        const imgRes = await fetch("/api/upload/image", { method: "POST", body: imgForm });
        const imgJson = await imgRes.json();
        if (!imgRes.ok) throw new Error(imgJson?.error || "画像アップロードに失敗しました。");
        imageUrl = imgJson.url; // 例: /image/xxx.png
      }

      // --- 動画アップロード（Kiriへ中継） ---
      // 成功時: code=2000(処理中) でもserializeが返る実装にしてあるとベター。
      // ここでは taskId または data.serialize のどちらでも拾う。
      let videoTaskId = "";
      const videoFile = formData.get("video_url");
      if (videoFile && videoFile.size > 0) {
        const videoForm = new FormData();
        videoForm.append("video", videoFile);

        const videoRes = await fetch("/api/kiri_upload", { method: "POST", body: videoForm });
        const videoJson = await videoRes.json();

        // 期待する返り値候補:
        // - { taskId: "xxxx" }  または
        // - { code:2000, data:{ serialize:"xxxx" } } / { code:200, data:{ serialize:"xxxx" } }
        const taskId = videoJson?.taskId || videoJson?.data?.serialize;

        if (!videoRes.ok || !taskId) {
          // code を見て分岐メッセージ
          const code = videoJson?.code;
          throw new Error(msgFromKiriCode(code));
        }
        videoTaskId = taskId;
      }

      // --- 新規料理ペイロード ---
      const payload = {
        name,
        price: priceNum,
        description: String(formData.get("description") || ""),
        image_url: imageUrl,
        video_url: videoTaskId, // ← 生成ジョブのIDを保持。UI側で「生成中」を表示できる
        allergies: selectedAllergies, // ← 別テーブルに保存する場合はAPI側で分解して保存
        restaurant_id: Number(restaurantId), 
      };

      // --- 登録（モック配列に追加するAPI） ---
      const dishRes = await fetch("/api/dishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const dishJson = await dishRes.json();
      if (!dishRes.ok) throw new Error(dishJson?.message || "料理登録に失敗しました。");

      // ✅ 成功 → 親に通知（親側でモーダル閉 & 一覧再読込）
      onSuccess?.(dishJson.dish);
    } catch (err) {
      setErrorMsg(err.message || "登録に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-busy={loading}>
      <h2 className={styles.h2}>料理新規登録</h2>

      {/* 画像アップロード */}
      <ApprovalsImg name="image_url" id="image_url" text="料理の写真" />

      {/* 動画アップロード */}
      <ApprovalsVideo name="video_url" id="video_url" text="料理の動画（.mp4のみ対応）" />
      <small>料理を360°撮影した動画をアップロードしてください（.mp4のみ対応）。</small>

      {/* 料理名 */}
      <ApprovalsInput type="text" name="name" id="name" text="料理名" />

      {/* 価格 */}
      <div className={styles.priceWrapper}>
        <ApprovalsInput type="number" name="price" id="price" text="価格" min="0" />
        <span className={styles.yen}>円</span>
      </div>

      {/* アレルギー */}
      <div className={styles.allergySection}>
        <label>アレルギー情報</label>
        <div className={styles.allergyList}>
          {allergy.map((a) => (
            <button
              type="button"
              key={a.id}
              className={`${styles.allergyTag} ${selectedAllergies.includes(a.id) ? styles.selected : ""}`}
              onClick={() => toggleAllergy(a.id)}
            >
              {a.name}
            </button>
          ))}
        </div>
      </div>

      {/* コメント */}
      <ApprovalsTextarea name="description" id="description" text="料理へのコメント" />

      {/* エラー表示 */}
      {errorMsg && <p className={styles.error}>{errorMsg}</p>}

      {/* フッター */}
      <div className={styles.footerContent}>
        <p className={styles.p}>内容を確認後「登録」ボタンを押してください。</p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={loading}
          >
          </button>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "登録中..." : "登録"}
          </button>
        </div>
      </div>
    </form>
  );
}