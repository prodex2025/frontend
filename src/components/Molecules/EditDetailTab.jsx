"use client";
import React, { useMemo, useRef, useState } from "react";
import styles from "@/styles/EditPage.module.css";

import EditButton from "@/components/atoms/EditButton";
import EditStoreModal from "@/components/molecules/EditStoreModal";
import EditBusinessHoursForm from "@/components/molecules/EditBusinessHoursForm";

import { apiFetch, checkTokenExpired } from "@/hooks/useApiFetch";
import { useRouter } from "next/navigation";
import { useUpload } from "@/hooks/useUpload";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土", "祝日"];

function formatPhoneNumber(number) {
  if (!number) return "";
  const clean = String(number).replace(/[^\d]/g, "");
  if (clean.length === 11) return `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7)}`;
  if (clean.length === 10) return `${clean.slice(0, 2)}-${clean.slice(2, 6)}-${clean.slice(6)}`;
  return number;
}

export default function EditDetailTab({ restaurant, onSaved }) {
  const router = useRouter();
  const { getPresignedPut, putToS3 } = useUpload();
  if (!restaurant) return null;

  // 時刻を HH:mm に整形（"05:30:00" -> "05:30"）
  const fmt = (t) => {
    if (!t) return "";
    const s = String(t);
    const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (!m) return s;
    const hh = String(Number(m[1])).padStart(2, "0");
    const mm = m[2];
    return `${hh}:${mm}`;
  };
  // camel/snake どちらでも拾える
  const get = (obj, a, b) => obj?.[a] ?? obj?.[b];

  // —— 店舗基本情報フォーム —— //
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    address: restaurant.address ?? "",
    phone: restaurant.phone ?? "",
    email: restaurant.email ?? "",
  });

  const [interiorPreview, setInteriorPreview] = useState(
    restaurant.interiorImageUrl || ""
  );
  const [interiorTmpKey, setInteriorTmpKey] = useState("");
  const [uploading, setUploading] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);

  const businessHours = useMemo(() => restaurant.storeSchedules ?? [], [restaurant]);
  const weekdayMap = useMemo(
    () => Object.fromEntries((businessHours || []).map((b) => [b.dayOfWeek ?? b.day_of_week, b])),
    [businessHours]
  );

  const fileInputRef = useRef(null);
  const openFileDialog = () => fileInputRef.current?.click();

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const presign = await getPresignedPut(file.name, "restaurant-image", file.type);
      if (!presign) return;
      const ok = await putToS3(presign.url, file, presign.contentType || file.type);
      if (!ok) return alert("アップロードに失敗しました");
      setInteriorTmpKey(presign.key);
      setInteriorPreview(URL.createObjectURL(file));
    } finally {
      setUploading(false);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const [saving, setSaving] = useState(false);
  const handleSubmitBasic = async (e) => {
    e.preventDefault();
    if (saving || uploading) return;

    const payload = {
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      interiorTmpKey: interiorTmpKey || undefined,
    };

    try {
      setSaving(true);
      const res = await apiFetch(`/api/owner/restaurants/${restaurant.id}/profile`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      if (checkTokenExpired(res, router)) return;
      if (!res.response.ok) {
        const t = await res.response.text().catch(() => "");
        throw new Error(`基本情報の更新に失敗しました：${res.response.status} ${t}`);
      }
      alert("店舗の基本情報を更新しました。");
      onSaved && (await onSaved());
      setEditingField(null);
      setInteriorTmpKey("");
    } catch (err) {
      console.error(err);
      alert(err.message ?? "更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmitBasic}>
        <div className={styles.container}>
          {/* 左：画像（店内の写真） */}
          <div className={styles.imageWrapper}>
            <h2 className={styles.h2}>店内の写真</h2>
            <div className={styles.imgContent}>
              <img
                src={interiorPreview || "/default-shop.png"}
                alt={`${restaurant.name} の画像`}
                className={styles.detailImage}
              />
              <EditButton onClick={openFileDialog} icon="edit_square" className={styles.editBtn} />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </div>
          </div>

          {/* 右：店舗情報テーブル */}
          <div className={styles.contentWrapper}>
            <h2 className={styles.h2}>店舗詳細情報</h2>
            <table className={styles.infoTable}>
              <tbody>
                {/* 営業時間（秒を消す／空の方は非表示／両方空ならその曜日自体を非表示） */}
                <tr>
                  <th>営業時間</th>
                  <td>
                    {Object.entries(weekdayMap)
                      .filter(([_, info]) => !get(info, "isClosed", "is_closed"))
                      .map(([day, info], idx) => {
                        const lunchClosed  = !!get(info, "isLunchClosed",  "is_lunch_closed");
                        const dinnerClosed = !!get(info, "isDinnerClosed", "is_dinner_closed");

                        const lunchStart  = get(info, "lunchStart",  "lunch_start");
                        const lunchEnd    = get(info, "lunchEnd",    "lunch_end");
                        const dinnerStart = get(info, "dinnerStart", "dinner_start");
                        const dinnerEnd   = get(info, "dinnerEnd",   "dinner_end");

                        const parts = [];
                        if (!lunchClosed && lunchStart && lunchEnd) {
                          parts.push(`ランチ ${fmt(lunchStart)}〜${fmt(lunchEnd)}`);
                        }
                        if (!dinnerClosed && dinnerStart && dinnerEnd) {
                          parts.push(`ディナー ${fmt(dinnerStart)}〜${fmt(dinnerEnd)}`);
                        }
                        if (parts.length === 0) return null;

                        return (
                          <React.Fragment key={day}>
                            {idx > 0 && <br />}
                            （{WEEKDAYS[Number(day)]}） {parts.join("  ")}
                          </React.Fragment>
                        );
                      })}
                  </td>
                  <td>
                    <EditButton onClick={() => setEditModalOpen(true)} icon="edit" />
                  </td>
                </tr>

                {/* 定休日 */}
                <tr>
                  <th>定休日</th>
                  <td>
                    {businessHours?.some((b) => get(b, "isClosed", "is_closed"))
                      ? businessHours
                          .filter((b) => get(b, "isClosed", "is_closed"))
                          .map((b) => {
                            const d = b.dayOfWeek ?? b.day_of_week;
                            return WEEKDAYS[d] === "祝日" ? "祝日" : `${WEEKDAYS[d]}曜日`;
                          })
                          .join("、")
                      : "なし"}
                  </td>
                  <td />
                </tr>

                {/* アクセス（住所） */}
                <tr className={editingField === "address" ? styles.editingRow : ""}>
                  <th>アクセス</th>
                  <td>
                    {editingField === "address" ? (
                      <input type="text" name="address" value={formData.address} onChange={onChange} />
                    ) : (
                      formData.address
                    )}
                  </td>
                  <td>
                    <EditButton onClick={() => setEditingField("address")} icon="edit" />
                  </td>
                </tr>

                {/* TEL */}
                <tr className={editingField === "phone" ? styles.editingRow : ""}>
                  <th>TEL</th>
                  <td>
                    {editingField === "phone" ? (
                      <input type="text" name="phone" value={formData.phone} onChange={onChange} />
                    ) : (
                      formatPhoneNumber(formData.phone)
                    )}
                  </td>
                  <td>
                    <EditButton onClick={() => setEditingField("phone")} icon="edit" />
                  </td>
                </tr>

                {/* Email */}
                <tr className={editingField === "email" ? styles.editingRow : ""}>
                  <th>Email</th>
                  <td>
                    {editingField === "email" ? (
                      <input type="text" name="email" value={formData.email} onChange={onChange} />
                    ) : (
                      formData.email
                    )}
                  </td>
                  <td>
                    <EditButton onClick={() => setEditingField("email")} icon="edit" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* フッター */}
        <div className={styles.footerContent}>
          <p className={styles.p}>変更内容を確認後「登録」ボタンを押してください。</p>
          <button type="submit" className={styles.submitBtn} disabled={saving || uploading}>
            {saving ? "登録中…" : "登録"}
          </button>
        </div>
      </form>

      {/* 営業時間の編集モーダル（保存先は /profile/schedule） */}
      <EditStoreModal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <EditBusinessHoursForm
          restaurantId={restaurant.id}
          initial={restaurant.storeSchedules ?? []}
          onClose={() => setEditModalOpen(false)}
          onSaved={onSaved}
        />
      </EditStoreModal>
    </>
  );
}
