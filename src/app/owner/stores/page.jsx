// 経営者のトップ画面
'use client';

// CSSのインポート
import styles from '@/styles/owner.module.css';
import stylesList from '@/styles/storeList.module.css';
// グローバルCSS（共通スタイル）
import '@/app/globals.css';

// ルーティング操作を行うためのフック
import { useRouter } from 'next/navigation';

// React の状態管理と副作用フック
import { useState, useEffect, useRef } from 'react';

// 仮データの呼び出し
import {restaurants, reataurants_categories, categories} from '@/data/mockData';

// コンポーネントのインポート
import ShopCard from '@/components/atoms/ShopCard.jsx';             //ショップカード用部品
import Pagination from '@/components/atoms/Pagination.jsx';         //ページネーション用コンポーネント

export default function Owner(){

  const scrollAreaRef = useRef(null);

  const router = useRouter();

  // すべての店舗情報を保持（加工された状態）
  const [shops, setShops] = useState([]);

  //ページネーション用（１ページに１０件ずつ）
  const [currentPage, setCurrentPage] = useState(1);  // 今のページ番号
  const itemsPerPage = 10;// 1ページに表示する店舗数

  // 仮にidに設定する
  let id = 3;

  // 経営者IDに伴って表示する店舗をフィルタリングする
  const filteredShops = shops.filter((shop) =>shop.owner_id === id);

  // ページ分割された店舗リスト
  const totalPages = Math.ceil(filteredShops.length / itemsPerPage);
  const paginatedShops = filteredShops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  //次のページへの移動用
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 初回マウント時に mock データを加工して shops にセット    
  useEffect(() => {
    const formattedShops = restaurants.map((restaurant) => {
      // 1つの店舗に対して、関連付けられたカテゴリ名一覧を取得
      const relatedCategories = reataurants_categories
        .filter(rc => rc.restaurant_id === restaurant.id)   // 対象店舗に関連するレコードだけ
        .map(rc => {
          const category = categories.find(cat => cat.id === rc.category_id);
          return category?.name || '';       // 存在しなければ空文字を返す
        });

      // 加工して使用するデータを戻り値に設定する
      return {
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        categories: relatedCategories,
        imageUrl: restaurant.image_url || '/default-shop.png',
        owner_id:restaurant.owner_id,
      };
    });

    setShops(formattedShops);    // 加工済み店舗データをステートに保存
  }, []);

  // currentPageが変わったら、ページトップにスクロールする
  useEffect(() => {
  if (scrollAreaRef.current) {
    scrollAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }
  }, [currentPage]);

  // 店舗の新規登録画面への遷移処理
  function move(){
    console.log("新規登録画面に移動します。");
    router.push('/owner/stores/register');
  }

  return (
    <div className={styles.content}>
      <div className={styles.heder}>
        <h1>登録店舗一覧</h1>
        <button type='button' onClick={move}>店舗追加</button>
      </div>

      {/* 店舗一覧（スクロール可能） */}
      <div className={stylesList.scrollArea} ref={scrollAreaRef}>
        <div className={stylesList.shopList}>
          {/* フィルターされた店舗のみ表示 */}
          {paginatedShops.length === 0 ? (
            <div className={stylesList.noResult}>店舗が見つかりませんでした。</div>
          ) : (
            paginatedShops.map((shop) => (

              <ShopCard key={shop.id} shop={shop} url="/owner/dashboard/"/>
            ))
          )}
        </div>
      </div>

      {/* ページネーション */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
      />
      
    </div>
  );
}
