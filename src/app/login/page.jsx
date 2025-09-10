// ユーザーのログイン画面
// CSSファイルの読み込み

'use client';
import { useRouter } from 'next/navigation'; // App Router用のルーター
import styles from '@/styles/approvals.module.css';

// コンポーネント読み込み
import ApprovalsButton from '@/components/atoms/approvalsButton';
import ApprovalsInput from '@/components/atoms/ApprovalsInput';

export default function LoginPage() {
  const router = useRouter();

  //ログインボタンを押したときの処理
  function login(e){
    e.preventDefault(); // ページリロード防止
    console.log("ログインボタンが押されました。");

    // 認証処理がここに入る（API呼び出しなど）

    // 認証後に遷移（店舗一覧画面へ）
    router.push('/store/list');
  }

  return (
    <div className={styles.div}>
      <form className={styles.loginForm} onSubmit={login}>
        <h2 className={styles.h2}>ログイン</h2>
        
        {/* ユーザーID */}
        <ApprovalsInput type="text" name='userId' id='userId' text="ID"/>

        {/* password */}
        <ApprovalsInput type="password" name='password' id='password' text="パスワード"/>

        {/* ログインボタン */}
        <ApprovalsButton type="submit" text="ログイン"/>
      </form>

      <p>アカウントが未登録ですか？</p>
      <a href={"/register"}>アカウント作成</a>
    </div>
  );
}