import { GoogleGenAI } from "@google/genai";

export const getAi = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateContent = async (prompt: string, modelName: string = "gemini-3-flash-preview") => {
  const ai = getAi();
  if (!ai) return null;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
  });

  return response.text;
};

/**
 * Server-side background removal (for use in API routes or server components).
 */
export const processBackgroundRemovalServer = async (
  base64Image: string,
  mimeType: string,
  options: { prompt?: string; backgroundImageBase64?: string; backgroundMimeType?: string }
) => {
  const ai = getAi();
  if (!ai) throw new Error("AI not initialized");

  const parts: any[] = [
    {
      inlineData: {
        data: base64Image.split(',')[1] || base64Image,
        mimeType,
      },
    },
  ];

  if (options.backgroundImageBase64 && options.backgroundMimeType) {
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
      text: options.prompt || "Remove the background of this image and return the subject on a transparent background.",
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: { parts },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image returned from AI");
};

/**
 * Client-side background removal (proxies through API route to avoid COOP/COEP issues).
 */
export const processBackgroundRemoval = async (
  base64Image: string,
  _mimeType: string,
  options: { prompt?: string; backgroundImageBase64?: string; backgroundMimeType?: string }
): Promise<string> => {
  const response = await fetch('/api/tools/background-removal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Image, mimeType: _mimeType, options }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to process image');
  }

  return data.result;
};

export const processImageToText = async (base64: string, mimeType: string, mode: string) => {
  const ai = getAi();
  if (!ai) throw new Error("AI not initialized");

  let prompt = "Extract all text from this image.";
  if (mode === 'handwriting') {
    prompt = "Extract handwritten text from this image accurately.";
  } else if (mode === 'receipt') {
    prompt = "Extract text from this receipt, keeping the structure and formatting.";
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64.split(',')[1] || base64,
            mimeType,
          },
        },
        { text: prompt },
      ],
    },
  });

  return response.text || "";
};

export const processWatermarkRemoval = async (originalBase64: string, maskBase64: string) => {
  const ai = getAi();
  if (!ai) throw new Error("AI not initialized");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        {
          inlineData: {
            data: originalBase64.split(',')[1] || originalBase64,
            mimeType: "image/jpeg",
          },
        },
        {
          inlineData: {
            data: maskBase64.split(',')[1] || maskBase64,
            mimeType: "image/png",
          },
        },
        { text: "Remove the watermark indicated by the mask from the image." },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image returned from AI");
};
