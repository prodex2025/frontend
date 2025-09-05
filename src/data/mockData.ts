// 型のimport
import { Restaurants, User, UserRole, Dishes, Categories, Reataurants_Categories, Restaurants_business_hours, Restaurants_business_calendar, Dish_allergy, Allergy, RestaurantAccessLog, MenuAccessLog, PopularMenu, StoreStatistics, ApiSerialize } from "./types";

// ユーザーの仮データ
export const users: User[] = [
  {
    id:1,
    login_id:'customer1',
    password:'customer1',
    role:UserRole.Customer,
    name: 'ユーザー',
  },
    {
    id:2,
    login_id:'customer2',
    password:'customer2',
    role:UserRole.Customer,
    name: 'ユーザー',
  },
    {
    id:3,
    login_id:'owner1',
    password:'owner1',
    role:UserRole.Owner,
    name: '志摩太郎',
  },
    {
    id:4,
    login_id:'owner2',
    password:'owner2',
    role:UserRole.Owner,
    name: '三太郎',
  }
  ,
    {
    id:5,
    login_id:'admin1',
    password:'admin1',
    role:UserRole.Admin,
    name: '管理者',
  }
  ,
    {
    id:6,
    login_id:'admin2',
    password:'admin2',
    role:UserRole.Admin,
    name: '管理者',
  }
]

//店舗情報
export const restaurants:Restaurants[] = [
  {
    id:1,
    name:'レスタウラン',
    address:'兵庫県神戸市兵庫区松本通1丁目',
    postcode: '6520045',
    phone:'08055664756',
    email:'tekist@demo.ac',
    owner_id:3,
    descrption:'おいしいお肉のお店です',
    image_url: '/image/shop.png',
    image_detail_url:'/image/shop.png',
    certificate:'/image/certificate.jpg',
    isPublished:true,
    approved:true,
    applicationData:new Date('2025-08-01T10:00:00Z'),
    approvalDate:new Date('2025-08-01T10:00:00Z'),
  },
  {
    id:2,
    name:'はなさかじいさん',
    address:'兵庫県神戸市兵庫区上沢通1丁目',
    postcode: '6520046',
    phone:'07022334455',
    email:'exsample@test.ac.jp',
    owner_id:3,
    descrption:'いい香りがします',
    image_url: '/image/tokyo-deli.png',
    image_detail_url:'/image/shop.png',
    certificate:'/image/certificate.jpg',
    isPublished:true,
    approved:true,
    applicationData:new Date('2025-08-02T10:00:00Z'),
    approvalDate:new Date('2025-08-02T10:00:00Z'),
  },
  {
    id:3,
    name:'ももたろう',
    address:'〒123-1234兵庫県神戸市中央区御幸通り3丁目',
    postcode: '6520045',
    phone:'07022223333',
    email:'exsample@exsample.com',
    owner_id:4,
    descrption:'おいしい三食団子です',
    image_url: '/image/yakiniku.png',
    image_detail_url:'/image/shop.png',
    certificate:'/image/certificate.jpg',
    isPublished:true,
    approved:true,
    applicationData:new Date('2025-08-02T10:00:00Z'),
    approvalDate:new Date('2025-08-02T10:00:00Z'),
  },
  {
    id:4,
    name:'ごんちゃ',
    address:'兵庫県神戸市中央区御幸通3丁目2-4',
    postcode: '6520045',
    phone:'09023555244',
    email:'text@exsample.com',
    owner_id:4,
    descrption:'タピオカ',
    image_url: '/image/shop.png',
    image_detail_url:'/image/shop.png',
    certificate:'/image/certificate.jpg',
    isPublished:false,
    approved:true,
    applicationData:new Date('2025-08-02T10:00:00Z'),
    approvalDate:new Date('2025-08-02T10:00:00Z'),
  },
  {
    id:5,
    name:'月のうさぎ庵',
    address:'兵庫県神戸市兵庫区松本通',
    postcode: '6520045',
    phone:'09023555244',
    email:'text@exsample.com',
    owner_id:4,
    descrption:'タピオカ',
    image_url: '/image/shop.png',
    image_detail_url:'/image/shop.png',
    certificate:'/image/certificate.jpg',
    isPublished:true,
    approved:true,
    applicationData:new Date('2025-08-02T10:00:00Z'),
    approvalDate:new Date('2025-08-02T10:00:00Z'),
  },
  {
    id:6,
    name:'グリル・パレット',
    address:'兵庫県神戸市兵庫区松本通',
    postcode: '6520045',
    phone:'09023555244',
    email:'text@exsample.com',
    owner_id:4,
    descrption:'タピオカ',
    image_url: '/image/shop.png',
    image_detail_url:'/image/shop.png',
    certificate:'/image/certificate.jpg',
    isPublished:true,
    approved:true,
    applicationData:new Date('2025-08-02T10:00:00Z'),
    approvalDate:new Date('2025-08-02T10:00:00Z'),
  },
  {
    id:7,
    name:'麺屋 匠心（たくみごころ）',
    address:'兵庫県神戸市兵庫区松本通',
    postcode: '6520045',
    phone:'09023555244',
    email:'text@exsample.com',
    owner_id:4,
    descrption:'タピオカ',
    image_url: '/image/shop.png',
    image_detail_url:'/image/shop.png',
    certificate:'/image/certificate.jpg',
    isPublished:true,
    approved:true,
    applicationData:new Date('2025-08-02T10:00:00Z'),
    approvalDate:new Date('2025-08-02T10:00:00Z'),
  },
  {
    id:8,
    name:'スパイス・ジャーニー',
    address:'兵庫県神戸市兵庫区松本通',
    postcode: '6520045',
    phone:'09023555244',
    email:'text@exsample.com',
    owner_id:4,
    descrption:'タピオカ',
    image_url: '/image/shop.png',
    image_detail_url:'/image/shop.png',
    certificate:'/image/certificate.jpg',
    isPublished:true,
    approved:true,
    applicationData:new Date('2025-08-02T10:00:00Z'),
    approvalDate:new Date('2025-08-02T10:00:00Z'),
  },
  {
    id:9,
    name:' 椿坂珈琲（つばきざかコーヒー）',
    address:'兵庫県神戸市兵庫区松本通',
    postcode: '6520045',
    phone:'09023555244',
    email:'text@exsample.com',
    owner_id:4,
    descrption:'焔（ほむら）',
    image_url: '/image/shop.png',
    image_detail_url:'/image/shop.png',
    certificate:'/image/certificate.jpg',
    isPublished:true,
    approved:true,
    applicationData:new Date('2025-08-02T10:00:00Z'),
    approvalDate:new Date('2025-08-02T10:00:00Z'),
  },
  {
    id:10,
    name:'アーク',
    address:'兵庫県神戸市兵庫区松本通',
    postcode: '6520045',
    phone:'09023555244',
    email:'text@exsample.com',
    owner_id:4,
    descrption:'タピオカ',
    image_url: '/image/shop.png',
    image_detail_url:'/image/shop.png',
    certificate:'/image/certificate.jpg',
    isPublished:true,
    approved:true,
    applicationData:new Date('2025-08-02T10:00:00Z'),
    approvalDate:new Date('2025-08-02T10:00:00Z'),
  },
  {
    id:11,
    name:'然（ぜん）',
    address:'兵庫県神戸市兵庫区松本通',
    postcode: '6520045',
    phone:'09023555244',
    email:'text@exsample.com',
    owner_id:4,
    descrption:'タピオカ',
    image_url: '/image/shop.png',
    image_detail_url:'/image/shop.png',
    certificate:'/image/certificate.jpg',
    isPublished:true,
    approved:true,
    applicationData:new Date('2025-08-02T10:00:00Z'),
    approvalDate:new Date('2025-08-02T10:00:00Z'),
  },
  {
    id:12,
    name:'ルナ',
    address:'兵庫県神戸市兵庫区松本通',
    postcode: '6520045',
    phone:'09023555244',
    email:'text@exsample.com',
    owner_id:4,
    descrption:'タピオカ',
    image_url: '/image/shop.png',
    image_detail_url:'/image/shop.png',
    certificate:'/image/certificate.jpg',
    isPublished:true,
    approved:true,
    applicationData:new Date('2025-08-02T10:00:00Z'),
    approvalDate:new Date('2025-08-02T10:00:00Z'),
  },
  {
    id:13,
    name:'カラフル・デリ・ラボ',
    address:'兵庫県神戸市兵庫区松本通',
    postcode: '6520045',
    phone:'09023555244',
    email:'text@exsample.com',
    owner_id:4,
    descrption:'フワトロ喫茶「雲の上」',
    image_url: '/image/shop.png',
    image_detail_url:'/image/shop.png',
    certificate:'/image/certificate.jpg',
    isPublished:false,
    approved:false,
    applicationData:undefined,
    approvalDate:undefined,
  },
  {
    id:14,
    name:'チャチャッとタコス！',
    address:'兵庫県神戸市兵庫区松本通',
    postcode: '6520045',
    phone:'09023555244',
    email:'text@exsample.com',
    owner_id:4,
    descrption:'タピオカ',
    image_url: '/image/shop.png',
    image_detail_url:'/image/shop.png',
    certificate:'/image/certificate.jpg',
    isPublished:false,
    approved:true,
    applicationData:new Date('2025-08-02T10:00:00Z'),
    approvalDate:new Date('2025-08-02T10:00:00Z'),
  },
  {
    id:15,
    name:'ネオン・ヌードル・ダイナー',
    address:'兵庫県神戸市兵庫区松本通',
    postcode: '6520045',
    phone:'09023555244',
    email:'text@exsample.com',
    owner_id:4,
    descrption:'タピオカ',
    image_url: '/image/shop.png',
    image_detail_url:'/image/shop.png',
    certificate:'/image/certificate.jpg',
    isPublished:false,
    approved:false,
    applicationData:undefined,
    approvalDate:undefined,
  },
  
]

