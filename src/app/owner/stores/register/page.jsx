'use client';

import styles from '@/styles/ownerRegister.module.css';

// コンポーネントのインポート
import ApprovalsButton from '@/components/atoms/ApprovalsButton';
import ApprovalsInput from '@/components/atoms/ApprovalsInput';
import ApprovalsTextarea from '@/components/atoms/ApprovalsTextarea';
import ApprovalsImg from '@/components/atoms/ApprovalsImg';
import BusinessHours from '@/components/Molecules/BusinessHours';

export default function LoginPage() {

  function rigister() {
    console.log("登録ボタンが押されました。");
  }

  return (
    <div className={styles.div}>
      <h2 className={styles.h2}>新規店舗登録</h2>
      <form className={styles.Form}>
        <div className={styles.leftContent}>
          <ApprovalsInput type="text" name="name" id="name" text="店舗名" />
          <ApprovalsImg name="interiorImg" id="interiorImg" text="店内の写真"/>
          <ApprovalsImg name="outsideImg" id="outsideImg" text="店外の写真"/>
          <ApprovalsInput type="text" name="postcode" id="postcode" text="郵便番号（ハイフンなし）" maxLength={7}/>
          <ApprovalsInput type="text" name="address1" id="address1" text="市区町村"/>
          <ApprovalsInput type="text" name="address2" id="address2" text="それ以降の住所"/>
          <ApprovalsInput type="text" name="phone" id="phone" text="電話番号"/>
          <ApprovalsInput type="text" name="email" id="email" text="メールアドレス"/>
          <ApprovalsTextarea name="descrption" id="descrption" text="店舗のメモ"/>
        </div>
        <div className={styles.rightContent}>
          <ApprovalsInput type="file" name="outsideImg" id="outsideImg" accept="image/*" text="飲食店営業許可証"/>
          <small>
            飲食店営業許可証とは、保健所が発行する飲食店の営業を許可する証明書です。<br />
            サービスのご利用にあたり、食品衛生法に基づく有効な「飲食店営業許可証（写し）」のご提出をお願いしております。<br />
            アップロードする際は、許可番号や有効期限、営業者名がはっきりと確認できるよう撮影した画像をご準備ください。
          </small>
          <BusinessHours/>
        </div>
      </form>
      <ApprovalsButton type="submit" onClick={rigister} text="登録" />
    </div>
  );
}