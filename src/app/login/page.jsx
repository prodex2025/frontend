// ユーザーのログイン画面
// CSSファイルの読み込み
import styles from './page.module.css';

export default function LoginPage() {
  return (
    <div className={styles.login}>
      <h2>ログイン</h2>
      <label htmlFor="userId">ユーザーID</label>
      <input className={styles.input} type="text" name='userId' id='userId'/>
      <label htmlFor="password">パスワード</label>
      <input className={styles.input}  type="password" name='password' id='password' />
    </div>
  );
}
