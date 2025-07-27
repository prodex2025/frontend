'use client';

import clsx from 'clsx';
import styles from '@/styles/storeList.module.css';

/**
 * CategoryTagコンポーネント
 * 
 * 【使い方】
 * - label: タグに表示する文字列
 * - selected: 選択状態（trueなら黄色背景など強調表示）
 * - onClick: クリック時の処理（クリックで色を変えたい場合に渡す）
 * - className: 外部から追加のCSSクラスを渡せます（見た目の微調整用）
 * 
 * 【ポイント】
 * - このコンポーネントは「形（丸みやサイズ、構造）」を統一しているだけで、
 *   色や挙動は外側から制御可能です。
 * - クリック処理が不要な別画面では onClick を渡さず、
 *   selected を true にするだけで初めから強調表示（黄色タグ）になります。
 * - 色やスタイルを変えたい場合は、外側のCSSやclassNameで調整してください。
 * 
 * 例）
 * ↓クリック無効で初めから黄色の「選択済み」タグとして使う例↓
 * <CategoryTag
    label="イタリアン"
    selected={true}  // 黄色の選択状態を強制表示
    className={styles.filterButton}
　　/>
 */
export default function CategoryTag({ label, selected = false, onClick, className }) {
  return (
    <button
      className={clsx(
        styles.filterButton,              // ← 基本スタイル（カプセル型）
        {
          [styles.selected]: selected,   // ← 選択状態（黄色）
          [styles.clickable]: !!onClick, // ← クリック可能なとき
        },
        className                         // ← 外から渡された追加クラス
      )}
      onClick={onClick}
      type="button"
      disabled={!onClick} // クリック不要ならボタン無効化も可能
    >
      {label}
    </button>
  );
}