export const dishes:Dishes[] = [
  {
    id:1,
    restaurant_id:1,
    name:'ハンバーグ',
    price:500,
    description:'ハンバーグ',
    image_url:'@/image/humburger.png',
    video_url:'f5e9101a49ea4a3493d1bb4a09ac03ee',
  },
  {
    id:2,
    restaurant_id:1,
    name:'パスタ',
    price:420,
    description:'パスタ',
    image_url:'@/image/pasuta.png',
    video_url:'@/video/menu.mp4',
  },
  {
    id:3,
    restaurant_id:1,
    name:'ステーキ',
    price:480,
    description:'ステーキ',
    image_url:'@/image/stake.png',
    video_url:'@/video/menu.mp4',
  },
  {
    id:4,
    restaurant_id:2,
    name:'パエリア',
    price:600,
    description:'YAMMY！！！',
    image_url:'@/image/menu.jpg',
    video_url:'@/video/menu.mp4',
  },
  {
    id:5,
    restaurant_id:2,
    name:'ステーキ',
    price:480,
    description:'ステーキ',
    image_url:'@/image/menu.jpg',
    video_url:'@/video/menu.mp4',
  },
  {
    id:6,
    restaurant_id:2,
    name:'ステーキ',
    price:480,
    description:'ステーキ',
    image_url:'@/image/menu.jpg',
    video_url:'@/video/menu.mp4',
  },
  {
    id:7,
    restaurant_id:3,
    name:'ステーキ',
    price:480,
    description:'ステーキ',
    image_url:'@/image/menu.jpg',
    video_url:'@/video/menu.mp4',
  },
  {
    id:8,
    restaurant_id:3,
    name:'ステーキ',
    price:480,
    description:'ステーキ',
    image_url:'@/image/menu.jpg',
    video_url:'@/video/menu.mp4',
  },
  {
    id:9,
    restaurant_id:3,
    name:'アイス',
    price:480,
    description:'ステーキ',
    image_url:'@/image/menu.jpg',
    video_url:'@/video/menu.mp4',
  },
  {
    id:10,
    restaurant_id:4,
    name:'ステーキ',
    price:480,
    description:'ステーキ',
    image_url:'@/image/menu.jpg',
    video_url:'@/video/menu.mp4',
  },
  {
    id:11,
    restaurant_id:4,
    name:'ステーキ',
    price:480,
    description:'ステーキ',
    image_url:'@/image/menu.jpg',
    video_url:'@/video/menu.mp4',
  },
  {
    id:12,
    restaurant_id:4,
    name:'ステーキ',
    price:480,
    description:'ステーキ',
    image_url:'@/image/menu.jpg',
    video_url:'@/video/menu.mp4',
  },
  {
    id:13,
    restaurant_id:1,
    name:'パエリア',
    price:600,
    description:'YAMMY！！！',
    image_url:'@/image/menu.jpg',
    video_url:'@/video/menu.mp4',
  },
  {
    id:14,
    restaurant_id:1,
    name:'刺身盛り合わせ',
    price:600,
    description:'新鮮でおいしいよ',
    image_url:'@/image/sasimi.png',
    video_url:'@/video/menu.mp4',
  },
]

