import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
    try {
        const { imageUrl, category } = await req.json();

        if (!imageUrl) {
            return NextResponse.json({ error: "Image URL required" }, { status: 400 });
        }

        // 🚀 1. Check API Key
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API Key is missing in .env.local" }, { status: 500 });
        }

        // 🚀 2. Download Image from URL and convert to Base64 (Gemini requirement)
        const imageResp = await fetch(imageUrl);
        const arrayBuffer = await imageResp.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');
        const mimeType = imageResp.headers.get('content-type') || 'image/jpeg';

        // 🚀 3. Initialize Google Gemini AI
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Fastest vision model

        // 🚀 4. Give AI strict instructions
        const prompt = `You are a luxury fashion and watch expert for the brand AURA-X. Look at this image of a ${category || 'product'}.
        Provide a JSON response with these exact keys:
        "name": A catchy, premium luxury name for this product (e.g. "Royal Oak Midnight"). Max 4 words.
        "description": A beautifully written 2-line premium description highlighting its elegance and craftsmanship.
        "dialColor": Guess the main dial color (only if it's a watch).
        "strapColor": Guess the strap/band color.
        "strapMaterial": Guess the material (Leather, Metal, Silicon, Stainless Steel, etc).
        "caseColor": Guess the main case body color (Silver, Gold, Rose Gold, Black, etc).

        Return ONLY a valid JSON object. Do not include markdown formatting like \`\`\`json.`;

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType
            }
        };

        // 🚀 5. Get response from Gemini
        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        // Clean up text just in case AI adds markdown formatting
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const specs = JSON.parse(cleanedText);

        return NextResponse.json({ success: true, specs });

    } catch (error) {
        console.error("AI Auto-Fill Error:", error);
        return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
    }
}