// components/atoms/ShopCard.jsx

'use client'; // クライアントコンポーネント

import Link from 'next/link';
import styles from '@/styles/storeList.module.css';
import ShopInfo from '@/components/atoms/ShopInfo'; // 店舗情報

/**
 * ShopCard コンポーネント
 * ----------------------------
 * 店舗一覧画面専用のカード部品
 *
 * 【役割】
 * - 店舗画像＋店舗情報（ShopInfo）を横並びで表示
 * 
 * （例）遷移後のファイルをapp/shops/[id]/page.jsxに作った場合
 * [id]フォルダーはURLのパラメータ（店舗ID）を受け取るために必須
 * - 画像クリックすると `/shops/◯` に遷移（店舗IDごとの詳細ページ）パスは仮でいれてるよ
 *　　 例: /shops/1 の「1」がここでいう id にあたる

 * 【注意】
 * - 他の画面で使うと「店舗一覧」の見た目になるので注意
 */

export default function ShopCard({ shop, url }) {
  return (
    <Link href={`${url}${shop.id}`} className={styles.shopCardLink}>   
      <div className={styles.shopCard}>
        <img
          src={shop.imageUrl}
          className={styles.shopImage}
          alt={shop.name}
        />
        <div className={styles.shopInfo}>
          <div className={styles.shopInfoPanel}>
            <ShopInfo
              name={shop.name}
              address={shop.address}
              categories={shop.categories}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
