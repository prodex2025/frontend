// components/atoms/ShopSummary.jsx

/**
 * ShopSummary コンポーネント
 * -----------------------------------
 * 画像 + 店舗情報（名前・住所・カテゴリー）のセットを表示する部品
 * 「画像と店舗情報のセット」をまとめて提供する部品
 * 
 * 【用途】
 * - 他の画面でも「画像付きで店舗の概要を表示したい」時に使う
 * - レイアウトや見た目の調整は呼び出し元の画面で行う想定
 * 
 * 【できること】
 * - 画像と店舗情報をまとめて表示
 * - classNameを渡してレイアウトをカスタマイズ可能
 * 
 * 【使い分け】
 * - 店舗情報だけなら ShopInfo.jsx を使う
 * - 画像と情報のセットで表示したい時はこちらを使う
 * 
 * データの取得や加工はこの部品では行わない
 *   → 表示する内容（props）は呼び出し元が用意する
 *   → 表示ロジックとデータロジックを分離するため
 */

import ShopInfo from './ShopInfo.jsx';


export default function ShopSummary({ shop, className = '' }) {
  return (
    <div className={`${styles.shopSummary} ${className}`}>
      <img src={shop.imageUrl} alt={shop.name} className={styles.shopImage} />
      <ShopInfo
        name={shop.name}
        address={shop.address}
        categories={shop.categories}
      />
    </div>
  );
}
