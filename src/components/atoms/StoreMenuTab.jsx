'use client';

import React, { useEffect, useState } from 'react';
import styles from '@/styles/StoreMenuTab.module.css';
import Link from 'next/link';

export default function StoreMenuTab({ restaurant }) {
  if (!restaurant) return null;

  // dishesの状態管理
    const [restaurantDishes, setRestaurantDishes] = useState([]);

  // 初回読み込み & 更新時にメニュー取得
  const fetchDishes = async () => {
    const res = await fetch(`/api/dishes?restaurantId=${restaurant.id}`,{cache: 'no-store'});
    const data = await res.json();
    setRestaurantDishes(data.filter(d => d.restaurant_id === restaurant.id));
  };

  useEffect(() => {
    fetchDishes();
  }, [restaurant.id]);

  return (
    <div className={styles.menuContainer}>
      {restaurantDishes.length === 0 ? (
        <div className={styles.empty}>メニュー情報がありません。</div>
      ) : (
        <div className={styles.menuGrid}>
          {restaurantDishes.map((dish) => (
            <div key={dish.id} className={styles.menuCard}>
              <Link href={`/owner/dashboard/${dish.restaurant_id}/menu/${dish.id}`}>
                <img src={dish.image_url.replace('@', '')} alt={dish.name} className={styles.menuImage} />
                <div className={styles.menuInfo}>
                  <div className={styles.dishName}>{dish.name}</div>
                  <div className={styles.price}>￥{dish.price.toLocaleString()}<span className={styles.tax}>（税込み）</span></div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
