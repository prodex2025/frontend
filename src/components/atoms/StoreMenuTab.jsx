import React from 'react';
import styles from '@/styles/StoreMenuTab.module.css';
import { dishes } from '@/data/mockData'; // モックデータから料理を取得

export default function StoreMenuTab({ restaurant }) {
  if (!restaurant) return null;

  // 対象店舗のメニューのみ抽出
  const restaurantDishes = dishes.filter((dish) => dish.restaurant_id === restaurant.id);

  return (
    <div className={styles.menuContainer}>
      {restaurantDishes.length === 0 ? (
        <div className={styles.empty}>メニュー情報がありません。</div>
      ) : (
        <div className={styles.menuGrid}>
          {restaurantDishes.map((dish) => (
            <div key={dish.id} className={styles.menuCard}>
              <img src={dish.image_url.replace('@', '')} alt={dish.name} className={styles.menuImage} />
              <div className={styles.menuInfo}>
                <div className={styles.dishName}>{dish.name}</div>
                <div className={styles.price}>￥{dish.price.toLocaleString()}<span className={styles.tax}>（税込み）</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
