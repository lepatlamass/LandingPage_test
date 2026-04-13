import { NextRequest, NextResponse } from 'next/server';
import { getAi } from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { base64Image, mimeType, options } = body;

    const ai = getAi();
    if (!ai) {
      return NextResponse.json(
        { error: 'AI not initialized' },
        { status: 500 }
      );
    }

    const parts: any[] = [
      {
        inlineData: {
          data: base64Image.split(',')[1] || base64Image,
          mimeType,
        },
      },
    ];

    if (options?.backgroundImageBase64 && options?.backgroundMimeType) {
      parts.push({
        inlineData: {
          data: options.backgroundImageBase64.split(',')[1] || options.backgroundImageBase64,
          mimeType: options.backgroundMimeType,
        },
      });
      parts.push({
        text: options.prompt || "Remove the background of the first image and replace it with the second image.",
      });
    } else {
      parts.push({
        text: options?.prompt || "Remove the background of this image and return the subject on a transparent background.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return NextResponse.json({
          result: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`
        });
      }
    }

    return NextResponse.json(
      { error: 'No image returned from AI' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Background removal error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process image' },
      { status: 500 }
    );
  }
}