export const categories:Categories[] = [
  {
    id:1,
    name:'お肉'
  },
  {
    id:2,
    name:'魚'
  },
  {
    id:3,
    name:'パスタ'
  },
  {
    id:4,
    name:'ステーキ'
  },
  {
    id:5,
    name:'焼肉'
  },
  {
    id:6,
    name:'ハンバーグ'
  },
  {
    id:7,
    name:'イタリアン'
  },
  {
    id:8,
    name:'中華'
  },
  {
    id:9,
    name:'和食'
  },
  {
    id:10,
    name:'フレンチ'
  },
  {
    id:11,
    name:'エスニック'
  },
  {
    id:12,
    name:'カフェ'
  },
  {
    id:13,
    name:'韓国料理'
  },
  {
    id:14,
    name:'デザート'
  },
  {
    id:15,
    name:'バー'
  },
  {
    id:16,
    name:'居酒屋'
  },
  {
    id:17,
    name:'ファストフード'
  },
  {
    id:18,
    name:'スイーツ・デザート'
  },
  {
    id:19,
    name:'タイ料理'
  },
  {
    id:20,
    name:'ベトナム料理'
  },
  {
    id:21,
    name:'インド料理'
  },
  {
    id:22,
    name:'寿司'
  },
  {
    id:23,
    name:'ラーメン'
  },
  {
    id:24,
    name:'薬膳料理'
  },
  {
    id:25,
    name:'カレー'
  },
  {
    id:26,
    name:'メキシカン料理'
  },

]

export const reataurants_categories:Reataurants_Categories[] = [
  {
    id:1,
    restaurant_id:1,
    category_id:1,
  },
  {
    id:2,
    restaurant_id:1,
    category_id:2,
  },
  {
    id:3,
    restaurant_id:2,
    category_id:4,
  },
  {
    id:4,
    restaurant_id:2,
    category_id:7,
  },
  {
    id:5,
    restaurant_id:3,
    category_id:5,
  },
  {
    id:6,
    restaurant_id:3,
    category_id:6,
  },
  {
    id:7,
    restaurant_id:4,
    category_id:3,
  },
  {
    id:8,
    restaurant_id:4,
    category_id:4,
  },
  {
    id:9,
    restaurant_id:5,
    category_id:12,
  },
  {
    id:10,
    restaurant_id:5,
    category_id:18,
  },
  {
    id:11,
    restaurant_id:6,
    category_id:26,
  },
  {
    id:12,
    restaurant_id:7,
    category_id:23,
  },
  {
    id:13,
    restaurant_id:8,
    category_id:26,
  },
  {
    id:14,
    restaurant_id:9,
    category_id:12,
  },
  {
    id:15,
    restaurant_id:9,
    category_id:14,
  },
  {
    id:15,
    restaurant_id:10,
    category_id:19,
  },
  
]

//０が月、1が火、２が水って感じになってる
export const restaurants_business_hours:Restaurants_business_hours[] = [
  {
    id:1,
    restaurant_id:1,
    day_of_week:0,
    open_time:420,
    close_time:1140,
  },
  {
    id:2,
    restaurant_id:1,
    day_of_week:1,
    open_time:420,
    close_time:1140,
  },
  {
    id:3,
    restaurant_id:1,
    day_of_week:2,
    open_time:420,
    close_time:1140,
  },
  {
    id:4,
    restaurant_id:1,
    day_of_week:4,
    open_time:420,
    close_time:1140,
  },
  {
    id:5,
    restaurant_id:1,
    day_of_week:5,
    open_time:420,
    close_time:1140,
  },
  {
    id:6,
    restaurant_id:2,
    day_of_week:0,
    open_time:480,
    close_time:1200,
  },
  {
    id:7,
    restaurant_id:2,
    day_of_week:3,
    open_time:480,
    close_time:1200,
  },
  {
    id:8,
    restaurant_id:2,
    day_of_week:5,
    open_time:480,
    close_time:1200,
  },
  {
    id:9,
    restaurant_id:2,
    day_of_week:6,
    open_time:480,
    close_time:1200,
  },
  {
    id:10,
    restaurant_id:3,
    day_of_week:3,
    open_time:480,
    close_time:1200,
  },
  {
    id:11,
    restaurant_id:3,
    day_of_week:4,
    open_time:480,
    close_time:1200,
  },
  {
    id:12,
    restaurant_id:3,
    day_of_week:5,
    open_time:480,
    close_time:1200,
  },
  {
    id:13,
    restaurant_id:3,
    day_of_week:6,
    open_time:480,
    close_time:1200,
  },
  {
    id:14,
    restaurant_id:4,
    day_of_week:2,
    open_time:480,
    close_time:1200,
  },
  {
    id:15,
    restaurant_id:4,
    day_of_week:4,
    open_time:480,
    close_time:1200,
  },
  {
    id:16,
    restaurant_id:4,
    day_of_week:5,
    open_time:480,
    close_time:1200,
  },
  {
    id:17,
    restaurant_id:4,
    day_of_week:6,
    open_time:480,
    close_time:1200,
  },
]

