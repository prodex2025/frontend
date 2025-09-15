// 経営者のトップ画面
'use client';

import styles from '@/styles/owner.module.css';
import stylesList from '@/styles/storeList.module.css';
import '@/app/globals.css';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

import ShopCard from '@/components/atoms/ShopCard.jsx';
import Pagination from '@/components/atoms/Pagination.jsx';

import { apiFetch, checkTokenExpired } from '@/hooks/useApiFetch';

export default function Owner() {
  const router = useRouter();
  const scrollAreaRef = useRef(null);

  // API結果（1ページ分）
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // サーバー側ページング（UIは1始まり）
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // ページ取得
  const fetchPage = async (uiPage) => {
    setLoading(true);
    setFetchError(null);
    try {
      // Springのpageは0始まりなので-1
      const zeroBased = Math.max(0, uiPage - 1);

      // 必要に応じて size/sort を足す
      const result = await apiFetch(
        `/api/owner/restaurants?page=${zeroBased}`, // &size=10
        { method: 'GET' }
      );

      if (checkTokenExpired(result, router)) return;

      if (!result.response.ok) {
        const text = await result.response.text().catch(() => '');
        throw new Error(`Failed: ${result.response.status} ${result.response.statusText} ${text}`);
      }

      const data = await result.response.json();

      const formatted = (Array.isArray(data.content) ? data.content : []).map((r) => ({
        id: r.id,
        name: r.name,
        address: r.address ?? '',
        postCode: r.postCode ?? '',
        imageUrl: r.imageUrl || '/default-shop.png',
        categories: Array.isArray(r.categoryDtoList)
          ? r.categoryDtoList.map((c) => (typeof c === 'string' ? c : c?.name ?? ''))
          : [],
      }));

      setShops(formatted);
      setTotalPages(Math.max(1, data.totalPages ?? 1));
      setTotalElements(data.totalElements ?? formatted.length);
    } catch (e) {
      console.error(e);
      setFetchError(e.message ?? 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // 初回 & currentPage変更時に取得
  useEffect(() => {
    fetchPage(currentPage);
  }, [currentPage]);

  // ページトップにスクロール
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, shops.length]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const move = () => router.push('/owner/stores/register');

  return (
    <div className={styles.content}>
      <div className={styles.heder}>
        <h1>登録店舗一覧</h1>
        <button type="button" onClick={move}>店舗追加</button>
      </div>

      <div className={stylesList.scrollArea} ref={scrollAreaRef}>
        <div className={stylesList.shopList}>
          {loading ? (
            <div className={stylesList.noResult}>読み込み中...</div>
          ) : fetchError ? (
            <div className={stylesList.noResult}>取得に失敗しました：{fetchError}</div>
          ) : shops.length === 0 ? (
            <div className={stylesList.noResult}>店舗が見つかりませんでした。</div>
          ) : (
            shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} url="/owner/dashboard/" />
            ))
          )}
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
      />
    </div>
  );
}
