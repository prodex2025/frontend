// 管理者ホーム画面
'use client'; // ← クライアントコンポーネントであることを明示（Next.js）
// useStateを使うために読み込み
import { useState } from 'react';
// CSSファイルの読み込み
import styles from '@/styles/adminhome.module.css';

export default function Adminhome() {
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
      <header className={styles.header}>
        <h1>headerが表示される</h1>
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
