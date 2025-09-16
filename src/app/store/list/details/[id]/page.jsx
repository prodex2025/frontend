//店舗詳細画面
'use client';

import { apiFetch, checkTokenExpired } from '@/hooks/useApiFetch';

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
  const [fetchError, setFetchError] = useState(null);
  const [activeTab, setActiveTab] = useState('detail');


   // ✅ 店舗詳細データを API から取得
 // API から詳細取得
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setFetchError(null);
      try {
        // 2つのAPIを並列で叩く
        const [baseRes, profileRes] = await Promise.all([
          apiFetch(`/api/restaurants/${id}`, { method: "GET" }),
          apiFetch(`/api/restaurants/${id}/profile`, {
            method: "GET",
          }),
        ]);

        // トークン失効チェック
        if (
          checkTokenExpired(baseRes, router) ||
          checkTokenExpired(profileRes, router)
        )
          return;

        // ステータスチェック
        if (!baseRes.response.ok) {
          const t = await baseRes.response.text().catch(() => "");
          throw new Error(
            `restaurants/${id} 取得失敗: ${baseRes.response.status} ${t}`
          );
        }
        if (!profileRes.response.ok) {
          const t = await profileRes.response.text().catch(() => "");
          throw new Error(
            `restaurants/${id}/profile 取得失敗: ${profileRes.response.status} ${t}`
          );
        }

        const base = await baseRes.response.json();
        const profile = await profileRes.response.json();

        // 返却例に合わせてマージ
        const merged = {
          id: base.id,
          name: base.name,
          address: base.address ?? "",
          postCode: base.postCode ?? "",
          imageUrl: base.imageUrl || "/default-shop.png",
          categories: Array.isArray(base.categoryDtoList)
            ? base.categoryDtoList.map((c) =>
                typeof c === "string" ? c : c?.name ?? ""
              )
            : [],

          // プロフィール側
          phone: profile.phone ?? "",
          email: profile.email ?? "",
          description: profile.description ?? "",
          interiorImageUrl: profile.interiorImageUrl ?? "",
          storeSchedules: profile.storeScheduleDtoList ?? [],
        };

        setRestaurant(merged);
      } catch (e) {
        console.error(e);
        setFetchError(e.message ?? "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  if (loading) return <div>読み込み中...</div>;
  if (fetchError) return <div>{fetchError}</div>;



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
        {(restaurant.categoryDtoList || []).map((category, index) => (
          <CategoryTag key={category.id} label={category.name} selected={true} />
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
