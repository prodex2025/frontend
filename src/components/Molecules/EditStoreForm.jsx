'use client';
import React, { useState } from "react";
import styles from "@/styles/editModal.module.css";

import { useParams } from 'next/navigation';
import { restaurants, reataurants_categories } from '@/data/mockData';

import ApprovalsInput from "@/components/atoms/ApprovalsInput";
import ApprovalsImg from "@/components/atoms/ApprovalsImg";
import CategoryList from "@/components/molecules/CategoryList";

export default function EditStoreForm({ onClose }) {
  const params = useParams();
  const restaurantId = parseInt(params.id, 10);
  const restaurant = restaurants.find(r => r.id === restaurantId);

  if (!restaurant) {
    return <div>店舗が見つかりませんでした。</div>;
  }

  // 店舗に紐づくカテゴリ ID の初期値を取得
  const relatedCategoryIds = reataurants_categories
    .filter(rc => rc.restaurant_id === restaurantId)
    .map(rc => rc.category_id);

  // 編集フォームの状態管理（モックデータコピー）
  const [formData, setFormData] = useState({
    name: restaurant.name,
    address: restaurant.address,
    categories: relatedCategoryIds || [],
    image_url: restaurant.image_url || null,
  });

  // 入力変更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 画像変更
  const handleImageChange = (newImageUrl) => {
    setFormData(prev => ({ ...prev, image_url: newImageUrl }));
  };

  // 保存（フロントエンドのみ）
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("保存データ:", formData);
    alert("編集が完了しました。");
    if (onClose) onClose(); // 登録後にモーダルを閉じる
  };

  return (
    <>
      <h2 className={styles.h2}>店舗情報編集</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.content}>
          <div className={styles.leftContent}>
            {/* 店舗名 */}
            <ApprovalsInput
              type="text"
              name="name"
              id="name"
              text="店舗名"
              value={formData.name}
              onChange={handleChange}
            />

            {/* 店舗の外の写真 */}
            <ApprovalsImg
              name="outsideImg"
              id="outsideImg"
              text="店外の写真"
              value={formData.image_url}
              onChange={handleImageChange} // ここで更新
            />

            {/* 住所 */}
            <ApprovalsInput
              type="text"
              name="address"
              id="address"
              text="住所"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className={styles.rightContent}>
            <h3 className={styles.h3}>カテゴリー一覧</h3>
            <CategoryList
              selectedCategories={formData.categories}
              setSelectedCategories={(newCats) =>
                setFormData(prev => ({ ...prev, categories: newCats }))
              }
            />
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
