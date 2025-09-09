"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import styles from "@/styles/ThreeViewer.module.css";

import BackButton from "@/components/atoms/BackButton"
import ThreeModelViewer from "@/components/atoms/ThreeModelViewer";


// 数値化のユーティリティ
const toNumOrNull = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const normalizeBase = (folder) => {
  if (!folder) return null;
  let f = String(folder).replace(/\/+$/g, "");
  if (f.startsWith("@/model")) f = f.replace(/^@\/model/, "/model");
  else if (!f.startsWith("/model")) f = `/model/${f}`;
  return `${f}/`;
};

// アレルギーアイコン（/public/image/allergy/{id}.svg → .png の順でフォールバック）
function AllergyBadge({ id, name }) {
  const [src, setSrc] = useState(`/image/allergy/${id}.svg`);
  const [failed, setFailed] = useState(0);

  const onError = () => {
    if (failed === 0) {
      setSrc(`/image/allergy/${id}.png`); // svgが無い時はpngへ
      setFailed(1);
    } else {
      setFailed(2); // それでも失敗したら絵文字にフォールバック
    }
  };

  return (
    <li className={styles.badge} title={name || `ID:${id}`}>
      {failed < 2 ? (
        <img
          className={styles.emoji}
          src={src}
          alt={name || `アレルギー${id}`}
          onError={onError}
        />
      ) : (
        <span className={styles.emoji} aria-label={name || `アレルギー${id}`}>⚠️</span>
      )}
    </li>
  );
}

