//　経営者側の新規登録画面
// CSSファイルの読み込み
'use client';

import { useRouter } from 'next/navigation'; 
import React from 'react';
import styles from '@/styles/approvals.module.css';

// コンポーネント読み込み
import ApprovalsButton from '@/components/atoms/approvalsButton';
import ApprovalsInput from '@/components/atoms/ApprovalsInput';

export default function LoginPage() {
  const router = useRouter();
  // 戻るボタンのクリック時に前のページへ戻る関数
   const handleBack = () => {
    router.push('/login/owner'); 
    console.log("戻るボタン");
  };
  
  // 登録ボタン
  function rigister(){
    console.log("登録ボタン");
  }
  return (
    <div className={styles.div}>
      <button className={styles.backbutton} onClick={handleBack}>←</button>
      <form className={styles.loginForm}>
        <h2 className={styles.h2}>経営者新規アカウント登録</h2>
        
        {/* ユーザー氏名 */}
        <ApprovalsInput type="text" name='name' id='name' text="ユーザ氏名"/>

        {/* ユーザーID */}
        <ApprovalsInput type="text" name='userId' id='userId' text="ID(半角英数字のみ)"/>

        {/* password */}
        <ApprovalsInput type="password" name='password' id='password' text="パスワード(半角英数字のみ)"/>

        {/* 登録ボタン */}
        <ApprovalsButton type="submit" onClick={handleBack} text="登録"/>
      </form>
    </div>
  );
}