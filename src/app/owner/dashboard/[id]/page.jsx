// ユーザーのログイン画面
// CSSファイルの読み込み
import styles from './page.module.css';

export default function LoginPage() {
  return (
    <div>
      <div className={styles.heder}>
        <h1>登録店舗一覧</h1>
        <button type='button' value="店舗追加"></button>
      </div>
    </div>
  );
}
