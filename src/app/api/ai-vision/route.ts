import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
    try {
        const { imageUrl, category } = await req.json();

        if (!imageUrl) {
            console.error("AI Route Error: No Image URL provided.");
            return NextResponse.json({ error: "Image URL required" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("AI Route Error: GEMINI_API_KEY is missing in .env.local file!");
            return NextResponse.json({ error: "API Key is missing in .env.local" }, { status: 500 });
        }

        console.log("Fetching image from URL:", imageUrl);
        const imageResp = await fetch(imageUrl);
        if (!imageResp.ok) {
             console.error("AI Route Error: Failed to fetch image. Status:", imageResp.statusText);
             return NextResponse.json({ error: "Failed to download image from URL" }, { status: 500 });
        }

        const arrayBuffer = await imageResp.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');
        const mimeType = imageResp.headers.get('content-type') || 'image/jpeg';

        const genAI = new GoogleGenerativeAI(apiKey);
        
        // 🚀 FIX YAHAN HAI: Model ka naam update kar diya gaya hai
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const prompt = `You are a luxury fashion and watch expert for the brand AURA-X. Look at this image of a ${category || 'product'}.
        Provide a JSON response with these exact keys:
        "name": A catchy, premium luxury name for this product (e.g. "Royal Oak Midnight"). Max 4 words.
        "description": A beautifully written 2-line premium description highlighting its elegance and craftsmanship.
        "dialColor": Guess the main dial color (only if it's a watch, otherwise empty string).
        "strapColor": Guess the strap/band color (otherwise empty string).
        "strapMaterial": Guess the material (Leather, Metal, Silicon, Stainless Steel, etc, otherwise empty string).
        "caseColor": Guess the main case body color (Silver, Gold, Rose Gold, Black, etc, otherwise empty string).

        Return ONLY a valid JSON object. Do not include markdown formatting.`;

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType
            }
        };

        console.log("Sending image to Google Gemini AI...");
        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();
        console.log("Raw Gemini Response:", responseText);

        let cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const jsonStartIndex = cleanedText.indexOf('{');
        const jsonEndIndex = cleanedText.lastIndexOf('}');
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
             cleanedText = cleanedText.substring(jsonStartIndex, jsonEndIndex + 1);
        }

        const specs = JSON.parse(cleanedText);
        console.log("Successfully parsed AI Data!");

        return NextResponse.json({ success: true, specs });

    } catch (error: any) {
        console.error("🔥 CRITICAL AI ERROR 🔥:", error.message || error);
        return NextResponse.json({ error: error.message || "Failed to analyze image" }, { status: 500 });
    }
}