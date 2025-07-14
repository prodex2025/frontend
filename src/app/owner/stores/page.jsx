'use client';

// 経営者のトップ画面
// CSSのインポート
import styles from '@/styles/owner.module.css';

// ルーティング操作を行うためのフック
import { useRouter } from 'next/navigation';

// 仮データの呼び出し
import {restaurants, reataurants_categories, categories} from '@/data/mockData';

export default function Owner(){

  const router = useRouter();

  // 店舗の新規登録画面への遷移処理
  function move(){
    console.log("新規登録画面に移動します。");
    router.push('/owner/stores/register');
  }

  return (
    <div className={styles.content}>
      <div className={styles.heder}>
        <h1>登録店舗一覧</h1>
        <button type='button' onClick={move}>店舗追加</button>
      </div>
      <div>
        {restaurants.map((restaurant) => (
          <StoreList key={restaurant.id} img={restaurant.img_url} name={restaurant.name} address={restaurant.address}  />
        ))}
      </div>
    </div>
  );
}

function StoreList({img, name, address}){
  return (
    <div className={styles.storeContent}>
      <div>
        <img src={img} alt="店舗の画像" />
      </div>
      <div className={styles.content}>
        <h1>{name}</h1>
        <p>{address}</p>
      </div>
    </div>
  );
}