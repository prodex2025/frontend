// ユーザーのログイン画面
// CSSファイルの読み込み
import styles from '../../styles/approvals.module.css';

// コンポーネント読み込み
import ApprovalsButton from '@/components/atoms/approvalsButton';
import ApprovalsInput from '@/components/atoms/approvalsInput';

export default function LoginPage() {
  return (
    <div className={styles.div}>
      <form className={styles.loginForm}>
        <h2 className={styles.h2}>ログイン</h2>
        
        {/* ユーザーID */}
        <ApprovalsInput type="text" name='userId' id='userId' text="ID"/>

        {/* password */}
        <ApprovalsInput type="password" name='password' id='password' text="パスワード"/>

        {/* ログインボタン */}
        <ApprovalsButton type="submit" onClick="handleClick()" text="ログイン"/>
      </form>

      <p>アカウントが未登録ですか？</p>
      <a href={"/"}>アカウント作成</a>
    </div>
  );
}