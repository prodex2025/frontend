'use client';

// 経営者のログイン画面
// CSSファイルの読み込み
import styles from '@/styles/approvals.module.css';

// コンポーネント読み込み
import ApprovalsButton from '@/components/atoms/approvalsButton';
import ApprovalsInput from '@/components/atoms/ApprovalsInput';

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  // ページ遷移用のフック
  const router = useRouter();

  // 入力値を状態管理
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  //ログインボタンを押したときの処理
  function login(e){
    // ページリロードを防ぐ
    e.preventDefault();

    console.log("ログインボタンが押されました。");
    console.log("入力ID:", userId);
    console.log("入力PW:", password);

    console.log("ログインボタンが押されました。");
    
    // 店舗一覧画面に遷移
    router.push("/owner/stores");
  }

  return (
    <div className={styles.div}>
      <form className={styles.loginForm} onSubmit={login}>
        <h2 className={styles.h2}>ログイン</h2>
        
        {/* ユーザーID */}
        <ApprovalsInput type="text" name='userId' id='userId' text="ID"
        onChange={(e) => setUserId(e.target.value)}/>

        {/* password */}
        <ApprovalsInput type="password" name='password' id='password' text="パスワード"
        onChange={(e) => setPassword(e.target.value)}
        />

        {/* ログインボタン */}
        <ApprovalsButton type="submit" text="ログイン"/>
      </form>

      <p>アカウントが未登録ですか？</p>
      <a href={"/register/owner"}>アカウント作成</a>
    </div>
  );
}