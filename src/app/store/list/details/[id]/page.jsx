//店舗詳細画面
'use client';

import styles from '@/styles/StoreDetailPage.module.css';


import { useState, useEffect } from 'react';     //タブ切り替え、状態保存用
import { useParams, useSearchParams, useRouter  } from 'next/navigation';  //URLパラメータを取得するためのフック
//import { restaurants, reataurants_categories, categories } from '@/data/mockData'; //データインポート

import ShopInfo from '@/components/atoms/ShopInfo';        // 店舗情報を表示するためのコンポーネント
import CategoryTag from '@/components/atoms/CategoryTag'; // カテゴリータグコンポーネント
import StoreDetailTab from '@/components/atoms/StoreDetailTab';     //詳細タブ用コンポーネント
import StoreMenuTab from '@/components/atoms/StoreMenuTab'; // メニュータブ用コンポーネント

export default function StoreDetailPage() {

  const { id } = useParams(); // /store/list/details/[id]
  const searchParams = useSearchParams(); // ?page=3 など
  const router = useRouter();

  const currentPage = searchParams.get('page') || '1';
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('detail');

   // ✅ 店舗詳細データを API から取得
  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const res = await fetch(`/api/store?id=${id}`);
        if (!res.ok) {
          throw new Error('店舗が見つかりません');
        }
        const data = await res.json();
        setRestaurant(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurant();
  }, [id]);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>{error}</div>;



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
        {restaurant.categories.map((category, index) => (
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
      </div>

    {/* スクロール領域 */}
    <div className={styles.scrollArea}>
      {/* ここに画像・地図・レビューなどが入る想定 */}
      {activeTab === 'detail' && <StoreDetailTab restaurant={restaurant} />}
      {activeTab === 'menu' && <StoreMenuTab restaurant={restaurant} />}
    </div>

  </div>
    
  );
}
