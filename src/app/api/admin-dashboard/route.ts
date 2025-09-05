import { NextRequest, NextResponse } from "next/server";
import type { Restaurants,Categories,Reataurants_Categories,User } from "@/data/types";
import { restaurants,categories, reataurants_categories,users } from "@/data/mockData";

export const dynamic = "force-dynamic";

