//店舗詳細画面
'use client';

import styles from '@/styles/StoreDetailPage.module.css';
import adminStyles from '@/styles/adminStoredetail.module.css';


import { useState } from 'react';     //タブ切り替え、状態保存用
import { useParams, useSearchParams, useRouter  } from 'next/navigation';  //URLパラメータを取得するためのフック
import { restaurants, reataurants_categories, categories,users ,restaurants_business_calendar} from '@/data/mockData'; //データインポート

import ShopInfo from '@/components/atoms/ShopInfo';        // 店舗情報を表示するためのコンポーネント
import CategoryTag from '@/components/atoms/CategoryTag'; // カテゴリータグコンポーネント
import StoreDetailTab from '@/components/atoms/StoreDetailTab';     //詳細タブ用コンポーネント
import StoreMenuTab from '@/components/atoms/StoreMenuTab'; // メニュータブ用コンポーネント

export default function StoreDetail() {
    const searchParams = useSearchParams(); // クエリ取得用フック
    const restaurantId = Number(searchParams.get("id")); // URL の id を数値に変換

    // 該当する店舗情報を mock データから検索
    const restaurant = restaurants.find(r => r.id === restaurantId);

    // 店舗が見つからなかった場合のエラー表示
    if (!restaurant) {
        return <div>店舗が見つかりませんでした。</div>;
    }

    // 中間テーブルから、対象店舗に紐づくカテゴリIDを取り出し、
    // それに該当するカテゴリ名を取得
    const relatedCategories = reataurants_categories
        .filter(rc => rc.restaurant_id === restaurant.id)
        .map(rc => {
            const category = categories.find(cat => cat.id === rc.category_id);
            return category?.name || '';     // 存在しなければ空文字
        });


    // クエリから現在のページを取得。なければ1ページ目
    const currentPage = searchParams.get('page') || '1';

    // 戻るボタンの処理を上書き
    const goBack = () => {
        router.push(`/store/list?page=${currentPage}`);  // ページ番号つきで戻る
    };

    //タブ切り替え用
    const [activeTab, setActiveTab] = useState('detail');

    // 申請者表示用
    const owner = users.find(u => u.id === restaurant.owner_id);

    // 営業日表示用
    const days = ["日", "月", "火", "水", "木", "金", "土"];

    // 店舗のrestaurants_business_calendarを取得
    const calendar = restaurants_business_calendar.filter(
        (c) => c.restaurant_id === restaurant.id
    );


    // ============= 関数 ==============
    // 電話番号をハイフン付きで整形（例: 080-1234-5678）
    function formatPhoneNumber(number) {
        if (!number) return '';
        const clean = number.replace(/[^\d]/g, '');

        if (clean.length === 11) {
            return `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7)}`;
        } else if (clean.length === 10) {
            return `${clean.slice(0, 2)}-${clean.slice(2, 6)}-${clean.slice(6)}`;
        } else {
            return number; // 整形できない場合はそのまま
        }
    }

    // 郵便番号を xxx-xxxx の形式に変換する (JS版)
    function formatPostcode(postcode) {
        if (!postcode) return '';
            const clean = String(postcode).replace(/[^\d]/g, ''); // 数字以外削除

        if (clean.length === 7) {
            return `${clean.slice(0, 3)}-${clean.slice(3)}`;
        } else {
            return postcode; // 整形できない場合はそのまま
        }
    }


    return (
    <div className={styles.wrapper}>

    {/* 固定ヘッダー部分 */}
    <div className={styles.backButton} onClick={() => window.history.back()}>
        <span className={`material-symbols-outlined ${styles.backIcon}`}>arrow_back</span>
    </div>
    <div className={styles.fixedHeader}>
        <h1 className={styles.title}>{restaurant.name}</h1>

        <p className={styles.address}>
        <a
            href={`https://www.google.com/maps/search/?q=${restaurant.address}`}
            target="_blank"
            rel="noopener noreferrer"
        >
            {restaurant.address}
        </a>
    </p>

    <div className={styles.categoryContainer}>
        {relatedCategories.map((category, index) => (
            <CategoryTag key={index} label={category} selected={true} />
        ))}
    </div>

      <div className={styles.divider} /> {/* 区切り線 */}
    </div>

    {/* タブの切り替えUI */}
    <div className={styles.tabContainer}>
        <button
            className={`${styles.tabButton} ${activeTab === 'detail' ? styles.active : ''}`}
            onClick={() => setActiveTab('detail')}
        >
            店舗詳細
        </button>
        <button
            className={`${styles.tabButton} ${activeTab === 'menu' ? styles.active : ''}`}
            onClick={() => setActiveTab('menu')}
        >
            メニュー
        </button>
        <button
            className={`${styles.tabButton} ${activeTab === 'information' ? styles.active : ''}`}
            onClick={() => setActiveTab('information')}
        >
            店舗情報
        </button>
    </div>

    {/* スクロール領域 */}
    <div className={styles.scrollArea}>
        {/* ここに画像・地図・レビューなどが入る想定 */}
        {activeTab === 'detail' && <StoreDetailTab restaurant={restaurant} />}
        {activeTab === 'menu' && <StoreMenuTab restaurant={restaurant} />}
        {activeTab === 'information' &&(
            // 以下 店舗情報タブ内容
            <div className={adminStyles.tableContainer}>
                {/* 店舗情報を一覧で表示 */}
                <table className={adminStyles.informationTable}>
                    <tbody>
                        <tr>
                            <td className={adminStyles.label}>店舗名</td>
                            <td className={adminStyles.content}>{restaurant.name}</td>
                        </tr>
                        <tr>
                            <td className={adminStyles.label}>申請者名</td>
                            <td className={adminStyles.content}>{owner ? owner.name : '不明'}</td>
                        </tr>
                        <tr>
                            <td className={adminStyles.label}>店外の写真</td>
                            <td className={adminStyles.content}>
                                <img
                                    src={restaurant.image_url}
                                    alt={restaurant.name}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className={adminStyles.label}>店内の写真</td>
                            <td className={adminStyles.content}>
                                <img
                                    src={restaurant.image_detail_url}
                                    alt={restaurant.name}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className={adminStyles.label}>郵便番号</td>
                            <td className={adminStyles.content}>{formatPostcode(restaurant.postcode)}</td>
                        </tr>
                        <tr>
                            <td className={adminStyles.label}>住所</td>
                            <td className={adminStyles.content}>{restaurant.address}</td>
                        </tr>
                        <tr>
                            <td className={adminStyles.label}>電話番号</td>
                            <td className={adminStyles.content}>{formatPhoneNumber(restaurant.phone)}</td>
                        </tr>
                        <tr>
                            <td className={adminStyles.label}>メールアドレス</td>
                            <td className={adminStyles.content}>{restaurant.email}</td>
                        </tr>
                    </tbody>
                </table>

                {/* 営業時間を表示 */}
                <table className={adminStyles.businesstimeTable}>
                    <thead>
                        <tr>
                            <th>曜日</th>
                            <th>定休日</th>
                            <th>ランチ営業時間</th>
                            <th>ディナー営業時間</th>
                        </tr>
                    </thead>
                    <tbody>
                        {days.map((day,index) => {
                            const dayData = calendar.find((c) => c.day_of_week === index);

                            // 完全休業
                            if(!dayData || dayData.is_closed){
                                return(
                                    <tr key={index}>
                                        <td>{day}</td>
                                        <td>〇</td>
                                        <td>ー</td>
                                        <td>ー</td>
                                    </tr>
                                );
                            }
                            
                            // 営業日
                            return(
                                <tr key={index}>
                                    <td>{day}</td>
                                    <td>ー</td>
                                    <td>
                                        {dayData.is_lunch_closed
                                            ? "ー"
                                            : `${dayData.lunch_start} ～ ${dayData.lunch_end}`
                                        }
                                    </td>
                                    <td>
                                        {dayData.is_dinner_closed
                                            ? "ー"
                                            : `${dayData.dinner_start} ～ ${dayData.dinner_end}`
                                        }
                                    </td>
                                </tr>
                            );
                        })

                        }
                    </tbody>
                </table>
            </div>
        )}
    </div>

    </div>
    
    );
}
