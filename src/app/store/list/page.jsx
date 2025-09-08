//店舗一覧画面

'use client';            // Next.js の App Router でクライアントコンポーネントとして扱う宣言

import styles from '@/styles/storeList.module.css';

import '@/app/globals.css';       // グローバルCSS（共通スタイル）

//コンポーネントのインポート
import CategoryTag from '@/components/atoms/CategoryTag.jsx';       // カテゴリー用の再利用コンポーネント
import ShopCard from '@/components/atoms/ShopCard.jsx';             //ショップカード用部品
import Pagination from '@/components/atoms/Pagination.jsx';         //ページネーション用コンポーネント

// 仮のデータセットをインポート（店舗・カテゴリ・関連テーブル）
//import { restaurants, categories, reataurants_categories } from '@/data/mockData';

import { useState, useEffect, useRef } from 'react';    // React の状態管理と副作用フック
import { useSearchParams, useRouter } from 'next/navigation';   //ページ移動用
import clsx from 'clsx';     // 条件付きで className を結合するユーティリティ（今のところ未使用）

export default function HomePage() {
  const scrollAreaRef = useRef(null);

  // 現在選択されているカテゴリー名の集合（Setで重複なく管理）
  const [selected, setSelected] = useState(new Set());

  const searchParams = useSearchParams();  // URLのクエリを取得
  const router = useRouter();

  // ページ番号管理（URLのpageクエリを初期値に使う。なければ1）
  const initialPage = parseInt(searchParams.get('page')) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

  // 取得した店舗データとカテゴリデータを分けて管理
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  
  //店舗検索用
  const [searchText, setSearchText] = useState('');

  //ページネーション用（１ページに１０件ずつ）
  const itemsPerPage = 10;                            // 1ページに表示する店舗数

   // --- 初回：カテゴリ一覧のみ取得 ---
  useEffect(() => {
    fetch('/api/store') // クエリなしで全カテゴリを取得
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories);
      })
      .catch(err => console.error('カテゴリ取得エラー:', err));
  }, []);

  // --- フィルタ変更時：店舗データ取得 ---
  useEffect(() => {
    const categoriesQuery = Array.from(selected).join(',');
    const query = new URLSearchParams();
    if (searchText) query.set('keyword', searchText);
    if (categoriesQuery) query.set('categories', categoriesQuery);

    fetch(`/api/store?${query.toString()}`)
      .then(res => res.json())
      .then(data => {
        setShops(data.stores);
      })
      .catch(err => console.error('店舗データ取得エラー:', err));
  }, [selected, searchText]);

  // URLのpageが変わったらcurrentPageを更新
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page')) || 1;
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, [searchParams]);

  // --- ページ変更でスクロール位置をトップに ---
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  // --- 店舗フィルター後のページング処理 ---
  const totalPages = Math.ceil(shops.length / itemsPerPage);
  const paginatedShops = shops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      router.push(`/store/list?page=${page}`, { scroll: false });
    }
  };

  // --- カテゴリー選択トグル ---
  const toggleCategory = (name) => {
    const updated = new Set(selected);
    updated.has(name) ? updated.delete(name) : updated.add(name);
    setSelected(updated);

    setCurrentPage(1);
    router.push(`/store/list?page=1`, { scroll: false });
  };

  // --- 検索テキスト入力時 ---
  const onSearchChange = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
    router.push(`/store/list?page=1`, { scroll: false });
  };

  // フィルターエリアの横スクロール制御
  const filterScrollRef = useRef(null);

  const scrollCategoryLeft = () => {
    if (filterScrollRef.current) {
        filterScrollRef.current.scrollBy({ left: -550, behavior: 'smooth' });
    }
  };

  const scrollCategoryRight = () => {
    if (filterScrollRef.current) {
      filterScrollRef.current.scrollBy({ left: 550, behavior: 'smooth' });
    }
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
          <span className={`material-symbols-outlined ${styles.scrollIcon} ${styles.left}`} onClick={scrollCategoryLeft}>
            expand_circle_right
          </span>

          {/* 横スクロール領域 */}
          <div className={styles.filterScroll} ref={filterScrollRef}>
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
          <span className={`material-symbols-outlined ${styles.scrollIcon}`} onClick={scrollCategoryRight}>
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
