// 管理者のログイン画面
// CSSファイルの読み込み
import styles from '@/styles/approvals.module.css';

// コンポーネント読み込み
import ApprovalsButton from '@/components/atoms/ApprovalsButton';
import ApprovalsInput from '@/components/atoms/ApprovalsInput';

export default function LoginPage() {

  //ログインボタンを押したときの処理
  function login(){
    console.log("ログインボタンが押されました。");
  }

  return (
    <div className={styles.div}>
      <form className={styles.loginForm}>
        <h2 className={styles.h2}>ログイン</h2>
        
        {/* ユーザーID */}
        <ApprovalsInput type="text" name='userId' id='userId' text="ID"/>

        {/* password */}
        <ApprovalsInput type="password" name='password' id='password' text="パスワード"/>

        {/* ログインボタン */}
        <ApprovalsButton type="submit" onClick={login()} text="ログイン"/>
      </form>

      <p>アカウントが未登録ですか？</p>
      <a href={"/register/admin"}>アカウント作成</a>
    </div>
  );
}