export const restaurants_business_calendar:Restaurants_business_calendar[] = [
  // restaurant_id: 1 (定休日 金曜=5)
  {
    id:1,
    restaurant_id:1,
    day_of_week:0,
    is_closed:false,
    lunch_start:'11:00',
    lunch_end:'14:00',
    is_lunch_closed:false,
    dinner_start:'17:00',
    dinner_end:'21:00',
    is_dinner_closed:false,
  },
  {
    id:2,
    restaurant_id:1,
    day_of_week:1,
    is_closed:false,
    lunch_start:'11:00',
    lunch_end:'14:00',
    is_lunch_closed:false,
    dinner_start:'17:00',
    dinner_end:'21:00',
    is_dinner_closed:false,
  },
  {
    id:3,
    restaurant_id:1,
    day_of_week:2,
    is_closed:false,
    lunch_start:'11:00',
    lunch_end:'14:00',
    is_lunch_closed:false,
    dinner_start:'17:00',
    dinner_end:'21:00',
    is_dinner_closed:false,
  },
  {
    id:4,
    restaurant_id:1,
    day_of_week:3,
    is_closed:false,
    lunch_start:'11:00',
    lunch_end:'14:00',
    is_lunch_closed:false,
    dinner_start:'17:00',
    dinner_end:'21:00',
    is_dinner_closed:false,
  },
  {
    id:5,
    restaurant_id:1,
    day_of_week:4,
    is_closed:false,
    lunch_start:'11:00',
    lunch_end:'14:00',
    is_lunch_closed:false,
    dinner_start:'17:00',
    dinner_end:'21:00',
    is_dinner_closed:false,
  },
  {
    id:6,
    restaurant_id:1,
    day_of_week:5,
    is_closed:true,
    lunch_start:undefined,
    lunch_end:undefined,
    is_lunch_closed:true,
    dinner_start:undefined,
    dinner_end:undefined,
    is_dinner_closed:true,
  },
  {
    id:7,
    restaurant_id:1,
    day_of_week:6,
    is_closed:false,
    lunch_start:'11:00',
    lunch_end:'14:00',
    is_lunch_closed:false,
    dinner_start:'17:00',
    dinner_end:'21:00',
    is_dinner_closed:false,
  },
  {
    id:8,
    restaurant_id:1,
    day_of_week:7,
    is_closed:true,
    lunch_start:'',
    lunch_end:'',
    is_lunch_closed:true,
    dinner_start:'',
    dinner_end:'',
    is_dinner_closed:true,
  },
  // restaurant_id: 2 (定休日 水曜=3)
  { id: 9,  restaurant_id: 2, day_of_week: 0, is_closed: false, lunch_start: '10:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:00', is_dinner_closed: false },
  { id: 10, restaurant_id: 2, day_of_week: 1, is_closed: false, lunch_start: '10:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:00', is_dinner_closed: false },
  { id: 11, restaurant_id: 2, day_of_week: 2, is_closed: false, lunch_start: '10:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:00', is_dinner_closed: false },
  { id: 12, restaurant_id: 2, day_of_week: 3, is_closed: true,  lunch_start: '',       lunch_end: '',       is_lunch_closed: true,  dinner_start: '',       dinner_end: '',       is_dinner_closed: true },
  { id: 13, restaurant_id: 2, day_of_week: 4, is_closed: false, lunch_start: '10:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:00', is_dinner_closed: false },
  { id: 14, restaurant_id: 2, day_of_week: 5, is_closed: false, lunch_start: '10:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:00', is_dinner_closed: false },
  { id: 15, restaurant_id: 2, day_of_week: 6, is_closed: false, lunch_start: '10:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:00', is_dinner_closed: false },
  { id: 16, restaurant_id: 2, day_of_week: 7, is_closed: false, lunch_start: '10:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:00', is_dinner_closed: false },

  // restaurant_id: 3 (定休日 木曜=4)
  { id: 17, restaurant_id: 3, day_of_week: 0, is_closed: false, lunch_start: '11:00', lunch_end: '15:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '22:00', is_dinner_closed: false },
  { id: 18, restaurant_id: 3, day_of_week: 1, is_closed: false, lunch_start: '11:00', lunch_end: '15:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '22:00', is_dinner_closed: false },
  { id: 19, restaurant_id: 3, day_of_week: 2, is_closed: false, lunch_start: '11:00', lunch_end: '15:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '22:00', is_dinner_closed: false },
  { id: 20, restaurant_id: 3, day_of_week: 3, is_closed: false, lunch_start: '11:00', lunch_end: '15:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '22:00', is_dinner_closed: false },
  { id: 21, restaurant_id: 3, day_of_week: 4, is_closed: true,  lunch_start: '',       lunch_end: '',       is_lunch_closed: true,  dinner_start: '',       dinner_end: '',       is_dinner_closed: true },
  { id: 22, restaurant_id: 3, day_of_week: 5, is_closed: false, lunch_start: '11:00', lunch_end: '15:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '22:00', is_dinner_closed: false },
  { id: 23, restaurant_id: 3, day_of_week: 6, is_closed: false, lunch_start: '11:00', lunch_end: '15:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '22:00', is_dinner_closed: false },
  { id: 24, restaurant_id: 3, day_of_week: 7, is_closed: false, lunch_start: '11:00', lunch_end: '15:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '22:00', is_dinner_closed: false },

  // restaurant_id: 4 (定休日 金曜=5)
  { id: 25, restaurant_id: 4, day_of_week: 0, is_closed: false, lunch_start: '12:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '18:00', dinner_end: '23:00', is_dinner_closed: false },
  { id: 26, restaurant_id: 4, day_of_week: 1, is_closed: false, lunch_start: '12:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '18:00', dinner_end: '23:00', is_dinner_closed: false },
  { id: 27, restaurant_id: 4, day_of_week: 2, is_closed: false, lunch_start: '12:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '18:00', dinner_end: '23:00', is_dinner_closed: false },
  { id: 28, restaurant_id: 4, day_of_week: 3, is_closed: false, lunch_start: '12:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '18:00', dinner_end: '23:00', is_dinner_closed: false },
  { id: 29, restaurant_id: 4, day_of_week: 4, is_closed: false, lunch_start: '12:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '18:00', dinner_end: '23:00', is_dinner_closed: false },
  { id: 30, restaurant_id: 4, day_of_week: 5, is_closed: true,  lunch_start: '',       lunch_end: '',       is_lunch_closed: true,  dinner_start: '',       dinner_end: '',       is_dinner_closed: true },
  { id: 31, restaurant_id: 4, day_of_week: 6, is_closed: false, lunch_start: '12:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '18:00', dinner_end: '23:00', is_dinner_closed: false },
  { id: 32, restaurant_id: 4, day_of_week: 7, is_closed: false, lunch_start: '12:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '18:00', dinner_end: '23:00', is_dinner_closed: false },

  // restaurant_id: 5 (定休日 土曜=6)
  { id: 33, restaurant_id: 5, day_of_week: 0, is_closed: false, lunch_start: '11:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:30', is_dinner_closed: false },
  { id: 34, restaurant_id: 5, day_of_week: 1, is_closed: false, lunch_start: '11:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:30', is_dinner_closed: false },
  { id: 35, restaurant_id: 5, day_of_week: 2, is_closed: false, lunch_start: '11:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:30', is_dinner_closed: false },
  { id: 36, restaurant_id: 5, day_of_week: 3, is_closed: false, lunch_start: '11:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:30', is_dinner_closed: false },
  { id: 37, restaurant_id: 5, day_of_week: 4, is_closed: false, lunch_start: '11:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:30', is_dinner_closed: false },
  { id: 38, restaurant_id: 5, day_of_week: 5, is_closed: false, lunch_start: '11:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:30', is_dinner_closed: false },
  { id: 39, restaurant_id: 5, day_of_week: 6, is_closed: true,  lunch_start: '',       lunch_end: '',       is_lunch_closed: true,  dinner_start: '',       dinner_end: '',       is_dinner_closed: true },
  { id: 40, restaurant_id: 5, day_of_week: 7, is_closed: false, lunch_start: '11:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:30', is_dinner_closed: false },

  // restaurant_id: 6 (定休日 日曜=0)
  { id: 41, restaurant_id: 6, day_of_week: 0, is_closed: true,  lunch_start: '',       lunch_end: '',       is_lunch_closed: true,  dinner_start: '',       dinner_end: '',       is_dinner_closed: true },
  { id: 42, restaurant_id: 6, day_of_week: 1, is_closed: false, lunch_start: '10:00', lunch_end: '13:30', is_lunch_closed: false, dinner_start: '16:30', dinner_end: '20:30', is_dinner_closed: false },
  { id: 43, restaurant_id: 6, day_of_week: 2, is_closed: false, lunch_start: '10:00', lunch_end: '13:30', is_lunch_closed: false, dinner_start: '16:30', dinner_end: '20:30', is_dinner_closed: false },
  { id: 44, restaurant_id: 6, day_of_week: 3, is_closed: false, lunch_start: '10:00', lunch_end: '13:30', is_lunch_closed: false, dinner_start: '16:30', dinner_end: '20:30', is_dinner_closed: false },
  { id: 45, restaurant_id: 6, day_of_week: 4, is_closed: false, lunch_start: '10:00', lunch_end: '13:30', is_lunch_closed: false, dinner_start: '16:30', dinner_end: '20:30', is_dinner_closed: false },
  { id: 46, restaurant_id: 6, day_of_week: 5, is_closed: false, lunch_start: '10:00', lunch_end: '13:30', is_lunch_closed: false, dinner_start: '16:30', dinner_end: '20:30', is_dinner_closed: false },
  { id: 47, restaurant_id: 6, day_of_week: 6, is_closed: false, lunch_start: '10:00', lunch_end: '13:30', is_lunch_closed: false, dinner_start: '16:30', dinner_end: '20:30', is_dinner_closed: false },
  { id: 48, restaurant_id: 6, day_of_week: 7, is_closed: false, lunch_start: '10:00', lunch_end: '13:30', is_lunch_closed: false, dinner_start: '16:30', dinner_end: '20:30', is_dinner_closed: false },

  // restaurant_id: 7 (定休日 月曜=1)
  { id: 49, restaurant_id: 7, day_of_week: 0, is_closed: false, lunch_start: '12:30', lunch_end: '15:00', is_lunch_closed: false, dinner_start: '18:00', dinner_end: '22:30', is_dinner_closed: false },
  { id: 50, restaurant_id: 7, day_of_week: 1, is_closed: true,  lunch_start: '',       lunch_end: '',       is_lunch_closed: true,  dinner_start: '',       dinner_end: '',       is_dinner_closed: true },
  { id: 51, restaurant_id: 7, day_of_week: 2, is_closed: false, lunch_start: '12:30', lunch_end: '15:00', is_lunch_closed: false, dinner_start: '18:00', dinner_end: '22:30', is_dinner_closed: false },
  { id: 52, restaurant_id: 7, day_of_week: 3, is_closed: false, lunch_start: '12:30', lunch_end: '15:00', is_lunch_closed: false, dinner_start: '18:00', dinner_end: '22:30', is_dinner_closed: false },
  { id: 53, restaurant_id: 7, day_of_week: 4, is_closed: false, lunch_start: '12:30', lunch_end: '15:00', is_lunch_closed: false, dinner_start: '18:00', dinner_end: '22:30', is_dinner_closed: false },
  { id: 54, restaurant_id: 7, day_of_week: 5, is_closed: false, lunch_start: '12:30', lunch_end: '15:00', is_lunch_closed: false, dinner_start: '18:00', dinner_end: '22:30', is_dinner_closed: false },
  { id: 55, restaurant_id: 7, day_of_week: 6, is_closed: false, lunch_start: '12:30', lunch_end: '15:00', is_lunch_closed: false, dinner_start: '18:00', dinner_end: '22:30', is_dinner_closed: false },
  { id: 56, restaurant_id: 7, day_of_week: 7, is_closed: false, lunch_start: '12:30', lunch_end: '15:00', is_lunch_closed: false, dinner_start: '18:00', dinner_end: '22:30', is_dinner_closed: false },

  // restaurant_id: 8 (定休日 日曜=0)
  { id: 57, restaurant_id: 8, day_of_week: 0, is_closed: true,  lunch_start: '',       lunch_end: '',       is_lunch_closed: true,  dinner_start: '',       dinner_end: '',       is_dinner_closed: true },
  { id: 58, restaurant_id: 8, day_of_week: 1, is_closed: false, lunch_start: '11:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '21:00', is_dinner_closed: false },
  { id: 59, restaurant_id: 8, day_of_week: 2, is_closed: false, lunch_start: '11:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '21:00', is_dinner_closed: false },
  { id: 60, restaurant_id: 8, day_of_week: 3, is_closed: false, lunch_start: '11:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '21:00', is_dinner_closed: false },
  { id: 61, restaurant_id: 8, day_of_week: 4, is_closed: false, lunch_start: '11:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '21:00', is_dinner_closed: false },
  { id: 62, restaurant_id: 8, day_of_week: 5, is_closed: false, lunch_start: '11:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '21:00', is_dinner_closed: false },
  { id: 63, restaurant_id: 8, day_of_week: 6, is_closed: false, lunch_start: '11:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '21:00', is_dinner_closed: false },
  { id: 64, restaurant_id: 8, day_of_week: 7, is_closed: false, lunch_start: '11:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '21:00', is_dinner_closed: false },

  // restaurant_id: 9 (定休日 月曜=1)
  { id: 65, restaurant_id: 9, day_of_week: 0, is_closed: false, lunch_start: '10:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:00', is_dinner_closed: false },
  { id: 66, restaurant_id: 9, day_of_week: 1, is_closed: true,  lunch_start: '',       lunch_end: '',       is_lunch_closed: true,  dinner_start: '',       dinner_end: '',       is_dinner_closed: true },
  { id: 67, restaurant_id: 9, day_of_week: 2, is_closed: false, lunch_start: '10:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:00', is_dinner_closed: false },
  { id: 68, restaurant_id: 9, day_of_week: 3, is_closed: false, lunch_start: '10:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:00', is_dinner_closed: false },
  { id: 69, restaurant_id: 9, day_of_week: 4, is_closed: false, lunch_start: '10:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:00', is_dinner_closed: false },
  { id: 70, restaurant_id: 9, day_of_week: 5, is_closed: false, lunch_start: '10:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:00', is_dinner_closed: false },
  { id: 71, restaurant_id: 9, day_of_week: 6, is_closed: false, lunch_start: '10:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:00', is_dinner_closed: false },
  { id: 72, restaurant_id: 9, day_of_week: 7, is_closed: false, lunch_start: '10:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:00', is_dinner_closed: false },

  // restaurant_id: 10 (定休日 火曜=2)
  { id: 73, restaurant_id: 10, day_of_week: 0, is_closed: false, lunch_start: '11:00', lunch_end: '15:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '22:00', is_dinner_closed: false },
  { id: 74, restaurant_id: 10, day_of_week: 1, is_closed: false, lunch_start: '11:00', lunch_end: '15:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '22:00', is_dinner_closed: false },
  { id: 75, restaurant_id: 10, day_of_week: 2, is_closed: true,  lunch_start: '',       lunch_end: '',       is_lunch_closed: true,  dinner_start: '',       dinner_end: '',       is_dinner_closed: true },
  { id: 76, restaurant_id: 10, day_of_week: 3, is_closed: false, lunch_start: '11:00', lunch_end: '15:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '22:00', is_dinner_closed: false },
  { id: 77, restaurant_id: 10, day_of_week: 4, is_closed: false, lunch_start: '11:00', lunch_end: '15:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '22:00', is_dinner_closed: false },
  { id: 78, restaurant_id: 10, day_of_week: 5, is_closed: false, lunch_start: '11:00', lunch_end: '15:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '22:00', is_dinner_closed: false },
  { id: 79, restaurant_id: 10, day_of_week: 6, is_closed: false, lunch_start: '11:00', lunch_end: '15:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '22:00', is_dinner_closed: false },
  { id: 80, restaurant_id: 10, day_of_week: 7, is_closed: false, lunch_start: '11:00', lunch_end: '15:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '22:00', is_dinner_closed: false },

  // restaurant_id: 11 (定休日 水曜=3)
  { id: 81, restaurant_id: 11, day_of_week: 0, is_closed: false, lunch_start: '12:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '18:00', dinner_end: '23:00', is_dinner_closed: false },
  { id: 82, restaurant_id: 11, day_of_week: 1, is_closed: false, lunch_start: '12:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '18:00', dinner_end: '23:00', is_dinner_closed: false },
  { id: 83, restaurant_id: 11, day_of_week: 2, is_closed: false, lunch_start: '12:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '18:00', dinner_end: '23:00', is_dinner_closed: false },
  { id: 84, restaurant_id: 11, day_of_week: 3, is_closed: true,  lunch_start: '',       lunch_end: '',       is_lunch_closed: true,  dinner_start: '',       dinner_end: '',       is_dinner_closed: true },
  { id: 85, restaurant_id: 11, day_of_week: 4, is_closed: false, lunch_start: '12:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '18:00', dinner_end: '23:00', is_dinner_closed: false },
  { id: 86, restaurant_id: 11, day_of_week: 5, is_closed: false, lunch_start: '12:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '18:00', dinner_end: '23:00', is_dinner_closed: false },
  { id: 87, restaurant_id: 11, day_of_week: 6, is_closed: false, lunch_start: '12:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '18:00', dinner_end: '23:00', is_dinner_closed: false },
  { id: 88, restaurant_id: 11, day_of_week: 7, is_closed: false, lunch_start: '12:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '18:00', dinner_end: '23:00', is_dinner_closed: false },

  // restaurant_id: 12 (定休日 木曜=4)
  { id: 89, restaurant_id: 12, day_of_week: 0, is_closed: false, lunch_start: '11:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:30', is_dinner_closed: false },
  { id: 90, restaurant_id: 12, day_of_week: 1, is_closed: false, lunch_start: '11:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:30', is_dinner_closed: false },
  { id: 91, restaurant_id: 12, day_of_week: 2, is_closed: false, lunch_start: '11:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:30', is_dinner_closed: false },
  { id: 92, restaurant_id: 12, day_of_week: 3, is_closed: false, lunch_start: '11:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:30', is_dinner_closed: false },
  { id: 93, restaurant_id: 12, day_of_week: 4, is_closed: true,  lunch_start: '',       lunch_end: '',       is_lunch_closed: true,  dinner_start: '',       dinner_end: '',       is_dinner_closed: true },
  { id: 94, restaurant_id: 12, day_of_week: 5, is_closed: false, lunch_start: '11:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:30', is_dinner_closed: false },
  { id: 95, restaurant_id: 12, day_of_week: 6, is_closed: false, lunch_start: '11:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:30', is_dinner_closed: false },
  { id: 96, restaurant_id: 12, day_of_week: 7, is_closed: false, lunch_start: '11:30', lunch_end: '14:30', is_lunch_closed: false, dinner_start: '17:30', dinner_end: '22:30', is_dinner_closed: false },

  // restaurant_id: 13 (定休日 金曜=5)
  { id: 97, restaurant_id: 13, day_of_week: 0, is_closed: false, lunch_start: '10:00', lunch_end: '13:30', is_lunch_closed: false, dinner_start: '16:30', dinner_end: '20:30', is_dinner_closed: false },
  { id: 98, restaurant_id: 13, day_of_week: 1, is_closed: false, lunch_start: '10:00', lunch_end: '13:30', is_lunch_closed: false, dinner_start: '16:30', dinner_end: '20:30', is_dinner_closed: false },
  { id: 99, restaurant_id: 13, day_of_week: 2, is_closed: false, lunch_start: '10:00', lunch_end: '13:30', is_lunch_closed: false, dinner_start: '16:30', dinner_end: '20:30', is_dinner_closed: false },
  { id: 100, restaurant_id: 13, day_of_week: 3, is_closed: false, lunch_start: '10:00', lunch_end: '13:30', is_lunch_closed: false, dinner_start: '16:30', dinner_end: '20:30', is_dinner_closed: false },
  { id: 101, restaurant_id: 13, day_of_week: 4, is_closed: false, lunch_start: '10:00', lunch_end: '13:30', is_lunch_closed: false, dinner_start: '16:30', dinner_end: '20:30', is_dinner_closed: false },
  { id: 102, restaurant_id: 13, day_of_week: 5, is_closed: true,  lunch_start: '',       lunch_end: '',       is_lunch_closed: true,  dinner_start: '',       dinner_end: '',       is_dinner_closed: true },
  { id: 103, restaurant_id: 13, day_of_week: 6, is_closed: false, lunch_start: '10:00', lunch_end: '13:30', is_lunch_closed: false, dinner_start: '16:30', dinner_end: '20:30', is_dinner_closed: false },
  { id: 104, restaurant_id: 13, day_of_week: 7, is_closed: false, lunch_start: '10:00', lunch_end: '13:30', is_lunch_closed: false, dinner_start: '16:30', dinner_end: '20:30', is_dinner_closed: false },

  // restaurant_id: 14 (定休日 土曜=6)
  { id: 105, restaurant_id: 14, day_of_week: 0, is_closed: false, lunch_start: '11:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '21:00', is_dinner_closed: false },
  { id: 106, restaurant_id: 14, day_of_week: 1, is_closed: false, lunch_start: '11:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '21:00', is_dinner_closed: false },
  { id: 107, restaurant_id: 14, day_of_week: 2, is_closed: false, lunch_start: '11:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '21:00', is_dinner_closed: false },
  { id: 108, restaurant_id: 14, day_of_week: 3, is_closed: false, lunch_start: '11:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '21:00', is_dinner_closed: false },
  { id: 109, restaurant_id: 14, day_of_week: 4, is_closed: false, lunch_start: '11:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '21:00', is_dinner_closed: false },
  { id: 110, restaurant_id: 14, day_of_week: 5, is_closed: false, lunch_start: '11:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '21:00', is_dinner_closed: false },
  { id: 111, restaurant_id: 14, day_of_week: 6, is_closed: true,  lunch_start: '',       lunch_end: '',       is_lunch_closed: true,  dinner_start: '',       dinner_end: '',       is_dinner_closed: true },
  { id: 112, restaurant_id: 14, day_of_week: 7, is_closed: false, lunch_start: '11:00', lunch_end: '14:00', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '21:00', is_dinner_closed: false },

  // restaurant_id: 15 (定休日 月曜=1)
  { id: 113, restaurant_id: 15, day_of_week: 0, is_closed: false, lunch_start: '10:00', lunch_end: '13:30', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '20:30', is_dinner_closed: false },
  { id: 114, restaurant_id: 15, day_of_week: 1, is_closed: true,  lunch_start: '',       lunch_end: '',       is_lunch_closed: true,  dinner_start: '',       dinner_end: '',       is_dinner_closed: true },
  { id: 115, restaurant_id: 15, day_of_week: 2, is_closed: false, lunch_start: '10:00', lunch_end: '13:30', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '20:30', is_dinner_closed: false },
  { id: 116, restaurant_id: 15, day_of_week: 3, is_closed: false, lunch_start: '10:00', lunch_end: '13:30', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '20:30', is_dinner_closed: false },
  { id: 117, restaurant_id: 15, day_of_week: 4, is_closed: false, lunch_start: '10:00', lunch_end: '13:30', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '20:30', is_dinner_closed: false },
  { id: 118, restaurant_id: 15, day_of_week: 5, is_closed: false, lunch_start: '10:00', lunch_end: '13:30', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '20:30', is_dinner_closed: false },
  { id: 119, restaurant_id: 15, day_of_week: 6, is_closed: false, lunch_start: '10:00', lunch_end: '13:30', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '20:30', is_dinner_closed: false },
  { id: 120, restaurant_id: 15, day_of_week: 7, is_closed: false, lunch_start: '10:00', lunch_end: '13:30', is_lunch_closed: false, dinner_start: '17:00', dinner_end: '20:30', is_dinner_closed: false },
]

// メニューのアレルギー情報
export const dish_allergy:Dish_allergy[] = [
  { id: 1, dish: 1, allergy: 6 },   // ハンバーグ → 卵
  { id: 2, dish: 1, allergy: 7 },   // ハンバーグ → 乳
  { id: 3, dish: 1, allergy: 16 },  // ハンバーグ → 牛肉
  { id: 4, dish: 2, allergy: 4 },   // パスタ → 小麦
  { id: 5, dish: 2, allergy: 7 },   // パスタ → 乳
  { id: 6, dish: 3, allergy: 16 },  // ステーキ → 牛肉
  { id: 7, dish: 4, allergy: 1 },   // パエリア → えび
  { id: 8, dish: 4, allergy: 2 },   // パエリア → かに
  { id: 9, dish: 5, allergy: 16 },  // ステーキ → 牛肉
  { id: 10, dish: 6, allergy: 16 }, // ステーキ → 牛肉
  { id: 11, dish: 7, allergy: 16 }, // ステーキ → 牛肉
  { id: 12, dish: 8, allergy: 16 }, // ステーキ → 牛肉
  { id: 13, dish: 9, allergy: 16 }, // ステーキ → 牛肉
  { id: 14, dish: 10, allergy: 16 },// ステーキ → 牛肉
  { id: 15, dish: 11, allergy: 16 },// ステーキ → 牛肉
  { id: 16, dish: 12, allergy: 16 },// ステーキ → 牛肉
  { id: 17, dish: 13, allergy: 1 }, // パエリア → えび
  { id: 18, dish: 14, allergy: 11 },// 刺身盛り合わせ → いか
  { id: 19, dish: 14, allergy: 18 },// 刺身盛り合わせ → さけ
  { id: 20, dish: 14, allergy: 12 },// 刺身盛り合わせ → いくら
]

// アレルギー
export const allergy:Allergy[] = [
  {id:1,name:'えび',},
  {id:2,name:'かに',},
  {id:3,name:'くるみ',},
  {id:4,name:'小麦',},
  {id:5,name:'そば',},
  {id:6,name:'卵',},
  {id:7,name:'乳',},
  {id:8,name:'落花生(ピーナッツ)',},
  {id:9,name:'アーモンド',},
  {id:10,name:'あわび',},
  {id:11,name:'いか',},
  {id:12,name:'いくら',},
  {id:13,name:'オレンジ',},
  {id:14,name:'カシューナッツ',},
  {id:15,name:'キウイフルーツ',},
  {id:16,name:'牛肉',},
  {id:17,name:'ごま',},
  {id:18,name:'さけ',},
  {id:19,name:'さば',},
  {id:20,name:'大豆',},
  {id:21,name:'鶏肉',},
  {id:22,name:'バナナ',},
  {id:23,name:'豚肉',},
  {id:24,name:'マカダミアナッツ',},
  {id:25,name:'もも',},
  {id:26,name:'やまいも',},
  {id:27,name:'りんご',},
  {id:28,name:'ゼラチン',},
]

// 店舗アクセス履歴
export const restaurantAccessLogs: RestaurantAccessLog[] = [
  { restaurant_id: 1, date: '2025-08-25', count: 35 },
  { restaurant_id: 1, date: '2025-08-26', count: 42 },
  { restaurant_id: 1, date: '2025-08-27', count: 50 },
  { restaurant_id: 2, date: '2025-08-25', count: 20 },
  { restaurant_id: 2, date: '2025-08-26', count: 25 },
  { restaurant_id: 3, date: '2025-08-25', count: 15 },
];

// メニューアクセス履歴
export const menuAccessLogs: MenuAccessLog[] = [
  { restaurant_id: 1, dish_id: 1, date: '2025-08-25', count: 10 },
  { restaurant_id: 1, dish_id: 2, date: '2025-08-25', count: 5 },
  { restaurant_id: 1, dish_id: 13, date: '2025-08-26', count: 7 },
  { restaurant_id: 1, dish_id: 14, date: '2025-08-27', count: 12 },
  { restaurant_id: 2, dish_id: 4, date: '2025-08-25', count: 3 },
  { restaurant_id: 2, dish_id: 5, date: '2025-08-25', count: 2 },
  { restaurant_id: 3, dish_id: 7, date: '2025-08-26', count: 4 },
];

// 人気メニューランキング
export const popularMenus: PopularMenu[] = [
  { restaurant_id: 1, dish_id: 14, total_count: 25 },
  { restaurant_id: 1, dish_id: 1, total_count: 22 },
  { restaurant_id: 1, dish_id: 13, total_count: 15 },
  { restaurant_id: 2, dish_id: 4, total_count: 10 },
  { restaurant_id: 3, dish_id: 7, total_count: 8 },
];

// 数値集計
export const storeStatistics: StoreStatistics[] = [
  { restaurant_id: 1, total_restaurant_access: 127, total_menu_access: 59, total_dishes: 6 },
  { restaurant_id: 2, total_restaurant_access: 45, total_menu_access: 5, total_dishes: 3 },
  { restaurant_id: 3, total_restaurant_access: 15, total_menu_access: 4, total_dishes: 3 },
];

// 3DスキャンAPIに接続するタスクIDを管理
export const apiserialize: ApiSerialize[] = [
  {
    id:1,
    dish_id:1,
    serialize:'f5e9101a49ea4a3493d1bb4a09ac03ee'
  }
];