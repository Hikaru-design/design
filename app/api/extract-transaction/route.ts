import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { ExtractedTransaction } from "@/lib/types";

const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const DEFAULT_CATEGORY_LIST = `food（食費）
utilities（光熱費）
subscription（サブスク）
entertainment（エンタメ）
self-investment（自己投資）
medical（医療）
transport（交通）
daily（日用品）
rent（家賃）
other（その他支出）
salary（給与）
bonus（賞与）
other-income（その他収入）`;

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "リクエストの読み取りに失敗しました" }, { status: 400 });
  }

  const imageEntry = formData.get("image");
  if (!imageEntry || !(imageEntry instanceof File)) {
    return NextResponse.json({ error: "画像が見つかりません" }, { status: 400 });
  }

  const file = imageEntry;

  if (!SUPPORTED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "対応していないファイル形式です（jpeg / png / webp / gif）" }, { status: 415 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "画像サイズが大きすぎます（最大5MB）" }, { status: 413 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "サービスの設定に問題があります" }, { status: 500 });
  }

  let base64Data: string;
  try {
    const arrayBuffer = await file.arrayBuffer();
    base64Data = Buffer.from(arrayBuffer).toString("base64");
  } catch {
    return NextResponse.json({ error: "画像の読み取りに失敗しました" }, { status: 500 });
  }

  const today = new Date().toISOString().split("T")[0];
  const prompt = `画像（レシート・支払い確認画面など）から取引情報を抽出し、以下のJSONのみを返してください。JSONの前後に説明文を含めないでください。

{
  "type": "expense" または "income",
  "date": "YYYY-MM-DD形式（画像から読み取れない場合は今日の日付: ${today}）",
  "amount": 数値（円・整数・税込み合計、読み取れない場合はnull）,
  "category": 以下のIDの中から最も適切なもの,
  "memo": "店名または説明（最大50文字）"
}

カテゴリID一覧:
${DEFAULT_CATEGORY_LIST}

注意: amountは税込み合計金額を使用。必ずJSONのみ返すこと。`;

  const anthropic = new Anthropic({ apiKey });

  let rawText: string;
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
                data: base64Data,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "画像から取引情報を読み取れませんでした" }, { status: 422 });
    }
    rawText = content.text;
  } catch {
    return NextResponse.json({ error: "読み取りサービスが一時的に利用できません" }, { status: 502 });
  }

  // Strip markdown fences if present
  const cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

  let data: ExtractedTransaction;
  try {
    data = JSON.parse(cleaned);
  } catch {
    return NextResponse.json({ error: "画像から取引情報を読み取れませんでした" }, { status: 422 });
  }

  return NextResponse.json(data);
}
