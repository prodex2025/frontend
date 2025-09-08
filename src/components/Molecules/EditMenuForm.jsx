'use client';

import React, { useEffect, useMemo, useState } from "react";
import styles from "@/styles/EditMenuTab.module.css";
import { allergy } from "@/data/mockData";

// コンポーネント
import ApprovalsInput from "@/components/atoms/ApprovalsInput";
import ApprovalsTextarea from "@/components/atoms/ApprovalsTextarea";
import ApprovalsImg from "@/components/atoms/ApprovalsImg";
import ApprovalsVideo from "@/components/atoms/ApprovalsVideo";
import ThreeModelViewer from "@/components/atoms/ThreeModelViewer";

/** プレート候補（必要に応じて増やしてOK） */
const PLATES = [
  { id: "circle",  label: "丸皿"  },
  { id: "square",  label: "角皿"  },
];

/** "@/model/..." や "model/..." をブラウザURL "/model/..." に正規化 */
const normalizeBase = (folder) => {
  if (!folder) return null;
  let f = String(folder).replace(/\/+$/g, "");
  if (f.startsWith("@/model")) f = f.replace(/^@\/model/, "/model");
  else if (!f.startsWith("/model")) f = `/model/${f}`;
  return `${f}/`;
};

export default function EditMenuForm({
  restaurantId,    // ✅ 親から渡す（POSTで必須）
  dish,            // 編集対象（新規は null）
  isAdding,        // true:新規 / false:編集
  onSuccess,
  onCancel,
}) {
  const isEdit = !isAdding && !!dish;

  // 入力値（初期値は編集時に dish から）
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 編集時：フォーム初期値を dish から反映
  const [name, setName] = useState(isEdit ? dish.name : "");
  const [price, setPrice] = useState(isEdit ? String(dish.price) : "");
  const [description, setDescription] = useState(isEdit ? (dish.description || "") : "");

  // 画像は「新規アップがあれば差し替え」。無ければそのまま維持
  const [initialImageUrl] = useState(isEdit ? (dish.image_url || "") : "");

  // 編集時：皿の選択（保存先はAPIに plate_id/plate_url を追加する想定。無ければUI選択のみ）
  const [selectedPlate, setSelectedPlate] = useState("circle"); // 既定は"circle"
  const plateFolder = useMemo(() => normalizeBase(`/model/plate/${selectedPlate}`), [selectedPlate]);

  // 編集時：アレルギー初期選択（中間テーブルから取得）
  useEffect(() => {
    if (!isEdit) return;
    let abort = false;
    (async () => {
      try {
        const res = await fetch(`/api/dish_allergies?dishId=${dish.id}`, { cache: "no-store" });
        if (!res.ok) return;
        const rows = await res.json();
        if (!Array.isArray(rows)) return;
        const ids = rows
          .filter(r => r?.dish === dish.id)
          .map(r => r?.allergy)
          .filter(n => Number.isFinite(n));
        if (!abort) setSelectedAllergies([...new Set(ids)]);
      } catch {}
    })();
    return () => { abort = true; };
  }, [isEdit, dish?.id]);

  // アレルギータグのON/OFF
  const toggleAllergy = (id) => {
    setSelectedAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // Kiri のコード→メッセージ（新規時の動画アップ専用）
  const msgFromKiriCode = (code) => {
    if (code === 2000) return "動画を送信しました。現在3Dモデルを生成中です。";
    if (code === 2001) return "この動画からは3Dモデルを生成できませんでした。";
    if (code === 2009) return "動画が要件を満たしていません。別の動画でお試しください。";
    return "動画アップロードに失敗しました。";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrorMsg("");
    setLoading(true);

    try {
      if (!Number.isFinite(Number(restaurantId)) || Number(restaurantId) <= 0) {
        throw new Error("店舗IDが取得できません。画面を再読み込みしてください。");
      }
      if (!name.trim()) throw new Error("料理名は必須です。");
      const priceNum = Number(price);
      if (Number.isNaN(priceNum) || priceNum < 0) {
        throw new Error("価格は0以上の数値で入力してください。");
      }

      const formEl = e.target;
      const formData = new FormData(formEl);

      // 画像アップロード（新規でも編集でも、ファイルがあれば差し替え）
      let newImageUrl = "";
      const imageFile = formData.get("image_url");
      if (imageFile && imageFile.size > 0) {
        const imgForm = new FormData();
        imgForm.append("file", imageFile);
        const imgRes = await fetch("/api/upload/image", { method: "POST", body: imgForm });
        const imgJson = await imgRes.json();
        if (!imgRes.ok) throw new Error(imgJson?.error || "画像アップロードに失敗しました。");
        newImageUrl = imgJson.url; // 例: /image/xxx.png
      }

      if (isEdit) {
        // ---------- 編集：PATCH /api/dishes/:id ----------
        const payload = {
          name: name.trim(),
          price: priceNum,
          description: String(description || ""),
          // 画像は新規アップがあれば差し替え、無ければ送らない（サーバで現状維持）
          ...(newImageUrl ? { image_url: newImageUrl } : {}),
          allergies: selectedAllergies,             // 置換
          // （任意）プレートを保存するなら API 側で受けるフィールドを追加して送信
          // plate_id: selectedPlate,
          // plate_url: `/model/plate/${selectedPlate}`,
        };

        const res = await fetch(`/api/dishes/${dish.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || "料理の更新に失敗しました。");

        onSuccess?.(json.dish ?? null);
        return;
      }

      // ---------- 新規：動画アップロード（Kiri中継） ----------
      let videoTaskId = "";
      const videoFile = formData.get("video_url");
      if (videoFile && videoFile.size > 0) {
        const videoForm = new FormData();
        videoForm.append("video", videoFile);
        const videoRes = await fetch("/api/kiri_upload", { method: "POST", body: videoForm });
        const videoJson = await videoRes.json();
        const taskId = videoJson?.taskId || videoJson?.data?.serialize;
        if (!videoRes.ok || !taskId) {
          const code = videoJson?.code;
          throw new Error(msgFromKiriCode(code));
        }
        videoTaskId = taskId;
      }

      // ---------- 新規：POST /api/dishes ----------
      const payload = {
        name: name.trim(),
        price: priceNum,
        description: String(description || ""),
        image_url: newImageUrl || initialImageUrl || "",
        video_task_id: videoTaskId || undefined,
        allergies: selectedAllergies,     // number[]
        restaurant_id: Number(restaurantId),
      };

      const dishRes = await fetch("/api/dishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const dishJson = await dishRes.json().catch(() => ({}));
      if (!dishRes.ok) throw new Error(dishJson?.message || "料理登録に失敗しました。");

      onSuccess?.(dishJson.dish ?? null);
    } catch (err) {
      setErrorMsg(err.message || "エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-busy={loading}>
      <h2 className={styles.h2}>{isEdit ? "料理を編集" : "料理新規登録"}</h2>

      {/* 画像アップロード（新規も編集も共通） */}
      <ApprovalsImg name="image_url" id="image_url" text="料理の写真" defaultValue={initialImageUrl} />

      {/* ▼ 新規：動画アップロード / 編集：3D＋プレート選択 */}
      {isEdit ? (
        <>
          <div className={styles.plateSection}>
            <label className={styles.cellLabel}>3Dプレビュー</label>
            <div className={styles.plateViewer}>
              {/* プレートモデルの 3D 表示（/model/plate/<id>/...） */}
              {dish?.video_url ? (
              <ThreeModelViewer dishFolder={dish.video_url} plateType={selectedPlate} />
              ) : (
                <p style={{padding:8}}>この料理は3Dモデルが未生成です。</p>
              )}
            </div>
            <div className={styles.plateGrid}>
              {PLATES.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setSelectedPlate(p.id)}
                  className={`${styles.plateBtn} ${selectedPlate === p.id ? styles.plateBtnSelected : ""}`}
                >
                  <span className={styles.plateLabel}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* 新規時のみ：動画アップロード */}
          <ApprovalsVideo name="video_url" id="video_url" text="料理の動画（.mp4のみ対応）" />
          <small>料理を360°撮影した動画をアップロードしてください（.mp4のみ対応）。</small>
        </>
      )}

      {/* 料理名 */}
      <ApprovalsInput
        type="text"
        name="name"
        id="name"
        text="料理名"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* 価格 */}
      <div className={styles.priceWrapper}>
        <ApprovalsInput
          type="number"
          name="price"
          id="price"
          text="価格"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
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
      <ApprovalsTextarea
        name="description"
        id="description"
        text="料理へのコメント"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* エラー表示 */}
      {errorMsg && <p className={styles.error}>{errorMsg}</p>}

      {/* フッター */}
      <div className={styles.footerContent}>
        <p className={styles.p}>{isEdit ? "内容を確認後「保存」を押してください。" : "内容を確認後「登録」ボタンを押してください。"}</p>
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={loading} />
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (isEdit ? "保存中..." : "登録中...") : (isEdit ? "保存" : "登録")}
          </button>
        </div>
      </div>
    </form>
  );
}
