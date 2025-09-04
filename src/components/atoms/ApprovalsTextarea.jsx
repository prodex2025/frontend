// ログイン画面・新規登録画面で使うテキストエリア
// CSSファイルを適応
import styles from '@/styles/approvals.module.css';

// 名前・IDは引数で渡す
export default function ApprovalsTextarea({name,id,text}){
  return(
    <div className={styles.inputContent}>
      <textarea className={styles.content} name={name} id={id}></textarea>
      <label htmlFor={id}>{text}</label>
    </div>
  );
}