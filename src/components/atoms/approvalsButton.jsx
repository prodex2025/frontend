// ログイン画面・新規登録画面で使うボタン
// CSSファイルを適応
import styles from '../../styles/approvals.module.css';

// typeと処理は引数で渡す
export default function ApprovalsButton({type,onClick,text, className }){
  return(
    <button type={type} onClick={onClick} className={`${styles.loginBtn} ${className || ''}`}>
      {text}
    </button>
  );
}