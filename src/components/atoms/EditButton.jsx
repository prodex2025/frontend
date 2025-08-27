// 編集画面のボタン
// CSSファイルを適応
import styles from '@/styles/StoreDetailPage.module.css';

import { useState } from "react";

// 処理は引数で渡す
export default function EditButton({ onClick, className = '', icon = 'edit_square' }){
  const [isEditing, setIsEditing] = useState(false);

  // クリックされたときの処理
  const handleClick = () => {
    if (icon === "edit") {
      // editのときだけ状態切替
      setIsEditing((prev) => !prev);
    }
    if (onClick) onClick();
  };

  return(
    <button type='button'
    className={`${className} ${isEditing && icon === "edit" ? "editing" : ""}`}
    onClick={handleClick}
    >
      <span className={`material-symbols-outlined ${styles.edit_square}`}>{icon}</span>
    </button>
  );
}