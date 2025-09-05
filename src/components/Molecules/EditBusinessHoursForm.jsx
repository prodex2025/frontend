'use client';
import React, { useState } from "react";
import styles from "@/styles/editModal.module.css";

import { useParams } from 'next/navigation';
import { restaurants, restaurants_business_calendar } from '@/data/mockData';

import BusinessHoursTable from "@/components/molecules/BusinessHoursTable";

export default function EditBusinessHoursForm({ onClose }) {
  const params = useParams();
  const restaurantId = parseInt(params.id, 10);
  const restaurant = restaurants.find(r => r.id === restaurantId);

  if (!restaurant) {
    return <div>店舗が見つかりませんでした。</div>;
  }

  const days = ['月', '火', '水', '木', '金', '土', '日', '祝日'];

  // 既存営業時間を hoursData 用に変換
  const existingHoursRaw = restaurants_business_calendar.filter(
    (b) => b.restaurant_id === restaurantId
  );

  const existingHours = days.map((_, index) => {
    const record = existingHoursRaw.find((b) => b.day_of_week === index);
    if (!record) {
      return {
        closed: false,
        lunch: { start: '', end: '', available: false },
        dinner: { start: '', end: '', available: false },
      };
    }
    return {
      closed: record.is_closed,
      lunch: {
        start: record.lunch_start,
        end: record.lunch_end,
        available: !record.is_lunch_closed,
      },
      dinner: {
        start: record.dinner_start,
        end: record.dinner_end,
        available: !record.is_dinner_closed,
      },
    };
  });

  const [hours, setHours] = useState(existingHours);

  // 保存（フロントエンドのみ）
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("営業時間データ:", hours);
    alert("編集が完了しました。");
    if (onClose) onClose(); // 登録後にモーダルを閉じる
  };

  return (
    <>
      <h2 className={styles.h2}>営業時間・定休日編集</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.hoursContent}>
          <div className={styles.table}>
            <BusinessHoursTable hours={hours} setHours={setHours}/>
          </div>
        </div>

        <div className={styles.footerContent}>
          <p className={styles.p}>
            変更内容を確認後「登録」ボタンを押してください。
          </p>
          <button type="submit" className={styles.submitBtn}>
            登録
          </button>
        </div>
      </form>
    </>
  );
}