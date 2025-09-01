// 管理者ホーム画面
'use client'; // ← クライアントコンポーネントであることを明示（Next.js）

// useStateを使うために読み込み
import { useState,useEffect } from 'react';

// UseRouter使うために読み込み(ページ遷移に使うフック)
import { useRouter } from 'next/navigation';

// このページ専用のCSSファイルの読み込み
import styles from '@/styles/adminhome.module.css';

//コンポーネントのインポート
import CategoryTag from '@/components/atoms/CategoryTag.jsx';       // カテゴリー用の再利用コンポーネント

// 仮のデータセットをインポート（店舗・カテゴリ・店舗ごとのカテゴリーテーブル）
import { restaurants, categories, reataurants_categories ,users} from '@/data/mockData';
import { style } from '@mui/system';


export default function Adminhome() {
  // ルーターのインスタンスを取得
  const router = useRouter();

  //店舗検索用
  const [searchText, setSearchText] = useState('');
  // 検索結果絞り込まれたデータを保存
  const [filteredShops, setFilteredShops] = useState(restaurants);

  // カテゴリー編集モーダル表示ステータス
  const [isModalopen,setModalOpen] = useState(false);

  // カテゴリー追加用
  const[categoriesText,setCategoriesText] = useState('');

  // 現在選択されているカテゴリー名の集合（Setで重複なく管理）
  const [selected, setSelected] = useState(new Set());

  // setSelectedKindは、状態 （selectedKind） を変更する関数
  const [selectedKind, setSelectedKind] = useState('承認済み');

  // 公開・非公開storedetail表示切替用
  const [openId,setOpenId] = useState(null);

  // 非公開確認モーダル
  const [privateModal, setPrivateModal] = useState(false);
  
  // 公開確認モーダル
  const [publicModal, setPublicModal] = useState(false);

  // storedetailの表示を切り替えている店舗を探す
  const openShop = filteredShops.find(r => r.id === openId);

  // ＝＝＝＝＝＝＝＝＝＝関数＝＝＝＝＝＝＝＝＝＝＝
  // 検索バーの処理
  useEffect(() => {
    const filtered = restaurants.filter(r =>
      r.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredShops(filtered);
  },[searchText]);


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
                <CategoryTag
                  key={category.id}    // React のキー
                  label={category.name}    // 表示名
                  //selected={selected.has(category.name)}    // 選択状態を判定
                  //onClick={() => toggleCategory(category.name)}    // クリック時の処理
                  className={styles.filterButton}                  // スタイル指定
                />
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
          {/* 承認済み店舗一覧 */}
          {selectedKind === "承認済み" && (
            filteredShops.length > 0 ? (
            <table className={styles.storeRequestList}>
              <thead>
                <tr>
                  <th>店舗名</th>
                  <th>申請者名</th>
                  <th>店舗ページ公開ステータス</th>
                  <th>承認日</th>
                </tr>
              </thead>
              <tbody>
                {filteredShops
                .filter(r => r.approved) // 承認済みのみ表示
                .map((r) => {
                  // owner_id に一致するユーザーを探す
                  const owner = users.find(u => u.id === r.owner_id);
                  
                  return(
                  <tr
                    key={r.id}
                    className={styles.requeststore}
                    // 行クリックでdetailページに移動し、選択した店舗のidをクエリパラメータとして渡す
                    onClick={() => router.push(`/admin/store-detail?id=${r.id}`)}
                  >
                    <td>{r.name}</td>
                    <td>{owner ? owner.name : "不明"}</td>
                    <td>{r.isPublished ? '公開済み' : '非公開'}</td>
                    <td>
                      {r.approved
                        ? new Date(r.approvalDate).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          })
                        : r.applicationData
                        ? new Date(r.applicationData).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          })
                        : 'ー'}
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          ) : (
            <p className={styles.nothing}>該当する店舗はありません</p>
            )
          )}
          

          {/* 未承認一覧を表示 */}
          {selectedKind === "未承認" && (
            filteredShops.length > 0 ? (
            <table className={styles.storeRequestList}>
              <thead>
                <tr>
                  <th>店舗名</th>
                  <th>申請者名</th>
                  <th>店舗ページ公開ステータス</th>
                  <th>申請日</th>
                </tr>
              </thead>
              <tbody>
                {filteredShops
                .filter(r => !r.approved) // 未承認のみ表示
                .map((r) => {
                  // owner_id に一致するユーザーを探す
                  const owner = users.find(u => u.id === r.owner_id);

                  return(
                  <tr 
                    key={r.id} 
                    className={styles.requeststore}
                    // 行クリックでdetailページに移動し、選択した店舗のidをクエリパラメータとして渡す
                    onClick={() => router.push(`/admin/store-detail?id=${r.id}`)}
                  >
                    <td>{r.name}</td>
                    <td>{owner ? owner.name : "不明"}</td>
                    <td>{r.isPublished ? '公開済み' : '非公開'}</td>
                    <td>
                      {r.approved
                        ? new Date(r.approvalDate).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          })
                        : r.applicationData
                        ? new Date(r.applicationData).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          })
                        : 'ー'}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className={styles.nothing}>該当する店舗はありません</p>
            )
          )}

          {/* 公開済み一覧を表示 */}
          {selectedKind === "公開済み" &&(
            <div className={styles.visibleshops}>
            {filteredShops.length > 0 ? (
                filteredShops
                .filter(r => r.isPublished) // 公開済みのみ表示
                .map((r) => (
                  <div 
                    key={r.id} 
                    className={styles.visibleshop}
                    // 店舗クリックでdetailページに移動し、選択した店舗のidをクエリパラメータとして渡す
                    onClick={() => router.push(`/admin/store-detail?id=${r.id}`)}
                  >
                    {/* 店舗の写真 */}
                    <img
                      src={r.image_url}
                      alt={r.name}
                      className={styles.storephoto}
                    />
                    {/* 店舗の情報（簡易） */}
                    <div className={styles.storedetail + (openId === r.id ? `${styles.open}` : "")}>
                      {openId === r.id ? (
                        // 展開時に見せたい内容
                        <div className={styles.openContent}>
                          <p className={styles.storename}>
                          {/* ９文字以上の店舗名を開業する処理 */}
                            {r.name.length > 8
                              ? (
                                <>
                                  {r.name.slice(0, 8)}<br />
                                  {r.name.slice(8)}
                                </>
                              )
                              : r.name
                            }
                          </p>
                          <p className={styles.privatebutton} onClick={() => setPrivateModal(true)}>非公開にする</p>
                          <a href="" className={styles.smalltext}>この店舗の詳細ページへ</a>
                        </div>
                      ) : (
                        // 閉じているときに見せたい内容
                        <div className={styles.closedContent}>
                          <p className={styles.storename}>
                          {/* ９文字以上の店舗名を開業する処理 */}
                            {r.name.length > 8
                              ? (
                                <>
                                  {r.name.slice(0, 8)}<br />
                                  {r.name.slice(8)}
                                </>
                              )
                              : r.name
                            }
                          </p>
                          <p className={styles.storeadress}>{r.address}</p>
                          {/* 店舗ごとのカテゴリーを表示 */}
                          <p  className={styles.storecategory}>
                            {reataurants_categories
                              .filter(rc => rc.restaurant_id === r.id)
                              .map(rc => categories.find(c => c.id === rc.category_id) ?.name ?? "不明")
                              .join("/")
                            }
                          </p>
                        </div>
                      )}
                      
                      <span
                        className={`material-symbols-outlined ${styles.displaychange}`}
                        onClick={() => setOpenId(openId === r.id ? null : r.id)}
                      >
                      more_vert
                      </span>
                    </div>
                  </div>
                ))
          ) : (
            <p className={styles.nothing}>該当する店舗はありません</p>
            )}
            </div>
          )}

          {/* 非公開一覧を表示 */}
          {selectedKind === "非公開" &&(
            <div className={styles.visibleshops}>
            {filteredShops.length > 0 ? (
                filteredShops
                .filter(r => !r.isPublished) // 公開済みのみ表示
                .map((r) => (
                  <div 
                    key={r.id} 
                    className={styles.visibleshop}
                    // 店舗クリックでdetailページに移動し、選択した店舗のidをクエリパラメータとして渡す
                    onClick={() => router.push(`/admin/store-detail?id=${r.id}`)}
                  >
                    {/* 店舗の写真 */}
                    <img
                      src={r.image_url}
                      alt={r.name}
                      className={styles.storephoto}
                    />
                    {/* 店舗の情報（簡易） */}
                    <div className={styles.storedetail + (openId === r.id ? `${styles.open}` : "")}>
                      {openId === r.id ? (
                        // 展開時に見せたい内容
                        <div className={styles.openContent}>
                          <p className={styles.storename}>
                          {/* ９文字以上の店舗名を開業する処理 */}
                            {r.name.length > 8
                              ? (
                                <>
                                  {r.name.slice(0, 8)}<br />
                                  {r.name.slice(8)}
                                </>
                              )
                              : r.name
                            }
                          </p>
                          <p className={styles.publicbutton} onClick={() => setPublicModal(true)}>公開する</p>
                          <a href="" className={styles.smalltext}>この店舗の詳細ページへ</a>
                        </div>
                      ) : (
                        // 閉じているときに見せたい内容
                        <div className={styles.closedContent}>
                          <p className={styles.storename}>
                          {/* ９文字以上の店舗名を開業する処理 */}
                            {r.name.length > 8
                              ? (
                                <>
                                  {r.name.slice(0, 8)}<br />
                                  {r.name.slice(8)}
                                </>
                              )
                              : r.name
                            }
                          </p>
                          <p className={styles.storeadress}>{r.address}</p>
                          {/* 店舗ごとのカテゴリーを表示 */}
                          <p  className={styles.storecategory}>
                            {reataurants_categories
                              .filter(rc => rc.restaurant_id === r.id)
                              .map(rc => categories.find(c => c.id === rc.category_id) ?.name ?? "不明")
                              .join("/")
                            }
                          </p>
                        </div>
                      )}
                      
                      <span
                        className={`material-symbols-outlined ${styles.displaychange}`}
                        onClick={() => setOpenId(openId === r.id ? null : r.id)}
                      >
                      more_vert
                      </span>
                    </div>
                  </div>
                ))
          ) : (
            <p className={styles.nothing}>該当する店舗はありません</p>
            )}
            </div>
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
