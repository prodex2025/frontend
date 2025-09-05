// src/app/api/dishes/[id]/video/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dishes } from "@/data/mockData";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const target = dishes.find((d) => d.id === id);
    if (!target) {
      return NextResponse.json({ error: "dish not found" }, { status: 404 });
    }

    // video_url を更新（タスクID消したい場合は一緒に）
    if (typeof body.video_url === "string") target.video_url = body.video_url;
    if (body.video_task_id === null) (target as any).video_task_id = undefined;

    return NextResponse.json({ dish: target });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "update failed" }, { status: 500 });
  }
}