import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 🚀 1. HEALTH CHECK: Browser mein link open kar ke check karne ke liye
export async function GET() {
    const apiKey = process.env.GEMINI_API_KEY;
    return NextResponse.json({
        status: "🟢 API IS ALIVE AND WORKING!",
        model_name: "gemini-1.5-flash",
        is_api_key_added_in_vercel: !!apiKey,
        message: "Agar is_api_key_added_in_vercel 'true' hai, toh Vercel par key theek se lag gayi hai!"
    });
}

// 🚀 2. MAIN AI FUNCTION
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { imageUrl, category } = body;

        if (!imageUrl) {
            return NextResponse.json({ error: "Image URL is missing" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // Yeh error tab aayega jab Vercel mein API key nahi hogi
            return NextResponse.json({ error: "Vercel par GEMINI_API_KEY add nahi hui!" }, { status: 500 });
        }

        // Image Download from Cloudinary/Supabase
        const imageResp = await fetch(imageUrl);
        if (!imageResp.ok) {
             return NextResponse.json({ error: `Image fetch failed: ${imageResp.statusText}` }, { status: 500 });
        }

        const arrayBuffer = await imageResp.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');
        const mimeType = imageResp.headers.get('content-type') || 'image/jpeg';

        // Initialize Official Gemini Model
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a luxury fashion and watch expert. Look at this image of a ${category || 'product'}.
        Provide a JSON response with these exact keys:
        "name": A catchy, premium luxury name for this product (Max 4 words).
        "description": A 2-line premium description highlighting its elegance.
        "dialColor": Guess the main dial color (only if it's a watch).
        "strapColor": Guess the strap/band color.
        "strapMaterial": Guess the material (Leather, Metal, Silicon, Stainless Steel).
        "caseColor": Guess the main case body color.
        Return ONLY a valid JSON object.`;

        const imagePart = {
            inlineData: { data: base64Image, mimeType }
        };

        // Get AI Response
        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        // Clean and Parse JSON
        let cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonStartIndex = cleanedText.indexOf('{');
        const jsonEndIndex = cleanedText.lastIndexOf('}');
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
             cleanedText = cleanedText.substring(jsonStartIndex, jsonEndIndex + 1);
        }

        const specs = JSON.parse(cleanedText);
        return NextResponse.json({ success: true, specs });

    } catch (error: any) {
        // 🚀 AB BROWSER KO EXACT ERROR MILEGA
        console.error("AI CRASH:", error.message || error);
        return NextResponse.json({ 
            success: false, 
            error: "AI Error: " + (error.message || String(error))
        }, { status: 500 });
    }
}