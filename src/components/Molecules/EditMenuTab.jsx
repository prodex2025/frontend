'use client';

import React, { useEffect, useState } from 'react';
import styles from '@/styles/EditMenuTab.module.css';

// コンポーネント
import EditStoreModal from '@/components/molecules/EditStoreModal';
import EditMenuRegistartionForm from '@/components/molecules/EditMenuRegistrationForm';

export default function EditMenuTab({ restaurant }) {
  if (!restaurant) return null;

  // dishesの状態管理
  const [restaurantDishes, setRestaurantDishes] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  // モーダル管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // 初回読み込み & 更新時にメニュー取得
  const fetchDishes = async () => {
    const res = await fetch(`/api/dishes?restaurantId=${restaurant.id}`,{cache: 'no-store'});
    // 返り値は配列で受けとる
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

  // 削除アイコン（/api/dishes?id=:id を DELETE）
  const handleDelete = async (dish) => {
    if (deletingId !== null) return; // 連打防止
    if (!confirm(`「${dish.name}」を削除しますか？`)) return;

    setDeletingId(dish.id);

    // 楽観的更新：先にUIから消す（失敗時はロールバック）
    const prev = restaurantDishes;
    setRestaurantDishes((list) => list.filter((d) => d.id !== dish.id));

    try {
      const res = await fetch(`/api/dishes?id=${dish.id}`, { method: 'DELETE' });

      if (!res.ok) {
        // ロールバック
        setRestaurantDishes(prev);
        const data = await res.json().catch(() => ({}));
        alert(data.message ?? '削除に失敗しました。');
        return;
      }

      // モック運用なら再取得は省略可。常に正確にしたいなら↓を有効化
      // await fetchDishes();
    } catch (e) {
      setRestaurantDishes(prev); // ロールバック
      alert('通信エラーが発生しました。');
      console.error(e);
    } finally {
      setDeletingId(null);
    }
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
                  onClick={() => handleDelete(dish)}
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