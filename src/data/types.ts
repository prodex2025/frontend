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
  descrption:string;// 店舗のメモ
  img_url: string;  // 店舗の画像
}

// メニュー 
export interface Dishes {
  id: number;             //主キー
  restaurant_id: number;  //店舗のID(外部キー)
  name: string;           //名前
  price: number;          //値段
  description: string;    //メニューのメモ
  image_url: string;      //メニューの画像へのアクセスルート
  video_url: string;      //メニューの3D動画へのアクセスルート
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