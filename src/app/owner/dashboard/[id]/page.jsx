// 経営者画面の店舗詳細画面
"use client";

import styles from "@/styles/StoreDetailPage.module.css";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import CategoryTag from "@/components/atoms/CategoryTag";
import StoreDetailTab from "@/components/atoms/StoreDetailTab";
import StoreMenuTab from "@/components/atoms/StoreMenuTab";
import StoreStatisticsTab from "@/components/atoms/StoreStatisticsTab";
import EditButton from "@/components/atoms/EditButton";
import EditStoreModal from "@/components/molecules/EditStoreModal";
import EditStoreForm from "@/components/molecules/EditStoreForm";
import EditDetailTab from "@/components/molecules/EditDetailTab";
import EditMenuTab from "@/components/molecules/EditMenuTab";

import { apiFetch, checkTokenExpired } from "@/hooks/useApiFetch";

export default function StoreDetailPage() {
  // タブ/編集
  const [activeTab, setActiveTab] = useState("detail");
  const [isEditing, setIsEditing] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // 取得状態
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [menuItems, setMenuItems] = useState([]);
  const [menuPage, setMenuPage] = useState(1);
  const [menuTotalPages, setMenuTotalPages] = useState(1);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState(null);
  const [menuLoadedOnce, setMenuLoadedOnce] = useState(false);

  const router = useRouter();
  const params = useParams();
  // UUID をそのまま使う（parseIntしない）
  const restaurantId = Array.isArray(params.id) ? params.id[0] : params.id;

  const fetchMenuPage = async (uiPage = 1) => {
    try {
      setMenuLoading(true);
      setMenuError(null);
      const zeroBased = Math.max(0, uiPage - 1);

      // エンドポイントはバックエンドに合わせて調整
      const result = await apiFetch(
        `/api/owner/restaurants/${restaurantId}/menus?page=${zeroBased}`,
        { method: "GET" }
      );
      if (checkTokenExpired(result, router)) return;
      console.log(result);
      if (!result.response.ok) {
        const t = await result.response.text().catch(() => "");
        throw new Error(`メニュー取得失敗: ${result.response.status} ${t}`);
      }

      const data = await result.response.json();

      const formatted = (Array.isArray(data.content) ? data.content : []).map(
        (d) => ({
          id: d.id,
          name: d.name,
          price: d.price,
          imageUrl: d.imageUrl || "/default-dish.png",
        })
      );

      setMenuItems(formatted);
      setMenuTotalPages(Math.max(1, data.totalPages ?? 1));
      setMenuPage(uiPage);
      setMenuLoadedOnce(true);
    } catch (e) {
      console.error(e);
      setMenuError(e.message ?? "メニュー取得エラー");
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "menu" && !menuLoadedOnce && restaurantId) {
      fetchMenuPage(1);
    }
  }, [activeTab, restaurantId, menuLoadedOnce]);

  // 追加：店舗が切り替わったらメニュー状態はリセット
  useEffect(() => {
    setMenuItems([]);
    setMenuPage(1);
    setMenuTotalPages(1);
    setMenuLoading(false);
    setMenuError(null);
    setMenuLoadedOnce(false);
  }, [restaurantId]);

  // API から詳細取得
  const fetchRestaurant = async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      setFetchError(null);

      // 2つのAPIを並列で叩く
      const [baseRes, profileRes] = await Promise.all([
        apiFetch(`/api/owner/restaurants/${restaurantId}`, { method: "GET" }),
        apiFetch(`/api/owner/restaurants/${restaurantId}/profile`, {
          method: "GET",
        }),
      ]);

      if (
        checkTokenExpired(baseRes, router) ||
        checkTokenExpired(profileRes, router)
      )
        return;

      if (!baseRes.response.ok) {
        const t = await baseRes.response.text().catch(() => "");
        throw new Error(
          `restaurants/${restaurantId} 取得失敗: ${baseRes.response.status} ${t}`
        );
      }
      if (!profileRes.response.ok) {
        const t = await profileRes.response.text().catch(() => "");
        throw new Error(
          `restaurants/${restaurantId}/profile 取得失敗: ${profileRes.response.status} ${t}`
        );
      }

      const base = await baseRes.response.json();
      const profile = await profileRes.response.json();

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
  };

  // 初回ロード
  useEffect(() => {
    fetchRestaurant();
  }, [restaurantId, router]);
  // ローディング/エラー
  if (loading) return <div className={styles.wrapper}>読み込み中...</div>;
  if (fetchError)
    return (
      <div className={styles.wrapper}>取得に失敗しました：{fetchError}</div>
    );
  if (!restaurant)
    return <div className={styles.wrapper}>店舗が見つかりませんでした。</div>;

  return (
    <div className={styles.wrapper}>
      {/* 固定ヘッダー部分 */}
      <div className={styles.fixedHeaderOwner}>
        {/* 戻る */}
        <div className={styles.backButton}>
          <Link href={`/owner/stores/`}>
            <span className={`material-symbols-outlined ${styles.backIcon}`}>
              arrow_back
            </span>
          </Link>
        </div>

        {/* 中央コンテンツ */}
        <div className={styles.centerContent}>
          <h1 className={styles.title}>{restaurant.name}</h1>
          <p className={styles.address}>
            <a
              href={`https://www.google.com/maps/search/?q=${encodeURIComponent(
                restaurant.address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {restaurant.address}
            </a>
          </p>

          {/* カテゴリ */}
          <div className={styles.categoryContainer}>
            {(restaurant.categories ?? []).length > 0 ? (
              restaurant.categories.map((category, i) => (
                <CategoryTag key={i} label={category} selected={true} />
              ))
            ) : (
              <span className={styles.noCategory}>カテゴリなし</span>
            )}
          </div>
        </div>

        {/* 編集ボタン */}
        <div>
          <EditButton
            onClick={() => setEditModalOpen(true)}
            className={styles.editBtn}
          />
        </div>
      </div>

      <div className={styles.divider} />

      {/* タブ切替 */}
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "detail" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("detail")}
          disabled={isEditing}
        >
          店舗詳細
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "menu" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("menu")}
          disabled={isEditing}
        >
          メニュー
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "statistics" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("statistics")}
          disabled={isEditing}
        >
          統計情報
        </button>

        {activeTab !== "statistics" && (
          <div className={styles.editBtnTab}>
            <EditButton
              onClick={() => setIsEditing(!isEditing)}
              icon={isEditing ? "arrow_back" : "edit_square"}
            />
          </div>
        )}
      </div>

      {/* スクロール領域 */}
      <div className={styles.scrollArea}>
        {!isEditing ? (
          <>
            {activeTab === "detail" && (
              <StoreDetailTab restaurant={restaurant} />
            )}
            {activeTab === "menu" && (
              <StoreMenuTab
                items={menuItems}
                loading={menuLoading}
                error={menuError}
                currentPage={menuPage}
                totalPages={menuTotalPages}
                onPageChange={fetchMenuPage} // ← ページ送り時に再フェッチ
              />
            )}
            {activeTab === "statistics" && (
              <StoreStatisticsTab restaurant={restaurant} />
            )}
          </>
        ) : (
          <>
            {activeTab === "detail" && (
              <EditDetailTab restaurant={restaurant} section="detail" />
            )}
            {activeTab === "menu" && (
              <EditMenuTab
                restaurant={restaurant}
                section="menu"
                onMenusChanged={() => fetchMenuPage(menuPage)}
              />
            )}
          </>
        )}
      </div>

      {/* 編集モーダル */}
      <EditStoreModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      >
        <EditStoreForm
          restaurant={restaurant}
          onClose={() => setEditModalOpen(false)}
          onSaved={async () => {
            // 保存後に最新を取り直してラベル(Chip)を更新
            await fetchRestaurant();
          }}
        />
      </EditStoreModal>
    </div>
  );
}
