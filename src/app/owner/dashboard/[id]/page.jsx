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
import StoreStatisticsTab from '@/components/atoms/StoreStatisticsTab'; // 統計情報用コンポーネント
import EditButton from '@/components/atoms/EditButton'; // 編集ボタンのコンポーネント
import EditStoreModal from "@/components/molecules/EditStoreModal"; // 編集の際のモーダルのコンポーネント
import EditStoreForm from "@/components/molecules/EditStoreForm"; //上の編集のフォームのコンポーネント
import EditDetailTab from '@/components/Molecules/EditDetailTab';
import EditMenuTab from '@/components/Molecules/EditMenuTab';

export default function StoreDetailPage() {

  //タブ切り替え用
  const [activeTab, setActiveTab] = useState('detail');

  // 編集モードの状態管理
  const [isEditing, setIsEditing] = useState(false);

  // 編集モーダルの開閉状態を管理
  const [editModalOpen, setEditModalOpen] = useState(false);

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
      <div className={styles.fixedHeaderOwner}>
        {/* 戻るボタン */}
        <div className={styles.backButton} onClick={() => window.history.back()}>
          <span className={`material-symbols-outlined ${styles.backIcon}`}>arrow_back</span>
        </div>
        {/* 真ん中のコンテンツ */}
        <div className={styles.centerContent}>
          {/* タイトル */}
          <h1 className={styles.title}>{restaurant.name}</h1>
          {/* 住所 */}
          <p className={styles.address}>
            <a
              href={`https://www.google.com/maps/search/?q=${restaurant.address}`}
            target="_blank"
              rel="noopener noreferrer"
            >
              {restaurant.address}
            </a>
          </p>
          {/* カテゴリ― */}
        <div className={styles.categoryContainer}>
          {relatedCategories.map((category, index) => (
            <CategoryTag key={index} label={category} selected={true} />
          ))}
        </div>
      </div>
      {/* 編集ボタン */}
      <div>
        <EditButton onClick={() => setEditModalOpen(true)} className={styles.editBtn}/>
      </div>
    </div>
    <div className={styles.divider} /> {/* 区切り線 */}

    {/* タブの切り替えUI */}
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === 'detail' ? styles.active : ''}`}
          onClick={() => setActiveTab('detail')}
          disabled={isEditing}
        >
          店舗詳細
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'menu' ? styles.active : ''}`}
          onClick={() => setActiveTab('menu')}
          disabled={isEditing}
        >
          メニュー
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'statistics' ? styles.active : ''}`}
          onClick={() => setActiveTab('statistics')}
          disabled={isEditing}
        >
          統計情報
        </button>
        {activeTab !== 'statistics' && (
        <div className={styles.editBtnTab}>
            <EditButton
              onClick={() => setIsEditing(!isEditing)}
              icon={isEditing ? 'arrow_back' : 'edit_square'}
            />
          </div>
        )}
      </div>

    {/* スクロール領域 */}
    <div className={styles.scrollArea}>
      {/* ここに画像・地図・レビューなどが入る想定 */}
      {!isEditing ? (
        <>
          {activeTab === 'detail' && <StoreDetailTab restaurant={restaurant} />}
          {activeTab === 'menu' && <StoreMenuTab restaurant={restaurant} />}
          {activeTab === 'statistics' && <StoreStatisticsTab restaurant={restaurant} />}
        </>
      ):(
        <>
          {activeTab === 'detail' && <EditDetailTab restaurant={restaurant} section="detail" />}
          {activeTab === 'menu' && <EditMenuTab restaurant={restaurant} section="menu" />}
        </>
      )}
    </div>
    {/* 編集モーダル */}
    <EditStoreModal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
      <EditStoreForm onClose={() => setEditModalOpen(false)} />
    </EditStoreModal>
  </div>
    
  );
}
