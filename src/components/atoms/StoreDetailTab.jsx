import React, { useEffect, useState } from 'react';
import styles from '@/styles/StoreDetailTab.module.css';
import dynamic from 'next/dynamic';
import { restaurants_business_hours } from '@/data/mockData'; 


// dynamic importでSSRオフにする
const MapWithGeocode = dynamic(() => import('@/components/atoms/MapWithGeocode'), {
  ssr: false,
});

// 曜日の配列（インデックスでアクセスする用）
const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日'];

// 分（minutes）を「HH:MM」の文字列に変換
function minutesToTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}


// 電話番号をハイフン付きで整形（例: 080-1234-5678）
function formatPhoneNumber(number) {
  if (!number) return '';
  const clean = number.replace(/[^\d]/g, '');

  if (clean.length === 11) {
    return `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7)}`;
  } else if (clean.length === 10) {
    return `${clean.slice(0, 2)}-${clean.slice(2, 6)}-${clean.slice(6)}`;
  } else {
    return number; // 整形できない場合はそのまま
  }
}

// メインコンポーネント
export default function StoreDetailTab({ restaurant }) {
    
  if (!restaurant) return null;

  // 対象店舗の営業時間だけ抽出
  const businessHours = restaurants_business_hours.filter(
    (b) => b.restaurant_id === restaurant.id
  );

  // 営業日(曜日番号)リスト
  const openDays = businessHours.map((b) => b.day_of_week);
  // 定休日 = 曜日番号リストからopenDaysに含まれないもの
  const closedDays = WEEKDAYS.filter((_, i) => !openDays.includes(i));
  // 曜日番号をキーに営業時間オブジェクトをマップ化
  const weekdayMap = Object.fromEntries(
    businessHours.map((b) => [b.day_of_week, b])
  );

  return (
    <div className={styles.container}>
        {/* 左：画像エリア */}
        <div className={styles.imageWrapper}>
            <img
            src={restaurant.image_detail_url}
            alt={`${restaurant.name} の画像`}
            className={styles.detailImage}
            />

            {/* ここに地図を表示 */}
            <MapWithGeocode address={restaurant.address} />
            

        </div>

        {/* 右：店舗情報エリア */}
        <div className={styles.contentWrapper}>
            <div className={styles.infoBlock}>
                {/* 営業時間 */}
                <div className={styles.row}>
                    <span className={styles.label}>営業時間</span>
                    <span className={styles.colon}>：</span>
                    <span className={styles.value}>
                        {Object.entries(weekdayMap).map(([day, { open_time, close_time }], index) => (
                        <React.Fragment key={day}>
                            {index > 0 && <br />}
                            （{WEEKDAYS[Number(day)]}）{minutesToTime(open_time)}〜{minutesToTime(close_time)}
                        </React.Fragment>
                        ))}
                    </span>
                </div>

                {/* 定休日 */}
                <div className={styles.row}>
                    <span className={styles.label}>定休日</span>
                    <span className={styles.colon}>：</span>
                    <span className={styles.value}>
                    {closedDays.length > 0
                        ? closedDays.join('曜日、') + '曜日'
                        : 'なし'}
                    </span>
                </div>
                
                {/* アクセス */}
                <div className={styles.row}>
                    <span className={styles.label}>アクセス</span>
                    <span className={styles.colon}>：</span>
                    <span className={styles.value}>{restaurant.address}</span>
                </div>
                
                {/* 電話番号（整形済） */}
                <div className={styles.row}>
                    <span className={styles.label}>TEL</span>
                    <span className={styles.colon}>：</span>
                    <span className={styles.value}>{formatPhoneNumber(restaurant.phone)}</span>
                </div>

                {/* Email（そのまま表示） */}
                <div className={styles.row}>
                <span className={styles.label}>Email</span>
                <span className={styles.colon}>：</span>
                <span className={styles.value}>{restaurant.email}</span>
                </div>

            </div>
      </div>      
    </div>
);
}
