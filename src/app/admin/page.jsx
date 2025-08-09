// 管理者ホーム画面
'use client'; // ← クライアントコンポーネントであることを明示（Next.js）

// useStateを使うために読み込み
import { useState } from 'react';
// このページ専用のCSSファイルの読み込み
import styles from '@/styles/adminhome.module.css';

//コンポーネントのインポート
import CategoryTag from '@/components/atoms/CategoryTag.jsx';       // カテゴリー用の再利用コンポーネント

// 仮のデータセットをインポート（店舗・カテゴリ・関連テーブル）
import { restaurants, categories, reataurants_categories } from '@/data/mockData';


export default function Adminhome() {
  //店舗検索用
  const [searchText, setSearchText] = useState('');

  // 現在選択されているカテゴリー名の集合（Setで重複なく管理）
  const [selected, setSelected] = useState(new Set());

  // setSelectedKindは、状態 （selectedKind） を変更する関数
  const [selectedKind, setSelectedKind] = useState('承認済み');
  
  // 表のデモデータ
  const data = {
    承認済み: [
      ["サンプル1", "データ1", "項目1", "情報1"],
      ["サンプル2", "データ2", "項目2", "情報2"],
    ],
    未承認: [
      ["未サンプル1", "未データ1", "", "未情報1"],
      ["未サンプル2", "未データ2", "", "未情報2"],
    ],
    公開済み: [
      ["公開1", "データ公開1", "項目公開1", "情報公開1"],
    ],
    未公開: [
      ["未公開1", "データ未1", "項目未1", "情報未1"],
    ]
  };

  return (
    <div className={styles.container}>
      {/* 検索バーとカテゴリー */}
      <header className={styles.fixdHeader}>
        {/* 検索バー */}
        <div className={styles.searchBar}>
          <div className={styles.searchWrapper}>
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="店名で検索" value={searchText} onChange={(e) => setSearchText(e.target.value)}/>
          </div>
        </div>

        {/* カテゴリータグ + 横スクロール矢印 */}
        <div className={styles.filterScrollWrapper}>
          {/* ← 左矢印（アイコンを左右反転） */}
          <span className={`material-symbols-outlined ${styles.scrollIcon} ${styles.left}`}>
            expand_circle_right
          </span>

          {/* 横スクロール領域 */}
          <div className={styles.filterScroll}>
            <div className={styles.filterButtons}>
              {/* 全カテゴリをタグとして表示 */}
              {categories.map((category) => (
                <CategoryTag
                  key={category.id}    // React のキー
                  label={category.name}    // 表示名
                  // selected={selected.has(category.name)}    // 選択状態を判定
                  // onClick={() => toggleCategory(category.name)}    // クリック時の処理
                  className={styles.filterButton}                  // スタイル指定
                />
              ))}
            </div>
          </div>

          {/* → 右矢印 */}
          <span className={`material-symbols-outlined ${styles.scrollIcon}`}>
            expand_circle_right
          </span>
        </div>
      </header>

      <div className={styles.main}>
        {/* 表示種類セレクトボックス */}
        <form action="" className={styles.form}>
          <select
            className={styles.kindselect} 
            name="kind"
            value={selectedKind}
            onChange={(e) => setSelectedKind(e.target.value)} // <select> 要素で使える「変更時に実行する関数」の指定
          >
            <option className={styles.kindItem} value="承認済み">承認済み</option>
            <option className={styles.kindItem} value="未承認">未承認</option>
            <option className={styles.kindItem} value="公開済み">公開済み</option>
            <option className={styles.kindItem} value="未公開">未公開</option>
          </select>
        </form>

        {/* 店舗一覧の表(承認済み・未承認) */}
        <table className={styles.storeRequestList}>
          <thead>
            <tr>
              <th>店舗名</th>
              <th>申請者名</th>
              <th>店舗ページ公開ステータス</th>
              <th>承認日</th>
            </tr>
          </thead>
          <tbody>
            {/* 配列の中のデータを表で表示 */}
            {(data[selectedKind] || []).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex}>{cell ? cell : "ー"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        
      </div>
    </div>
  );
}
