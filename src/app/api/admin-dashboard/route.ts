import { NextRequest, NextResponse } from "next/server";
import type { Restaurants,Categories,Reataurants_Categories,User } from "@/data/types";
import { restaurants,categories, reataurants_categories,users } from "@/data/mockData";

export const dynamic = "force-dynamic";

// 検索テキスト、カテゴリ条件によるフィルタ結果を返す
export async function GET(req:Request){
  const { searchParams } = new URL(req.url);

  const searchText = searchParams.get("search")?.toLowerCase() || "";
  const categoryQuery = searchParams.get("categories");
  const selectedCategories = new Set(categoryQuery ? categoryQuery.split(",") : []);

  // レストランごとにカテゴリを紐づけて整形
  const formattedShops = restaurants.map((r) => {
    const relatedCategories = reataurants_categories
      .filter(rc => rc.restaurant_id === r.id)
      .map(rc => categories.find(c => c.id === rc.category_id)?.name || '');
    return {
      ...r,
      categories: relatedCategories,
    };
  });

  // 検索テキスト、カテゴリ条件でフィルタ処理
  const filteredShops = formattedShops.filter(shop => {
    // undefinedなら空配列にする
    const shopCategories = shop.categories || [];
    // カテゴリでフィルタ
    const matchesCategory =
      selectedCategories.size === 0 || 
      shopCategories.some(catName => selectedCategories.has(catName));
    
    // 検索バーのテキストで店舗名をフィルタ
    const matchesSearch = shop.name.toLowerCase().includes(searchText.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return NextResponse.json(filteredShops);
}