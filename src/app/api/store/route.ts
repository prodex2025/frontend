// src/app/api/store/route.ts

import { restaurants, categories, reataurants_categories, restaurants_business_calendar } from "@/data/mockData";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");

  // 詳細取得
  if (idParam) {
    const id = parseInt(idParam, 10);
    const restaurant = restaurants.find(r => r.id === id);

    if (!restaurant) {
      return NextResponse.json({ error: "店舗が見つかりません" }, { status: 404 });
    }

    const categoryIds = reataurants_categories
      .filter(rc => rc.restaurant_id === id)
      .map(rc => rc.category_id);

    const categoryNames = categories
      .filter(c => categoryIds.includes(c.id))
      .map(c => c.name);

     // 営業時間を取得
    const businessHours = restaurants_business_calendar.filter(
      (b) => b.restaurant_id === id
    );

    return NextResponse.json({
      ...restaurant,
      categories: categoryNames,
      image_detail_url: restaurant.image_detail_url || "/default-detail-shop.png",
      business_hours: businessHours,
    });
  }

  // 一覧取得
  const keyword = searchParams.get("keyword")?.toLowerCase() ?? "";
  const categoriesFilterRaw = searchParams.get("categories") ?? "";
  const categoriesFilter = categoriesFilterRaw
    ? categoriesFilterRaw.split(",").map(cat => cat.trim())
    : [];

  // 店舗名で絞り込み
  let filteredStores = restaurants.filter(store =>
    store.name.toLowerCase().includes(keyword)
  );

  // カテゴリーフィルタリング
  filteredStores = filteredStores.filter(store => {
    const storeCategoryIds = reataurants_categories
      .filter(rc => rc.restaurant_id === store.id)
      .map(rc => rc.category_id);

    const storeCategoryNames = categories
      .filter(cat => storeCategoryIds.includes(cat.id))
      .map(cat => cat.name);

    if (categoriesFilter.length === 0) return true;

    return categoriesFilter.some(filterCat => storeCategoryNames.includes(filterCat));
  });

  // カテゴリー名もセットして返す
  const result = filteredStores.map(store => {
    const storeCategoryIds = reataurants_categories
      .filter(rc => rc.restaurant_id === store.id)
      .map(rc => rc.category_id);

    const storeCategoryNames = categories
      .filter(cat => storeCategoryIds.includes(cat.id))
      .map(cat => cat.name);

    return {
      ...store,
      categories: storeCategoryNames,
      imageUrl: store.image_url || '/default-shop.png',
    };
  });

  return NextResponse.json({
    stores: result,      // 絞り込み済みの店舗データ
    categories: categories,  // カテゴリ一覧そのまま全部返す
  });
}
