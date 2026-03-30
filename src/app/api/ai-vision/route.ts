import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { imageUrl, category } = body;

        if (!imageUrl) {
            return NextResponse.json({ error: "Image URL nahi mili front-end se." }, { status: 400 });
        }

        // 1. API Key Check
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // Agar yeh error aaye, toh iska matlab Vercel mein key nahi hai ya Redeploy nahi hua!
            return NextResponse.json({ error: "Vercel par GEMINI_API_KEY add nahi hui, ya Redeploy nahi kiya gaya!" }, { status: 500 });
        }

        // 2. Fetch Image
        const imageResp = await fetch(imageUrl);
        if (!imageResp.ok) {
             return NextResponse.json({ error: "Cloudinary se image fetch nahi ho saki." }, { status: 500 });
        }

        const arrayBuffer = await imageResp.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');
        const mimeType = imageResp.headers.get('content-type') || 'image/jpeg';

        // 3. AI Processing
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

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

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        let cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonStartIndex = cleanedText.indexOf('{');
        const jsonEndIndex = cleanedText.lastIndexOf('}');
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
             cleanedText = cleanedText.substring(jsonStartIndex, jsonEndIndex + 1);
        }

        const specs = JSON.parse(cleanedText);
        return NextResponse.json({ success: true, specs });

    } catch (error: any) {
        // 🚀 AB EXACT ERROR RESPONSE MEIN AAYEGA
        return NextResponse.json({ 
            error: "Backend Error: " + (error.message || String(error)),
            details: "Check Vercel Runtime Logs for full stack trace."
        }, { status: 500 });
    }
}