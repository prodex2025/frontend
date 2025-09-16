// src/components/molecules/EditBusinessHoursForm.jsx
"use client";
import React, { useMemo, useState } from "react";
import styles from "@/styles/editModal.module.css";
import BusinessHoursTable from "@/components/molecules/BusinessHoursTable";
import { apiFetch, checkTokenExpired } from "@/hooks/useApiFetch";
import { useRouter } from "next/navigation";

const DAYS = ["月", "火", "水", "木", "金", "土", "日", "祝日"];

export default function EditBusinessHoursForm({
  restaurantId,
  initial = [], // [{ dayOfWeek, isClosed, lunchStart, lunchEnd, isLunchClosed, dinnerStart, dinnerEnd, isDinnerClosed }]
  onClose,
  onSaved,
}) {
  const router = useRouter();

  // 初期 hours モデルへ変換（UIはそのまま・disabled を導出）
  const initialHours = useMemo(() => {
    // サーバが空なら全行空
    if (!Array.isArray(initial) || initial.length === 0) {
      return DAYS.map(() => ({
        closed: false,
        lunch: { start: "", end: "", disabled: true },
        dinner: { start: "", end: "", disabled: true },
      }));
    }

    const byDay = Object.fromEntries(
      initial.map((r) => [r.dayOfWeek ?? r.day_of_week, r])
    );

    return DAYS.map((_, day) => {
      const r = byDay[day];
      if (!r) {
        return {
          closed: false,
          lunch: { start: "", end: "", disabled: true },
          dinner: { start: "", end: "", disabled: true },
        };
      }
      const lunchStart = r.lunchStart ?? r.lunch_start ?? "";
      const lunchEnd = r.lunchEnd ?? r.lunch_end ?? "";
      const dinnerStart = r.dinnerStart ?? r.dinner_start ?? "";
      const dinnerEnd = r.dinnerEnd ?? r.dinner_end ?? "";

      // disabled（＝設定不可）は「start/end が両方そろっていない」時に true
      const lunchDisabled =
        r.isLunchClosed ?? r.is_lunch_closed ?? !(lunchStart && lunchEnd);
      const dinnerDisabled =
        r.isDinnerClosed ?? r.is_dinner_closed ?? !(dinnerStart && dinnerEnd);

      return {
        closed: r.isClosed ?? r.is_closed ?? false,
        lunch: {
          start: lunchStart || "",
          end: lunchEnd || "",
          disabled: !!lunchDisabled,
        },
        dinner: {
          start: dinnerStart || "",
          end: dinnerEnd || "",
          disabled: !!dinnerDisabled,
        },
      };
    });
  }, [initial]);

  const [hours, setHours] = useState(initialHours);
  const [saving, setSaving] = useState(false);

  // 送信
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    // 入力妥当性：設定不可でないのに start/end どちらか欠けている → エラー
    for (let i = 0; i < hours.length; i++) {
      const dayLabel = DAYS[i];

      if (!hours[i].lunch.disabled && !(hours[i].lunch.start && hours[i].lunch.end)) {
        alert(`${dayLabel} のランチは HH:mm で入力してください`);
        return;
      }
      if (!hours[i].dinner.disabled && !(hours[i].dinner.start && hours[i].dinner.end)) {
        alert(`${dayLabel} のディナーは HH:mm で入力してください`);
        return;
      }
    }

    // DTO へ変換
    const payloadList = hours.map((row, day) => {
      // 秒が不要ならそのまま HH:mm で送る / バックエンドが time 型ならサーバ側で 00 秒を付与
      const lunchStart = row.lunch.start || null;
      const lunchEnd = row.lunch.end || null;
      const dinnerStart = row.dinner.start || null;
      const dinnerEnd = row.dinner.end || null;

      // ここがポイント：閉店フラグは “時刻の有無” で強制的に決定
      const isLunchClosed = !!(row.closed || !(lunchStart && lunchEnd));
      const isDinnerClosed = !!(row.closed || !(dinnerStart && dinnerEnd));

      return {
        dayOfWeek: day,
        isClosed: !!row.closed,
        lunchStart,
        lunchEnd,
        isLunchClosed,
        dinnerStart,
        dinnerEnd,
        isDinnerClosed,
      };
    });

    try {
      setSaving(true);
      // バックエンドの受け取りに合わせて、下のどちらかで送ってください
      // ① 配列そのまま
      // const res = await apiFetch(
      //   `/api/owner/restaurants/${restaurantId}/profile/schedule`,
      //   { method: "PUT", body: JSON.stringify(payloadList) }
      // );

      // ② オブジェクトでラップ（よくあるパターン）
      const res = await apiFetch(
        `/api/owner/restaurants/${restaurantId}/profile/schedule`,
        { method: "PUT", body: JSON.stringify({ storeScheduleDtoList: payloadList }) }
      );

      if (checkTokenExpired(res, router)) return;
      if (!res.response.ok) {
        const t = await res.response.text().catch(() => "");
        throw new Error(`営業時間の更新に失敗しました：${res.response.status} ${t}`);
      }
      alert("営業時間・定休日を更新しました。");
      onSaved && (await onSaved());
      onClose && onClose();
    } catch (err) {
      console.error(err);
      alert(err.message ?? "更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h2 className={styles.h2}>営業時間・定休日編集</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.hoursContent}>
          <div className={styles.table}>
            {/* ★UIはそのまま：内部ロジックのみ修正済み */}
            <BusinessHoursTable hours={hours} setHours={setHours} />
          </div>
        </div>

        <div className={styles.footerContent}>
          <p className={styles.p}>変更内容を確認後「登録」ボタンを押してください。</p>
          <button type="submit" className={styles.submitBtn} disabled={saving}>
            {saving ? "登録中…" : "登録"}
          </button>
        </div>
      </form>
    </>
  );
}
