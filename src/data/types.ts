// ユーザー情報
export interface User{
  id:number;        // 主キー
  login_id:string;  // ログインID
  password:string;  // パスワード
  role:string;      // ユーザーの区分
  name:string;      // 利用者の名前
}

// ユーザーの区分
export enum UserRole {
  Admin = 'admin',        // 管理者
  Owner = 'owner',        // 経営者
  Customer = 'customer',  // 利用者
}

// 店舗情報
export interface Restaurants{
  id:number;        // 主キー
  name:string;      // 店舗の名前
  address:string;   // 住所
  postcode:string;  // 郵便番号
  phone:string;     // 電話番号
  email:string;     // メールアドレス
  owner_id:number;  // 経営者のユーザーID(外部キー)
  descrption?:string;// 店舗のメモ
  image_url: string;// 店舗の写真のurl
  image_detail_url: string;// 店舗の中の写真のurl
  certificate?:string; // 証明書のurl
  isPublished:boolean;  // 全体に公開するか判定
  approved:boolean;     // 証明書の承認判定
  applicationData?:Date; // 証明書の申請日
  approvalDate?:Date;  // 証明書の承認日

}

// メニュー 
export interface Dishes {
  id: number;             //主キー
  restaurant_id: number;  //店舗のID(外部キー)
  name: string;           //名前
  price: number;          //値段
  description?: string;    //メニューのメモ
  image_url: string;      //メニューの画像へのアクセスルート
  video_url?: string;      //メニューの3D動画へのアクセスルート
}

// カテゴリ―
export interface Categories{
  id:number;      //主キー
  name:string;    //カテゴリ―の名前
}

// 登録されているカテゴリ―
export interface Reataurants_Categories{
  id: number;             // 主キー
  restaurant_id: number;  // 店舗のID(外部キー)
  category_id:number;     // カテゴリ―ID(外部キー)
}

// 店舗の営業時間
export interface Restaurants_business_hours{
  id:number;            // 主キー
  restaurant_id:number; // 店舗のID(外部キー)
  day_of_week:number;   // 営業する曜日
  open_time:number;     // 開店時刻
  close_time:number;    // 閉店時刻
}

// 店舗の定休日・営業時間テーブル
// ?は存在しない(undefined)可能性があるためつけています
export interface Restaurants_business_calendar
{
  id:number;            // 主キー
  restaurant_id:number; // 店舗のID(外部キー)
  day_of_week:number;   // 0=日, 1=月, ..., 6=土, 7=祝日
  is_closed:boolean;    // 定休日かどうか
  lunch_start?:string;   // ランチ開始時刻
  lunch_end?:string;     // ランチ終了時刻
  is_lunch_closed:boolean;  //「ランチ営業なし」チェックボックス
  dinner_start?:string;  // ディナー開始時間
  dinner_end?:string;    // ディナー終了時間
  is_dinner_closed:boolean; // 「ディナー営業なし」チェックボックス
}

// メニューのアレルギー情報テーブル
export interface Dish_allergy
{
  id:number;    // 主キー
  dish:number;  // メニューのID（外部キー）
  allergy:number; // アレルギーのID（外部キー） 
}

// アレルギーテーブル
export interface Allergy
{
  id:number;    // 主キー
  name:string;  // アレルギーの名前
}

// 店舗アクセス履歴（日別カウント）
export interface RestaurantAccessLog {
  restaurant_id: number;
  date: string;     // 'YYYY-MM-DD'形式
  count: number;    // その日のアクセス数
}

// メニューアクセス履歴（日別カウント）
export interface MenuAccessLog {
  restaurant_id: number;
  dish_id: number;
  date: string;     // 'YYYY-MM-DD'形式
  count: number;    // その日のアクセス数
}

// 人気メニューランキング用
export interface PopularMenu {
  restaurant_id: number;
  dish_id: number;
  total_count: number;  // 累計クリック数
}

// 数値集計（数字だけ表示用）
export interface StoreStatistics {
  restaurant_id: number;
  total_restaurant_access: number;
  total_menu_access: number;
  total_dishes: number;
}