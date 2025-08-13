// 編集画面のボタン
// CSSファイルを適応
import styles from '@/styles/StoreDetailPage.module.css';

// 処理は引数で渡す
export default function EditButton({ onClick }){
  return(
    <button type='button' className={styles.editBtn} onClick={onClick}>
      <span className={`material-symbols-outlined ${styles.edit_square}`}>edit_square</span>
    </button>
  );
}