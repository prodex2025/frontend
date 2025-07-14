// components/atoms/ShopInfo.jsx


/**
 * 店舗の文字情報だけを表示するシンプルな部品
 * 店舗名、住所、カテゴリー
 * 中の情報を表示するだけ
 */

export default function ShopInfo({ name, address, categories, className = '' }) {
  return (
    <>
      <h3>{name}</h3>
      <p>{address}</p>
      <p>{categories.join(' / ')}</p>
    </>
  );
}