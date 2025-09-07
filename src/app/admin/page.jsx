// 管理者ホーム画面
'use client'; // ← クライアントコンポーネントであることを明示（Next.js）

// useStateを使うために読み込み
import { useState,useEffect } from 'react';

// UseRouter使うために読み込み(ページ遷移に使うフック)
import { useRouter } from 'next/navigation';

// このページ専用のCSSファイルの読み込み
import styles from '@/styles/adminhome.module.css';

// コンポーネントの読み込み
import ShopTable from "@/components/atoms/admin-shopTable";
import ShopCards from "@/components/atoms/admin-shopCards";


export default function Adminhome() {
  // ルーターのインスタンスを取得
  const router = useRouter();

  //  ローディング状態のステータスを追加
  const [loading, setLoading] = useState(true); //  ローディング状態を追加
  
  // 現在選択されているカテゴリ名の集合
  const [selectedCategories,setSelectedCategories] = useState(new Set());
  // 検索バーに入力されたテキスト
  const [searchText, setSearchText] = useState('');
  const [shops,setShops] = useState([]);

  // usersデータをapiファイルから取得
  const [users, setUsers] = useState([]);

  // categoriesデータをapiファイルから取得
  const [categories,setCategories] = useState([]);
  
  // restaurantsCategoriesデータをapiファイルから取得
  const [restaurantsCategories, setRestaurantsCategories] = useState([]);

  // カテゴリー編集モーダル表示ステータス
  const [isModalopen,setModalOpen] = useState(false);

  // カテゴリー追加用
  const[categoriesText,setCategoriesText] = useState('');

  // setSelectedKindは、状態 （selectedKind） を変更する関数
  const [selectedKind, setSelectedKind] = useState('承認済み');

  // 公開・非公開storedetail表示切替用
  const [openId,setOpenId] = useState(null);

  // 非公開確認モーダル
  const [privateModal, setPrivateModal] = useState(false);
  
  // 公開確認モーダル
  const [publicModal, setPublicModal] = useState(false);

  // ＝＝＝＝＝＝＝＝＝＝関数＝＝＝＝＝＝＝＝＝＝＝
  // 初回マウントでそれぞれの店舗情報に対応するカテゴリ項目を配列で追加
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchText) params.set("search" , searchText);
    if (selectedCategories.size > 0) {
      params.set("categories",Array.from(selectedCategories).join(","));
    }

    setLoading(true); // ← 取得開始時に true にする
    fetch(`/api/admin/stores?${params.toString()}`)
    .then((res) => res.json())
    .then((data) => {
      setShops(data.shops);    // フィルタ済みの店舗データを取得
      setUsers(data.users);    // usersデータを取得
      setCategories(data.categories);  // categoriesデータを取得
      setRestaurantsCategories(data.restaurants_categories);    // restaurants_categoriesデータを取得
      setLoading(false); // ← 取得完了で false に
    })
    .catch((err) => {console.error("取得失敗",err);setLoading(false);}); // エラー時も false に
    },[searchText,selectedCategories]);

  // カテゴリ選択・解除
  const toggleCategory = (name) =>{
    const updated = new Set(selectedCategories);
    if(updated.has(name)){
      updated.delete(name); //選択時は解除
    }
    else{
      updated.add(name); //選択
    }
    setSelectedCategories(updated);
  };

  // storedetailの表示を切り替えている店舗を探す
  const openShop = shops.find(r => r.id === openId);

  return (
    <div className={styles.container}>
      {/* 検索バーとカテゴリー */}
      <header className={styles.fixdHeader}>
        {/* 検索とカテゴリーボタンが入るコンテナ */}
        <div className={styles.Barcontainer}>
          {/* 検索バー */}
          <div className={styles.searchBar}>
            <div className={styles.searchWrapper}>
              <span className="material-symbols-outlined">search</span>
              <input type="text" placeholder="店名で検索" value={searchText} onChange={(e) => setSearchText(e.target.value)}/>
            </div>
          </div>

          {/* カテゴリー編集ボタン */}
          <button
            className={styles.categoriesButton}
            onClick={() => setModalOpen(true)}  // クリックでモーダル表示ON
          >
            カテゴリー
          </button>
        </div>

        {/* カテゴリータグ + 横スクロール矢印 */}
        <div className={styles.filterScrollWrapper}>
          {/* ← 左矢印（アイコンを左右反転） */}
          <span className={`material-symbols-outlined ${styles.scrollIcon} ${styles.left}`}>
            expand_circle_right
          </span>

          {/* 横スクロール領域 */}
          <div className={styles.filterScroll}>
            <div className={styles.filterButtons}>
              {/* 全カテゴリをタグとして表示 */}
              {categories.map((category) => (
                <button
                  key={category.id}    // React のキー
                  onClick={() => toggleCategory(category.name)}
                  className={`${styles.filterButton} ${selectedCategories.has(category.name) ? styles.active : ''}`}                  // スタイル指定
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* → 右矢印 */}
          <span className={`material-symbols-outlined ${styles.scrollIcon}`}>
            expand_circle_right
          </span>
        </div>
      </header>

      {/* メインのコンテンツを表示するエリア */}
      <div className={styles.main}>
        {/* 表示種類セレクトボックス */}
        <form action="" className={styles.form}>
          <select
            className={styles.kindselect} 
            name="kind"
            value={selectedKind}
            onChange={(e) => setSelectedKind(e.target.value)} // <select> 要素で使える「変更時に実行する関数」の指定
          >
            <option className={styles.kindItem} value="承認済み">承認済み</option>
            <option className={styles.kindItem} value="未承認">未承認</option>
            <option className={styles.kindItem} value="公開済み">公開済み</option>
            <option className={styles.kindItem} value="非公開">非公開</option>
          </select>
        </form>

        {/* 表を表示するエリア */}
        <div className={styles.tablearea}>
          {loading ? (
            <p className={styles.nothing}>読み込み中です…</p>
          ) : (
            <>
            {selectedKind === "承認済み" && (
              <ShopTable shops={shops.filter((r) => r.approved)} users={users} router={router} />
            )}

            {selectedKind === "未承認" && (
              <ShopTable shops={shops.filter((r) => !r.approved)} users={users} router={router} />
            )} 

            {selectedKind === "公開済み" && (
              <ShopCards
                shops={shops.filter((r) => r.isPublished)}
                categories={categories}
                restaurants_categories={restaurantsCategories}
                router={router}
                openId={openId}
                setOpenId={setOpenId}
                setPrivateModal={setPrivateModal}
              />
            )}

            {selectedKind === "非公開" && (
              <ShopCards
                shops={shops.filter((r) => !r.isPublished)}
                categories={categories}
                restaurants_categories={restaurantsCategories}
                router={router}
                openId={openId}
                setOpenId={setOpenId}
                setPrivateModal={setPrivateModal}
              />
            )}
            </>
          )}
        </div>

        {/* カテゴリー編集モーダル */}
        {isModalopen === true &&(
          // モーダルの背景
          <div className={styles.BackcategoriesModal} onClick={() => setModalOpen(false)}>
            {/* モーダル本体 */}
            <div className={styles.categoriesModal} onClick={e => e.stopPropagation()}>
              {/* モーダル内ヘッダー */}
              <header className={styles.modalheader}>
                <div className={styles.deleteicon}>
                  <span className="material-symbols-outlined">delete</span>
                </div>
                <p className={styles.title}>カテゴリー</p>
                <button className={styles.closebutton} onClick={() => setModalOpen(false)}>✖</button>
              </header>
              {/* カテゴリー追加テキストボックス */}
              <div className={styles.addcategories}>
                <input className={styles.addtextbox} type="text" placeholder='追加したいカテゴリー名' value={categoriesText} onChange={(e) => setCategoriesText(e.target.value)} />
                <button className={styles.addbutton}>追加</button>
              </div>
              {/* すべてのカテゴリーを表示 */}
              <div className={styles.allcategories}>
                {categories.map((category)=>(
                  <label
                    key={category.id}
                    className={
                      category.name.length < 6
                      ?styles.largeFont
                      :styles.smallFont
                    }
                  >
                    {category.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}


        {/* 公開確認モーダル */}
        {publicModal === true &&(
          <div className={styles.BackpublicModal}  onClick={() => setPublicModal(false)}>
            <div className={styles.publicModal}>
              <p className={styles.choicestore}>{openShop ? openShop.name : "Noname"} を<strong>公開</strong>しますか</p>
              <div className={styles.controlbutton}>
                <p className={`${styles.public} ${styles.OK}`}>OK</p>
                <p className={styles.public} onClick={() => setPublicModal(false)}>キャンセル</p>
              </div>
            </div>
          </div>
        )}

        {/* 非公開確認モーダル */}
        {privateModal === true &&(
          <div className={styles.BackpublicModal}  onClick={() => setPrivateModal(false)}>
            <div className={styles.publicModal}>
              <p className={styles.choicestore}>{openShop ? openShop.name : "Noname"} を<strong>非公開</strong>にしますか</p>
              <div className={styles.controlbutton}>
                <p className={`${styles.public} ${styles.OK}`}>OK</p>
                <p className={styles.public} onClick={() => setPrivateModal(false)}>キャンセル</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
