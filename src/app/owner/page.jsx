// 経営者のトップ画面
// CSSのインポート
import styles from '@/styles/owner.module.css';

export default function Owner(){
  // 仮店舗データ
  const store = [
    [[1],['@/image/store.jpg'],['松本'],['兵庫県神戸市兵庫区松本通']],
    [[2],['@/image/store.jpg'],['広島'],['広島県広島市中区昭和町']],
    [[3],['@/image/store.jpg'],['三田'],['兵庫県三田市西山']],
  ];

  // 中間テーブル（仮）
  const restaurantCategory = [
    [[1], [1], [2]]
    [[2], [3], [1]]
    [[3], [2], [1]]
    [[4], [2], [3]]
    [[5], [1], [3]]
  ];

  // カテゴリ―のデザイン
  const categories = [
    [[1],["肉"]],
    [[2],["魚"]],
    [[3],["うどん"]],
  ];

  return (
    <div className={styles.content}>
      <div className={styles.heder}>
        <h1>登録店舗一覧</h1>
        <button type='button'>店舗追加</button>
      </div>
      <div>
        {

        }
      </div>
    </div>
  );
}

function StoreList(img, name, address, categorize){
  return (
    <div>
      <div>
        <img src={img} alt="店舗の画像" />
      </div>
      <div className={styles.content}>
        <h1>{name}</h1>
        <p>{address}</p>
        {
          categorize.items.map((item) => (
            <p>{item}</p>
          ))
        }
      </div>
    </div>
  );
}