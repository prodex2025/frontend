// ユーザーのログイン画面
// CSSファイルの読み込み
import styles from './page.module.css';

export default function LoginPage() {
  return (
    <div className={styles.div}>
      <form className={styles.loginForm}>
        <h2 className={styles.h2}>ログイン</h2>
        <div className={styles.inputContent}>
          <input className={styles.content} type="text" name='userId' id='userId' placeholder='' required/>
          <label htmlFor='userId'>ID</label>
        </div>
        <div className={styles.inputContent}>
          <input className={styles.content} type="password" name='password' id='password' placeholder='' required/>
          <label htmlFor='password'>パスワード</label>
        </div>
        <LoginBtn/>
      </form>
      <p>アカウントが未登録ですか？</p>
      <a href={"/"}>アカウント作成</a>
    </div>
  );
}

function LoginBtn(){
  return(
    <button type='submit' className={styles.loginBtn}>ログイン</button>
  );
}