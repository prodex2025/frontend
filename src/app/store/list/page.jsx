//店舗一覧画面

'use client';            // Next.js の App Router でクライアントコンポーネントとして扱う宣言

import styles from '@/styles/storeList.module.css';

import '@/app/globals.css';       // グローバルCSS（共通スタイル）

//コンポーネントのインポート
import CategoryTag from '@/components/atoms/CategoryTag.jsx';       // カテゴリー用の再利用コンポーネント
import ShopCard from '@/components/atoms/ShopCard.jsx';             //ショップカード用部品
import Pagination from '@/components/atoms/Pagination.jsx';         //ページネーション用コンポーネント

// 仮のデータセットをインポート（店舗・カテゴリ・関連テーブル）
import { restaurants, categories, reataurants_categories } from '@/data/mockData';

import { useState, useEffect, useRef } from 'react';    // React の状態管理と副作用フック
import { useSearchParams, useRouter } from 'next/navigation';   //ページ移動用
import clsx from 'clsx';     // 条件付きで className を結合するユーティリティ（今のところ未使用）

export default function HomePage() {
  const scrollAreaRef = useRef(null);

  // 現在選択されているカテゴリー名の集合（Setで重複なく管理）
  const [selected, setSelected] = useState(new Set());

  const searchParams = useSearchParams();  // URLのクエリを取得
  const router = useRouter();

  // URLのpageクエリを初期値に使う。なければ1
  const initialPage = parseInt(searchParams.get('page')) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

  // すべての店舗情報を保持（加工された状態）
  const [shops, setShops] = useState([]);
  //店舗検索用
  const [searchText, setSearchText] = useState('');

  //ページネーション用（１ページに１０件ずつ）
  const itemsPerPage = 10;                            // 1ページに表示する店舗数

  // URLのpageが変わったらcurrentPageを更新
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page')) || 1;
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, [searchParams]);

  // カテゴリー選択に応じて表示する店舗一覧（リアルタイムでフィルタ）
  const filteredShops = shops.filter((shop) => {
  const matchesCategory =
    selected.size === 0 || shop.categories.some((cat) => selected.has(cat));

  const lowerSearch = searchText.toLowerCase();

  // 検索欄での検索は「店舗名」のみに絞る！
  const matchesSearch = shop.name.toLowerCase().includes(lowerSearch);

  return matchesCategory && matchesSearch;
});

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
      router.push(`/store/list?page=${page}`, { scroll: false });
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

      return {
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        categories: relatedCategories,
        imageUrl: restaurant.image_url || '/default-shop.png',
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

  // タグをクリックした時に呼ばれる関数（ON/OFFの切り替え）
  const toggleCategory = (name) => {
    const updated = new Set(selected);    // 現在の選択状態をコピー
    updated.has(name) ? updated.delete(name) : updated.add(name);   // トグル処理
    setSelected(updated);    // 新しい選択状態を保存

    setCurrentPage(1); // フィルタ変更時に1ページ目に戻す
     router.push(`/store/list?page=1`, { scroll: false });

  };

  return (
    <div className={styles.wrapper}>
      {/* 検索バー + カテゴリー（固定ヘッダー） */}
      <div className={styles.fixedHeader}>
        {/* 検索バー*/}
        <div className={styles.searchBar}>
          <div className={styles.searchWrapper}>
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="店名で検索" value={searchText} onChange={(e) => setSearchText(e.target.value)}/>
          </div>
        </div>

       {/* カテゴリータグ + 横スクロール矢印 */}
        <div className={styles.filterScrollWrapper}>
          {/* ← 左矢印（アイコンを左右反転） */}
          <span className={`material-symbols-outlined ${styles.scrollIcon} ${styles.left}`}>
            expand_circle_right
          </span>

          {/* 横スクロール領域 */}
          <div className={styles.filterScroll}>
            <div className={styles.filterButtons}>
              {/* 全カテゴリをタグとして表示 */}
              {categories.map((category) => (
                <CategoryTag
                  key={category.id}    // React のキー
                  label={category.name}    // 表示名
                  selected={selected.has(category.name)}    // 選択状態を判定
                  onClick={() => toggleCategory(category.name)}    // クリック時の処理
                  className={styles.filterButton}                  // スタイル指定
                />
              ))}
            </div>
          </div>

          {/* → 右矢印 */}
          <span className={`material-symbols-outlined ${styles.scrollIcon}`}>
            expand_circle_right
          </span>
        </div>
      </div>

      {/* 店舗一覧（スクロール可能） */}
      <div className={styles.scrollArea} ref={scrollAreaRef}>
        <div className={styles.shopList}>
          {/* フィルターされた店舗のみ表示 */}
          {paginatedShops.length === 0 ? (
            <div className={styles.noResult}>該当する店舗は見つかりませんでした。</div>
          ) : (
            paginatedShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} url={`/store/list/details/${shop.id}?page=${currentPage}`}/>
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
