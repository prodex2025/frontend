'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/editModal.module.css";

import ApprovalsInput from "@/components/atoms/ApprovalsInput";
import ApprovalsImg from "@/components/atoms/ApprovalsImg";
import CategoryList from "@/components/molecules/CategoryList";
import { apiFetch, checkTokenExpired } from "@/hooks/useApiFetch";
import { useUpload } from "@/hooks/useUpload";

export default function EditStoreForm({ onClose, onSaved, restaurant }) {
  const router = useRouter();
  const { getPresignedPut, putToS3 } = useUpload();
  if (!restaurant) return <div>店舗が見つかりませんでした。</div>;

  // カテゴリ一覧（{id,name}）
  const [allCategories, setAllCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState(null);

  useEffect(() => {
    (async () => {
      setCatLoading(true);
      setCatError(null);
      try {
        const res = await apiFetch("/api/categories", { method: "GET" });
        if (checkTokenExpired(res, router)) return;
        if (!res.response.ok) throw new Error(await res.response.text());
        const data = await res.response.json();
        const list = Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : []);
        setAllCategories(list.map((c) => ({ id: c.id, name: c.name })));
      } catch (e) {
        console.error(e);
        setCatError(e.message ?? "カテゴリ取得に失敗しました");
      } finally {
        setCatLoading(false);
      }
    })();
  }, [router]);

  // ★ 選択カテゴリは ID 配列で管理
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

  // options 取得後に「レストランのカテゴリ名 → ID」に変換して初期選択をセット
  useEffect(() => {
    if (!allCategories.length) return;
    const names = (restaurant.categories ?? [])
      .map((c) => (typeof c === "string" ? c : c?.name))
      .filter(Boolean);
    const ids = allCategories
      .filter((cat) => names.includes(cat.name))
      .map((cat) => cat.id);
    setSelectedCategoryIds(ids);
  }, [allCategories, restaurant]);

  // 画像や基本項目
  const [formData, setFormData] = useState({
    name: restaurant.name ?? "",
    address: restaurant.address ?? "",
    postCode: restaurant.postCode ?? "0000000",
    imageKey: restaurant.imageKey ?? "",
    image_url: restaurant.imageUrl ?? "/default-shop.png",
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleImageChange = async (next) => {
    if (typeof next === "string") {
      setFormData((p) => ({ ...p, image_url: next }));
      return;
    }
    const file = next?.target?.files?.[0] ?? (next instanceof File ? next : null);
    if (!file) return;
    try {
      setUploading(true);
      const presign = await getPresignedPut(file.name, "restaurant-image");
      if (!presign) return;
      const ok = await putToS3(presign.url, file, presign.contentType || file.type);
      if (!ok) return alert("アップロードに失敗しました");
      setFormData((p) => ({
        ...p,
        imageKey: presign.key,
        image_url: URL.createObjectURL(file),
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || uploading) return;

    // ★ ID → {id,name} に戻して payload を作成
    const categoryDtoList = selectedCategoryIds
      .map((id) => {
        const found = allCategories.find((c) => c.id === id);
        return found ? { id: found.id, name: found.name } : null;
      })
      .filter(Boolean);

    const payload = {
      restaurantName: formData.name,
      restaurantAddress: formData.address,
      restaurantPostCode: formData.postCode || "0000000",
      exteriorTmpKey: formData.imageKey || "",
      categoryDtoList,
    };

    try {
      setSubmitting(true);
      const res = await apiFetch(`/api/owner/restaurants/${restaurant.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      if (checkTokenExpired(res, router)) return;
      if (!res.response.ok) {
        const t = await res.response.text().catch(() => "");
        throw new Error(`更新に失敗しました：${res.response.status} ${t}`);
      }
      alert("編集が完了しました。");
      onSaved && onSaved();
      onClose && onClose();
    } catch (err) {
      console.error(err);
      alert(err.message ?? "更新に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h2 className={styles.h2}>店舗情報編集</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.content}>
          <div className={styles.leftContent}>
            <ApprovalsInput
              type="text" name="name" id="name" text="店舗名"
              value={formData.name} onChange={handleChange}
            />

            <ApprovalsImg
              name="outsideImg" id="outsideImg" text="店外の写真"
              value={formData.image_url}
              onChange={handleImageChange}
              disabled={uploading}
              helperText={uploading ? "アップロード中..." : undefined}
            />

            <ApprovalsInput
              type="text" name="address" id="address" text="住所"
              value={formData.address} onChange={handleChange}
            />
          </div>

          <div className={styles.rightContent}>
            <h3 className={styles.h3}>カテゴリー一覧</h3>

            {catLoading ? (
              <p className={styles.p}>読み込み中...</p>
            ) : catError ? (
              <p className={styles.error}>カテゴリの取得に失敗しました</p>
            ) : (
              <CategoryList
                options={allCategories}              // [{id,name}]
                selectedIds={selectedCategoryIds}    // ★ ID 配列
                onChange={setSelectedCategoryIds}    // ★ そのまま更新
              />
            )}
          </div>
        </div>

        <div className={styles.footerContent}>
          <p className={styles.p}>変更内容を確認後「登録」ボタンを押してください。</p>
          <button type="submit" className={styles.submitBtn} disabled={submitting || uploading}>
            {submitting ? "送信中..." : "登録"}
          </button>
        </div>
      </form>
    </>
  );
}
