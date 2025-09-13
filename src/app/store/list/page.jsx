// 店舗一覧画面
"use client";

import styles from "@/styles/storeList.module.css";
import "@/app/globals.css";

import CategoryTag from "@/components/atoms/CategoryTag.jsx";
import ShopCard from "@/components/atoms/ShopCard.jsx";
import Pagination from "@/components/atoms/Pagination.jsx";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiFetch, checkTokenExpired } from "@/hooks/useApiFetch";

export default function HomePage() {
  const scrollAreaRef = useRef(null);
  const filterScrollRef = useRef(null);

  // カテゴリは ID で管理
  const [selectedIds, setSelectedIds] = useState(new Set());

  const searchParams = useSearchParams();
  const router = useRouter();

  const initialPage = parseInt(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState("");

  const [serverTotalPages, setServerTotalPages] = useState(1);
  const itemsPerPage = 10;

  // --- 初回：カテゴリ & 店舗(1ページ目) ---
  useEffect(() => {
    (async () => {
      try {
        const [catRes, shopRes] = await Promise.all([
          apiFetch("/api/categories"),
          apiFetch(`/api/restaurants?page=0&size=${itemsPerPage}`),
        ]);

        if (checkTokenExpired(catRes, router) || checkTokenExpired(shopRes, router)) return;

        // カテゴリ
        if (catRes.response.ok) {
          const catJson = await catRes.response.json();
          setCategories(Array.isArray(catJson) ? catJson : (catJson.categories ?? []));
        } else {
          console.error("カテゴリ取得エラー:", await catRes.response.text());
        }

        // 店舗
        if (shopRes.response.ok) {
          const j = await shopRes.response.json();
          const items = (j.content ?? []).map((r) => ({
            id: r.id,
            name: r.name,
            address: r.address,
            postCode: r.postCode,
            categories: (r.categoryDtoList ?? []).map((c) => c.name),
            imageUrl: r.imageUrl ?? null,
          }));
          setShops(items);
          setServerTotalPages(j.totalPages ?? 1);
        } else {
          console.error("店舗取得エラー:", await shopRes.response.text());
        }
      } catch (err) {
        console.error("初期データ取得エラー:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- フィルタ / 検索 / ページ変更時：店舗データ取得 ---
  useEffect(() => {
    (async () => {
      try {
        const query = new URLSearchParams();

        // categoryIds を List として付与（…?categoryIds=id1&categoryIds=id2）
        if (selectedIds.size > 0) {
          Array.from(selectedIds).forEach((id) => query.append("categoryIds", id));
        }
        if (searchText) query.set("keyword", searchText);
        query.set("page", String(currentPage - 1)); // サーバは0始まり
        query.set("size", String(itemsPerPage));

        const result = await apiFetch(`/api/restaurants?${query.toString()}`);
        if (checkTokenExpired(result, router)) return;

        if (!result.response.ok) {
          console.error("店舗データ取得エラー:", await result.response.text());
          return;
        }
        const j = await result.response.json();
        const items = (j.content ?? []).map((r) => ({
          id: r.id,
          name: r.name,
          address: r.address,
          postCode: r.postCode,
          categories: (r.categoryDtoList ?? []).map((c) => c.name),
          imageUrl: r.imageUrl ?? null,
        }));
        setShops(items);
        setServerTotalPages(j.totalPages ?? 1);
      } catch (err) {
        console.error("店舗データ取得エラー:", err);
      }
    })();
  }, [selectedIds, searchText, currentPage, router]);

  // URLのpageが変わったらcurrentPageを更新
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get("page")) || 1;
    if (pageFromUrl !== currentPage) setCurrentPage(pageFromUrl);
  }, [searchParams, currentPage]);

  // ページ移動でスクロールトップへ
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  const paginatedShops = shops; // サーバページング
  const totalPages = serverTotalPages;

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      router.push(`/store/list?page=${page}`, { scroll: false });
    }
  };

  // カテゴリー選択トグル（IDで管理）
  const toggleCategory = (id) => {
    const updated = new Set(selectedIds);
    updated.has(id) ? updated.delete(id) : updated.add(id);
    setSelectedIds(updated);
    setCurrentPage(1);
    router.push(`/store/list?page=1`, { scroll: false });
  };

  const onSearchChange = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
    router.push("/store/list?page=1", { scroll: false });
  };

  const scrollCategoryLeft = () => {
    if (filterScrollRef.current) {
      filterScrollRef.current.scrollBy({ left: -550, behavior: "smooth" });
    }
  };
  const scrollCategoryRight = () => {
    if (filterScrollRef.current) {
      filterScrollRef.current.scrollBy({ left: 550, behavior: "smooth" });
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* 検索バー + カテゴリー（固定ヘッダー） */}
      <div className={styles.fixedHeader}>
        {/* 検索バー */}
        <div className={styles.searchBar}>
          <div className={styles.searchWrapper}>
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="店名で検索"
              value={searchText}
              onChange={onSearchChange}
            />
          </div>
        </div>

        {/* カテゴリータグ + 横スクロール矢印 */}
        <div className={styles.filterScrollWrapper}>
          <span
            className={`material-symbols-outlined ${styles.scrollIcon} ${styles.left}`}
            onClick={scrollCategoryLeft}
          >
            expand_circle_right
          </span>

          <div className={styles.filterScroll} ref={filterScrollRef}>
            <div className={styles.filterButtons}>
              {categories.map((category) => (
                <CategoryTag
                  key={category.id}
                  label={category.name}
                  selected={selectedIds.has(category.id)}
                  onClick={() => toggleCategory(category.id)}
                  className={styles.filterButton}
                />
              ))}
            </div>
          </div>

          <span
            className={`material-symbols-outlined ${styles.scrollIcon}`}
            onClick={scrollCategoryRight}
          >
            expand_circle_right
          </span>
        </div>
      </div>

      {/* 店舗一覧 */}
      <div className={styles.scrollArea} ref={scrollAreaRef}>
        <div className={styles.shopList}>
          {paginatedShops.length === 0 ? (
            <div className={styles.noResult}>該当する店舗は見つかりませんでした。</div>
          ) : (
            paginatedShops.map((shop, index) => (
              <ShopCard
                key={`${shop.id}-${index}`}
                shop={shop}
                url={`/store/list/details/${shop.id}?page=${currentPage}`}
              />
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
