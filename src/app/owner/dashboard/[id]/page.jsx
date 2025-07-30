//経営者画面の店舗詳細画面
'use client';

import styles from '@/styles/StoreDetailPage.module.css';


import { useState } from 'react';     //タブ切り替え、状態保存用
import { useParams, useSearchParams, useRouter  } from 'next/navigation';  //URLパラメータを取得するためのフック
import { restaurants, reataurants_categories, categories } from '@/data/mockData'; //データインポート

import ShopInfo from '@/components/atoms/ShopInfo';        // 店舗情報を表示するためのコンポーネント
import CategoryTag from '@/components/atoms/CategoryTag'; // カテゴリータグコンポーネント
import StoreDetailTab from '@/components/atoms/StoreDetailTab';     //詳細タブ用コンポーネント
import StoreMenuTab from '@/components/atoms/StoreMenuTab'; // メニュータブ用コンポーネント

export default function StoreDetailPage() {

  //タブ切り替え用
  const [activeTab, setActiveTab] = useState('detail');

  // URLのパラメータ（/store/list/details/3 → id = "3"）を取得
  const params = useParams();
  const searchParams = useSearchParams();  // クエリを取得
  const router = useRouter();               // ページ遷移に使う

  // パラメータのidを数値に変換（文字列で渡ってくるため）
  const restaurantId = parseInt(params.id, 10);

  // 該当する店舗情報を mock データから検索
  const restaurant = restaurants.find(r => r.id === restaurantId);

  // 店舗が見つからなかった場合のエラー表示
  if (!restaurant) {
    return <div>店舗が見つかりませんでした。</div>;
  }

  // 中間テーブルから、対象店舗に紐づくカテゴリIDを取り出し、
  // それに該当するカテゴリ名を取得
  const relatedCategories = reataurants_categories
    .filter(rc => rc.restaurant_id === restaurant.id)
    .map(rc => {
      const category = categories.find(cat => cat.id === rc.category_id);
      return category?.name || '';     // 存在しなければ空文字
    });


  // クエリから現在のページを取得。なければ1ページ目
  const currentPage = searchParams.get('page') || '1';

  // 戻るボタンの処理を上書き
  const goBack = () => {
    router.push(`/owner/dashboard?page=${currentPage}`);  // ページ番号つきで戻る
  };


  return (
    <div className={styles.wrapper}>

    {/* 固定ヘッダー部分 */}
    <div className={styles.backButton} onClick={() => window.history.back()}>
      <span className={`material-symbols-outlined ${styles.backIcon}`}>arrow_back</span>
    </div>
    <div className={styles.fixedHeader}>
      <h1 className={styles.title}>{restaurant.name}</h1>

      <p className={styles.address}>
        <a
          href={`https://www.google.com/maps/search/?q=${restaurant.address}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {restaurant.address}
        </a>
      </p>

      <div className={styles.categoryContainer}>
        {relatedCategories.map((category, index) => (
          <CategoryTag key={index} label={category} selected={true} />
        ))}
      </div>

      <div className={styles.divider} /> {/* 区切り線 */}
    </div>

    {/* タブの切り替えUI */}
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === 'detail' ? styles.active : ''}`}
          onClick={() => setActiveTab('detail')}
        >
          店舗詳細
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'menu' ? styles.active : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          メニュー
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'statistics' ? styles.active : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          統計情報
        </button>
      </div>

    {/* スクロール領域 */}
    <div className={styles.scrollArea}>
      {/* ここに画像・地図・レビューなどが入る想定 */}
      {activeTab === 'detail' && <StoreDetailTab restaurant={restaurant} />}
      {activeTab === 'menu' && <StoreMenuTab restaurant={restaurant} />}
      {activeTab === 'statistics' && <StoreMenuTab restaurant={restaurant} />}
    </div>

  </div>
    
  );
}
