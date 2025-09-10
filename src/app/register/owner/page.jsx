//　経営者側の新規登録画面
// CSSファイルの読み込み
'use client';

import { useRouter } from 'next/navigation'; 
import React , { useState }from 'react';
import styles from '@/styles/approvals.module.css';

// コンポーネント読み込み
import ApprovalsButton from '@/components/atoms/approvalsButton';
import ApprovalsInput from '@/components/atoms/ApprovalsInput';
import ConfirmModal from '@/components/atoms/ConfirmModal'; //確認モーダル用

export default function LoginPage() {
  const router = useRouter();

  // 入力状態を管理
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // 戻るボタンのクリック時に前のページへ戻る関数
  const handleBack = () => {
    router.push('/login/owner'); // 1つ前のページに戻る
    console.log("戻るボタン");
  };
  
  // 登録ボタンを押したらモーダルを表示
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };
  
  // モーダルで「OK」押したときの登録処理
  const handleConfirm = () => {
    setShowModal(false);
    console.log('登録ボタン', { userId, password });
    // API呼び出しなど行う
  
    // ▼ 登録完了したらログイン画面へ戻る
    router.push('/login/owner');
  };

 
  // 登録ボタン
  // function rigister(){
  //   console.log("登録ボタン");
  // }

  return (
    <>
    <div className={styles.div}>
      <button className={styles.backbutton} onClick={handleBack}>←</button>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <h2 className={styles.h2}>経営者新規アカウント登録</h2>
        
        {/* ユーザー氏名 */}
        <ApprovalsInput type="text" name='name' id='name' text="ユーザー氏名"
          value={name}
          onChange={(e) => setName(e.target.value)}/>

        {/* ユーザーID */}
        <ApprovalsInput type="text" name='userId' id='userId' text="ID(半角英数字のみ)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}/>

        {/* password */}
        <ApprovalsInput type="password" name='password' id='password' text="パスワード(半角英数字のみ)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}/>

        {/* 登録ボタン */}
        <ApprovalsButton type="submit" text="登録"/>
      </form>
    </div>

    {/* モーダルはここ。画面全体の上に表示されるように親divの外 */}
    {showModal && (
      <ConfirmModal
        fields={[
          { label: 'ユーザ氏名', value: name },
          { label: 'ID(半角英数字のみ)', value: userId },
          { label: 'パスワード(半角英数字のみ)', value: password },
        ]}
        onConfirm={handleConfirm}
        onCancel={() => setShowModal(false)}
      />
    )}
    </>
  );
}