"use client";

import React from "react";
import styles from "@/styles/StoreMenuTab.module.css";
import Link from "next/link";
import Pagination from "@/components/atoms/Pagination.jsx";

export default function StoreMenuTab({
  items = [],
  loading = false,
  error = null,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) {
  if (loading) return <div className={styles.empty}>読み込み中...</div>;
  if (error)
    return <div className={styles.empty}>取得に失敗しました：{error}</div>;
  if (!items.length)
    return <div className={styles.empty}>メニュー情報がありません。</div>;

  return (
    <div className={styles.menuContainer}>
      <div className={styles.menuGrid}>
        {items.map((dish) => {
          const rid =
            dish.restaurantId ?? dish.restaurant_id ?? dish.restaurant ?? "";
          const img = (
            dish.imageUrl ||
            dish.image_url ||
            "/default-dish.png"
          ).replace("@", "");
          const price =
            typeof dish.price === "number"
              ? dish.price
              : Number(dish.price ?? 0);

          return (
            <div key={dish.id} className={styles.menuCard}>
              <Link
                href={{
                  pathname: rid
                    ? `/owner/dashboard/${rid}/menu/${dish.id}`
                    : `/owner/dashboard/menu/${dish.id}`,
                  query: rid
                    ? { from: `/store/list/details/${rid}` }
                    : undefined,
                }}
              >
                <img src={img} alt={dish.name} className={styles.menuImage} />
                <div className={styles.menuInfo}>
                  <div className={styles.dishName}>{dish.name}</div>
                  <div className={styles.price}>
                    ￥{price.toLocaleString()}
                    <span className={styles.tax}>（税込み）</span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
