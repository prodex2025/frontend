"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import styles from "@/styles/EditMenuTab.module.css";
import { useRouter } from "next/navigation";

// モーダル＆フォーム
import EditStoreModal from "@/components/molecules/EditStoreModal";
import EditMenuRegistartionForm from "@/components/molecules/EditMenuRegistrationForm";
import EditMenuForm from "@/components/molecules/EditMenuForm";

// 認証付きフェッチ
import { apiFetch, checkTokenExpired } from "@/hooks/useApiFetch";

export default function EditMenuTab({ restaurant, onMenusChanged }) {
  if (!restaurant) return null;

  // 一覧
  const [restaurantDishes, setRestaurantDishes] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [loading, setLoading] = useState(false);

  // モーダル
  const [isModalOpen, setIsModalOpen] = useState(false); // 編集
  const [isEditMenuModalOpen, setIsEditMenuModalOpen] = useState(false); // 追加
  const [editingDish, setEditingDish] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const router = useRouter();
  const abortRef = useRef(null);

  // --- 取得（GET /api/owner/restaurants/{restaurantId}/menus） ---
  const fetchDishes = useCallback(async () => {
    if (!restaurant?.id) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setFetchError(null);
    try {
      const result = await apiFetch(
        `/api/owner/restaurants/${restaurant.id}/menus?page=0&size=10&sort=createdAt,desc`,
        { method: "GET", signal: controller.signal }
      );
      if (checkTokenExpired(result, router)) return;

      if (!result.response.ok) {
        const t = await result.response.text().catch(() => "");
        throw new Error(`取得に失敗しました: ${result.response.status} ${t}`);
      }

      const data = await result.response.json();
      const list = Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data)
        ? data
        : [];

      // 既存UIのまま使えるよう imageUrl → image_url に正規化
      const normalized = list.map((d) => ({
        id: d.id,
        name: d.name,
        price: d.price,
        image_url: d.imageUrl || d.image_url || "/default-dish.png",
        restaurant_id: restaurant.id,
      }));

      setRestaurantDishes(normalized);
    } catch (e) {
      if (e.name !== "AbortError") {
        console.error(e);
        setFetchError(e.message ?? "取得時にエラーが発生しました");
      }
    } finally {
      setLoading(false);
    }
  }, [restaurant?.id, router]);

  useEffect(() => {
    fetchDishes();
    return () => abortRef.current?.abort();
  }, [fetchDishes]);

  // --- 追加（POST /api/owner/restaurants/{restaurantId}/menus） ---
  const createMenu = async (payload) => {
    try {
      const res = await apiFetch(
        `/api/owner/restaurants/${restaurant.id}/menus`,
        { method: "POST", body: JSON.stringify(payload) }
      );
      if (checkTokenExpired(res, router)) return false;

      if (!res.response.ok) {
        const t = await res.response.text().catch(() => "");
        throw new Error(`登録に失敗しました: ${res.response.status} ${t}`);
      }
      await fetchDishes();
      return true;
    } catch (e) {
      console.error(e);
      alert(e.message ?? "メニューの登録に失敗しました");
      return false;
    }
  };

  // --- 更新（PUT /api/owner/restaurants/{restaurantId}/menus/{menuId}） ---
  const updateMenu = async (menuId, payload) => {
    try {
      const res = await apiFetch(
        `/api/owner/restaurants/${restaurant.id}/menus/${menuId}`,
        { method: "PUT", body: JSON.stringify(payload) }
      );
      if (checkTokenExpired(res, router)) return false;

      if (!res.response.ok) {
        const t = await res.response.text().catch(() => "");
        throw new Error(`更新に失敗しました: ${res.response.status} ${t}`);
      }
      await fetchDishes();
      return true;
    } catch (e) {
      console.error(e);
      alert(e.message ?? "メニューの更新に失敗しました");
      return false;
    }
  };

  // --- 削除（DELETE /api/owner/restaurants/{restaurantId}/menus/{menuId}） ---
  const handleDelete = async (dish) => {
    if (deletingId !== null) return; // 連打防止
    if (!confirm(`「${dish.name}」を削除しますか？`)) return;

    setDeletingId(dish.id);

    // 楽観的に一旦消す（そのままでもOKだが、最終的に必ず再取得する）
    setRestaurantDishes((list) => list.filter((d) => d.id !== dish.id));

    try {
      const res = await apiFetch(
        `/api/owner/restaurants/${restaurant.id}/menus/${dish.id}`,
        { method: "DELETE" }
      );
      if (checkTokenExpired(res, router)) return;

      if (!res.response.ok) {
        // 失敗時は最新状態で再同期（ロールバックより確実）
        await fetchDishes();
        const t = await res.response.text().catch(() => "");
        alert(`削除に失敗しました: ${res.response.status} ${t}`);
        return;
      }

      // 成功時も必ずサーバーの真実に合わせて再取得
      await fetchDishes();
      onMenusChanged && onMenusChanged();
    } catch (e) {
      console.error(e);
      alert("通信エラーが発生しました。");
      // エラー時も最新状態に合わせる
      await fetchDishes();
    } finally {
      setDeletingId(null);
    }
  };

  // --- モーダル開閉 ---
  const handleEdit = (dish) => {
    setEditingDish(dish);
    setIsAdding(false);
    setIsModalOpen(true); // 編集モーダル
  };

  const handleAdd = () => {
    setEditingDish(null);
    setIsAdding(true);
    setIsEditMenuModalOpen(true); // 追加モーダル
  };

  return (
    <div className={styles.menuContainer}>
      {/* 既存UIのまま */}
      {loading ? (
        <div className={styles.empty}>読み込み中...</div>
      ) : fetchError ? (
        <div className={styles.empty}>取得に失敗しました：{fetchError}</div>
      ) : restaurantDishes.length === 0 ? (
        <div className={styles.empty}>
          メニュー情報がありません。
          <div className={styles.menuGrid}>
            {/* メニュー追加カード */}
            <div
              className={`${styles.menuCard} ${styles.addMenuCard}`}
              onClick={handleAdd}
            >
              <div className={styles.addMenuContent}>
                <p className={styles.addText}>メニューを追加</p>
                <span className={`${styles.addIcon} material-symbols-outlined`}>
                  add_circle
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.menuGrid}>
          {/* メニュー追加カード */}
          <div
            className={`${styles.menuCard} ${styles.addMenuCard}`}
            onClick={handleAdd}
          >
            <div className={styles.addMenuContent}>
              <p className={styles.addText}>メニューを追加</p>
              <span className={`${styles.addIcon} material-symbols-outlined`}>
                add_circle
              </span>
            </div>
          </div>

          {restaurantDishes.map((dish) => (
            <div key={dish.id} className={styles.menuCard}>
              {/* 左:削除, 右:編集 */}
              <div className={styles.menuCardHeader}>
                <span
                  className={`${styles.icon} material-symbols-outlined`}
                  onClick={() => handleDelete(dish)}
                  aria-disabled={deletingId === dish.id}
                >
                  delete
                </span>
                <span
                  className={`${styles.icon} material-symbols-outlined`}
                  onClick={() => handleEdit(dish)}
                >
                  edit
                </span>
              </div>

              <img
                src={dish.image_url.replace("@", "")}
                alt={dish.name}
                className={styles.menuImage}
              />
              <div className={styles.menuInfo}>
                <div className={styles.dishName}>{dish.name}</div>
                <div className={styles.price}>
                  ￥{Number(dish.price ?? 0).toLocaleString()}
                  <span className={styles.tax}>（税込み）</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 追加モーダル（UIそのまま） */}
      <EditStoreModal
        open={isEditMenuModalOpen}
        onClose={() => setIsEditMenuModalOpen(false)}
      >
        <EditMenuRegistartionForm
          restaurantId={restaurant.id}
          dish={editingDish}
          isAdding={isAdding}
          // 親で送信（フォーム側が onSubmit を呼べるならこちらが使われる）
          onSubmit={async (payload) => {
            const ok = await createMenu(payload);
            if (ok) setIsEditMenuModalOpen(false);
          }}
          // 互換: フォーム内で送信後に onSuccess が呼ばれる場合も再取得
          onSuccess={async () => {
            await fetchDishes();
            setIsEditMenuModalOpen(false);
          }}
          onCancel={() => setIsEditMenuModalOpen(false)}
        />
      </EditStoreModal>

      {/* 編集モーダル（UIそのまま） */}
      <EditStoreModal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <EditMenuForm
          restaurantId={restaurant.id}
          dish={editingDish}
          isAdding={false}
          onSubmit={async (payload) => {
            if (!editingDish?.id) return;
            const ok = await updateMenu(editingDish.id, payload);
            if (ok) setIsModalOpen(false);
          }}
          onSuccess={async () => {
            await fetchDishes();
            setIsModalOpen(false);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </EditStoreModal>
    </div>
  );
}
