'use client';

import React, { useEffect, useState } from 'react';
import styles from '@/styles/EditMenuTab.module.css';

// コンポーネント
import EditStoreModal from '@/components/Molecules/EditStoreModal';
import EditMenuRegistartionForm from '@/components/Molecules/EditMenuRegistrationForm';

export default function EditMenuTab({ restaurant }) {
  if (!restaurant) return null;

  // dishesの状態管理
  const [restaurantDishes, setRestaurantDishes] = useState([]);

  // モーダル管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // 初回読み込み & 更新時にメニュー取得
  const fetchDishes = async () => {
    const res = await fetch("/api/dishes");
    const data = await res.json();
    setRestaurantDishes(data.filter(d => d.restaurant_id === restaurant.id));
  };

  useEffect(() => {
    fetchDishes();
  }, [restaurant.id]);

  // 編集アイコン
  const handleEdit = (dish) => {
    setEditingDish(dish);
    setIsAdding(false);
    setIsModalOpen(true);
  };

  // 追加カード
  const handleAdd = () => {
    setEditingDish(null);
    setIsAdding(true);
    setIsModalOpen(true);
  };

  // 登録完了後に再取得
  const handleRegisterComplete = async () => {
    await fetchDishes();
    setIsModalOpen(false);
  };

  return (
    <div className={styles.menuContainer}>
      {restaurantDishes.length === 0 ? (
        <div className={styles.empty}>メニュー情報がありません。</div>
      ) : (
        <div className={styles.menuGrid}>
          {/* メニュー追加カード */}
          <div
            className={`${styles.menuCard} ${styles.addMenuCard}`}
            onClick={handleAdd}
          >
            <div className={styles.addMenuContent}>
              <p className={styles.addText}>メニューを追加</p>
              <span className={`${styles.addIcon} material-symbols-outlined`}>
                add_circle
              </span>
            </div>
          </div>

          {restaurantDishes.map((dish) => (
            <div key={dish.id} className={styles.menuCard}>
              {/* 左:削除, 右:編集 */}
              <div className={styles.menuCardHeader}>
                <span
                  className={`${styles.icon} material-symbols-outlined`}
                  onClick={() => console.log('削除:', dish.id)}
                >
                  delete
                </span>
                <span
                  className={`${styles.icon} material-symbols-outlined`}
                  onClick={() => handleEdit(dish)}
                >
                  edit
                </span>
              </div>

              <img
                src={dish.image_url.replace('@', '')}
                alt={dish.name}
                className={styles.menuImage}
              />
              <div className={styles.menuInfo}>
                <div className={styles.dishName}>{dish.name}</div>
                <div className={styles.price}>
                  ￥{dish.price.toLocaleString()}
                  <span className={styles.tax}>（税込み）</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* モーダル */}
      <EditStoreModal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <EditMenuRegistartionForm
          dish={editingDish}
          isAdding={isAdding}
          onSuccess={async()=>{
            await fetchDishes();
            setIsModalOpen(false);
          }}
          onCancel = {() => setIsModalOpen(false)}
        />
      </EditStoreModal>
    </div>
  );
}