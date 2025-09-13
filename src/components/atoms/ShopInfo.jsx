// components/atoms/ShopInfo.jsx

/**
 * 店舗の文字情報だけを表示するシンプルな部品
 * 店舗名、住所、カテゴリー
 */

export default function ShopInfo({
  name = "",
  address = "",
  categories = [],
}) {
  // categories が ["和食","洋食"] でも [{id,name}, ...] でもOKにする
  const categoryNames = Array.isArray(categories)
    ? categories
        .map((c) => (typeof c === "string" ? c : c?.name))
        .filter(Boolean)
    : [];

  // 重複除去（必要なければ外してOK）
  const uniqueNames = [...new Set(categoryNames)];

  const categoriesText = uniqueNames.length
    ? uniqueNames.join(" / ")
    : "カテゴリなし";

  return (
    <>
      <h3>{name}</h3>
      <p>{address}</p>
      <p>{categoriesText}</p>
    </>
  );
}
