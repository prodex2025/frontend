// 管理者ホーム画面
'use client'; // ← クライアントコンポーネントであることを明示（Next.js）

// useStateを使うために読み込み
import { useState } from 'react';
// このページ専用のCSSファイルの読み込み
import styles from '@/styles/adminhome.module.css';

//コンポーネントのインポート
import CategoryTag from '@/components/atoms/CategoryTag.jsx';       // カテゴリー用の再利用コンポーネント

// 仮のデータセットをインポート（店舗・カテゴリ・関連テーブル）
import { restaurants, categories, reataurants_categories } from '@/data/mockData';


export default function Adminhome() {
  //店舗検索用
  const [searchText, setSearchText] = useState('');

  // カテゴリー編集モーダル表示ステータス
  const [isModalopen,setModalOpen] = useState(false);

  // カテゴリー追加用
  const[categoriesText,setCategoriesText] = useState('');

  // 現在選択されているカテゴリー名の集合（Setで重複なく管理）
  const [selected, setSelected] = useState(new Set());

  // setSelectedKindは、状態 （selectedKind） を変更する関数
  const [selectedKind, setSelectedKind] = useState('承認済み');
  
  
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
                  // selected={selected.has(category.name)}    // 選択状態を判定
                  // onClick={() => toggleCategory(category.name)}    // クリック時の処理
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
            <option className={styles.kindItem} value="未公開">未公開</option>
          </select>
        </form>

        {/* 表を表示するエリア */}
        <div className={styles.tablearea}>
          {/* 承認済み店舗一覧を表示 */}
          {selectedKind === "承認済み" &&(
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
                {restaurants
                .filter(r => r.approved) // 承認済みだけ抽出
                .map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{/* 申請者名データが無いため空欄 */}</td>
                    <td>{r.isPublished ? '公開済み' : '非公開'}</td>
                    <td>
                      {/* 承認されている場合は承認日（approvalDate）を表示・承認されていない場合は申請日（applicationData）を表示 */}
                      {r.approved
                        ? new Date(r.approvalDate).toLocaleDateString('ja-JP',{
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                        : r.applicationData
                          ? new Date(r.applicationData).toLocaleDateString('ja-JP',{
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                          : 'ー'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 未承認一覧を表示 */}
          {selectedKind === "未承認" &&(
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
                {restaurants
                .filter(r =>!r.approved) // 未承認だけ抽出
                .map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{/* 申請者名データが無いため空欄 */}</td>
                    <td>{r.isPublished ? '公開済み' : '非公開'}</td>
                    <td>
                      {/* 承認されている場合は承認日（approvalDate）を表示・承認されていない場合は申請日（applicationData）を表示 */}
                      {r.approved
                        ? new Date(r.approvalDate).toLocaleDateString('ja-JP',{
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                        : r.applicationData
                          ? new Date(r.applicationData).toLocaleDateString('ja-JP',{
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                          : 'ー'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 公開済み一覧を表示 */}
          {selectedKind === "公開済み" &&(
            <p>test</p>
          )}

          {/* 未公開一覧を表示 */}
          {selectedKind === "未公開" &&(
            <p>test2</p>
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
      </div>
    </div>
  );
}