export default function Page() {
  const params = useParams(); // { id: "123", menuId: "45" }
  const restaurantId = useMemo(() => toNumOrNull(params?.id), [params]);
  const menuId = useMemo(() => toNumOrNull(params?.menuId), [params]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDish, setSelectedDish] = useState(null);
  const [modelReady, setModelReady] = useState(null);

  // アレルギー関連
  const [allergyIds, setAllergyIds] = useState([]);      // number[]
  const [allergyNameById, setAllergyNameById] = useState({}); // { [id]: name }

  // video_url からベースパスを生成
  const modelBase = useMemo(
    () => normalizeBase(selectedDish?.video_url),
    [selectedDish?.video_url]
  );

  // 1) 対象メニュー取得
  useEffect(() => {
    const ac = new AbortController();

    async function run() {
      setLoading(true);
      setError("");
      setSelectedDish(null);

      if (restaurantId == null || menuId == null) {
        setError("URLの店舗IDまたはメニューIDが不正です。");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/dishes", { signal: ac.signal, cache: "no-store" });
        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const all = await res.json(); // 期待: Dishes[]
        if (!Array.isArray(all)) throw new Error("APIレスポンス形式が配列ではありません");

        const byStore = all.filter((d) => d.restaurant_id === restaurantId);
        if (byStore.length === 0) throw new Error(`店舗ID ${restaurantId} のメニューが見つかりませんでした`);

        const found = byStore.find((d) => d.id === menuId) || null;
        if (!found) throw new Error(`店舗ID ${restaurantId} に dishesID ${menuId} は存在しません`);

        setSelectedDish(found);
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message || "データ取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }

    run();
    return () => ac.abort();
  }, [restaurantId, menuId]);

  // 1.5) モデルファイル存在チェック（OBJ/MTL/PNG すべて必須）
  useEffect(() => {
    let aborted = false;
    async function check() {
      // video_url が未設定なら未準備扱い
      if (!modelBase) {
        setModelReady(false);
        return;
      }
      setModelReady(null); // 確認中
      try {
        const [mtl, obj, jpg] = await Promise.all([
          fetch(`${modelBase}3DModel.mtl`, { method: "HEAD", cache: "no-store" }),
          fetch(`${modelBase}3DModel.obj`, { method: "HEAD", cache: "no-store" }),
          fetch(`${modelBase}3DModel.jpg`, { method: "HEAD", cache: "no-store" }),
        ]);
        const ok = mtl.ok && obj.ok && jpg.ok;
        if (!aborted) setModelReady(ok);
      } catch {
        if (!aborted) setModelReady(false);
      }
    }
    check();
    return () => {
      aborted = true;
    };
  }, [modelBase]);

  // 2) 中間テーブルから該当dishのアレルギーID一覧取得
  useEffect(() => {
    const ac = new AbortController();

    async function run() {
      setAllergyIds([]);

      if (menuId == null) return;
      try {
        // APIが ?dishId= を受けられるなら軽量化できる（どちらでも動くようにフォールバック）
        let res = await fetch(`/api/dish_allergies?dishId=${encodeURIComponent(menuId)}`, {
          signal: ac.signal,
          cache: "no-store",
        });
        if (!res.ok) {
          res = await fetch("/api/dish_allergies", { signal: ac.signal, cache: "no-store" });
        }
        if (!res.ok) throw new Error(`dish_allergies API error: ${res.status}`);

        const rows = await res.json();
        if (!Array.isArray(rows)) throw new Error("dish_allergies のレスポンスが配列ではありません");

        const ids = rows
          .filter((r) => r?.dish === menuId)
          .map((r) => r?.allergy)
          .filter((n) => Number.isFinite(n));

        // 重複除去
        setAllergyIds([...new Set(ids)]);
      } catch (e) {
        console.warn(e);
        // 取得失敗しても画面は続行（バッジは — 表示に）
      }
    }

    run();
    return () => ac.abort();
  }, [menuId]);

  // 3) アレルギーマスタ取得（任意・なければ名前なしで表示）
  useEffect(() => {
    const ac = new AbortController();

    async function run() {
      setAllergyNameById({});
      try {
        const res = await fetch("/api/allergies", { signal: ac.signal, cache: "no-store" });
        if (!res.ok) return; 

        const list = await res.json(); // 期待: Allergy[]
        if (!Array.isArray(list)) return;

        const dict = {};
        for (const a of list) {
          if (a && Number.isFinite(a.id)) dict[a.id] = a.name;
        }
        setAllergyNameById(dict);
      } catch {
        // 未実装やエラーはスキップ
      }
    }

    run();
    return () => ac.abort();
  }, []);

  return (
    <div className={styles.wrap}>
      {/* 戻る */}
      <BackButton
          className={styles.backButton}
          role="owner"
          restaurantId={restaurantId}
          fallbackMap={{
          owner: `/owner/dashboard/${restaurantId}`, // 例：メニュー一覧へ
          user:  `/store/list/details/${restaurantId}`
          }}
      />

      {/* 見出し（テキスト長だけの下線はCSSで .title3d） */}
      <div className={styles.titles}>
        <h1 className={styles.title3d}>3D</h1>
      </div>

      {/*  3Dの表示部分 */}
      <div className={styles.bowl}>
        {!selectedDish ? (
          <p className={styles.statusText}>読み込み中...</p>
        ) : modelReady === null ? (
          <p className={styles.statusText}>3Dモデルを確認中...</p>
        ) : modelReady === false ? (
          <p className={styles.statusText}>3Dモデルはまだ準備中です。</p>
        ) : (
          <ThreeModelViewer folder={selectedDish.video_url} />
        )}
      </div>

      {/* 下部バー */}
      <div className={styles.dock}>
        <div className={styles.dockInner}>
          {/* アレルギー */}
          <section className={styles.cell}>
            <h3 className={styles.cellLabel}>アレルギー情報</h3>
            <div className={styles.allergyContetn}>
              <ul className={styles.allergyList}>
                {allergyIds.length > 0 ? (
                  allergyIds.map((id) => (
                    <AllergyBadge key={id} id={id} name={allergyNameById[id]} />
                  ))
                ) : (
                  <li className={styles.cellText}>-</li>
                )}
              </ul>
            </div>
          </section>

          <div className={styles.divider} />

          {/* メニュー名 */}
          <section className={styles.cell}>
            <h3 className={styles.cellLabel}>名前</h3>
            <p className={styles.cellText}>{selectedDish?.name ?? "メニュー名未設定"}</p>
          </section>

          <div className={styles.divider} />

          {/* コメント */}
          <section className={styles.cell}>
            <h3 className={styles.cellLabel}>コメント</h3>
            <p className={styles.cellText}>{selectedDish?.description || "説明は準備中です"}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
