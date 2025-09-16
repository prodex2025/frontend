import React from "react";
import styles from "@/styles/StoreDetailTab.module.css";
import dynamic from "next/dynamic";

const MapWithGeocode = dynamic(
  () => import("@/components/atoms/MapWithGeocode"),
  { ssr: false }
);

const WEEKDAYS = ["月", "火", "水", "木", "金", "土", "日", "祝日"];

// number(分) → "HH:MM"
function minutesToTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

// "HH:mm:ss"や"HH:mm"やnumberに全部対応
function fmtTime(t) {
  if (t == null || t === "") return "";
  if (typeof t === "number") return minutesToTime(t);
  // 文字列は先頭5文字（HH:mm）だけ出す
  return String(t).slice(0, 5);
}

function formatPhoneNumber(number) {
  if (!number) return "";
  const clean = number.replace(/[^\d]/g, "");
  if (clean.length === 11)
    return `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7)}`;
  if (clean.length === 10)
    return `${clean.slice(0, 2)}-${clean.slice(2, 6)}-${clean.slice(6)}`;
  return number;
}

export default function StoreDetailTab({ restaurant }) {
  if (!restaurant) return null;

  // ← どちらのキーでも拾えるように
  const businessHours =
    restaurant.storeScheduleDtoList ?? restaurant.storeSchedules ?? [];

  // dayOfWeek をキー化（0..7）
  const weekdayMap = Object.fromEntries(
    (businessHours || []).map((b) => [b.dayOfWeek, b])
  );

  const closedLabel =
    (businessHours || [])
      .filter((b) => b.isClosed)
      .map((b) =>
        WEEKDAYS[b.dayOfWeek] === "祝日"
          ? "祝日"
          : `${WEEKDAYS[b.dayOfWeek]}曜日`
      )
      .join("、") || "なし";

  return (
    <div className={styles.container}>
      {/* 左：画像＆地図 */}
      <div className={styles.imageWrapper}>
        <img
          src={restaurant.interiorImageUrl || "/default-shop.png"}
          alt={`${restaurant.name} の画像`}
          className={styles.detailImage}
        />
        <MapWithGeocode address={restaurant.address} />
      </div>

      {/* 右：情報 */}
      <div className={styles.contentWrapper}>
        <div className={styles.infoBlock}>
          {/* 営業時間 */}
          <div className={styles.row}>
            <span className={styles.label}>営業時間</span>
            <span className={styles.colon}>：</span>
            <span className={styles.value}>
              {Object.entries(weekdayMap)
                .sort((a, b) => Number(a[0]) - Number(b[0]))
                .map(([day, info], i) => (
                  <React.Fragment key={day}>
                    {i > 0 && <br />}（{WEEKDAYS[Number(day)]}）
                    {info.isClosed ? (
                      "定休日"
                    ) : (
                      <>
                        {!info.isLunchClosed &&
                          info.lunchStart &&
                          info.lunchEnd && (
                            <>
                              ランチ {fmtTime(info.lunchStart)}〜
                              {fmtTime(info.lunchEnd)}
                            </>
                          )}
                        {!info.isDinnerClosed &&
                          info.dinnerStart &&
                          info.dinnerEnd && (
                            <>
                              ディナー {fmtTime(info.dinnerStart)}〜
                              {fmtTime(info.dinnerEnd)}
                            </>
                          )}
                      </>
                    )}
                  </React.Fragment>
                ))}
            </span>
          </div>

          {/* 定休日 */}
          <div className={styles.row}>
            <span className={styles.label}>定休日</span>
            <span className={styles.colon}>：</span>
            <span className={styles.value}>{closedLabel}</span>
          </div>

          {/* アクセス */}
          <div className={styles.row}>
            <span className={styles.label}>アクセス</span>
            <span className={styles.colon}>：</span>
            <span className={styles.value}>{restaurant.address}</span>
          </div>

          {/* TEL */}
          <div className={styles.row}>
            <span className={styles.label}>TEL</span>
            <span className={styles.colon}>：</span>
            <span className={styles.value}>
              {formatPhoneNumber(restaurant.phone)}
            </span>
          </div>

          {/* Email */}
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
