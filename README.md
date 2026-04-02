<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6afa583f-f6d8-442f-94ad-b3104e048107

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Customizing Section Images

To replace the Unsplash placeholder images in the **"Built for Every Need"** section with your own custom images:

1. **Upload your images** to the `public/` directory (e.g., `public/business.png`, `public/student.jpg`).
2. **Open the file:** `src/app/[locale]/page.tsx`
3. **Locate and update the `src` attribute** for the following lines:

| Section | Current Line (approx.) | `src` to Replace |
| :--- | :--- | :--- |
| **For Businesses** | Line 257 | `https://images.unsplash.com/photo-1664575602276...` |
| **For Accountants** | Line 279 | `https://images.unsplash.com/photo-1554224155-8d04cb21cd6c...` |
| **For Students** | Line 301 | `https://images.unsplash.com/photo-1523240795612-9a054b0db644...` |
| **For Designers** | Line 323 | `https://images.unsplash.com/photo-1561070791-2526d30994b5...` |

### Example Change:
In `src/app/[locale]/page.tsx`, change:
```tsx
// Before (Line 257)
src="https://images.unsplash.com/photo-1664575602276-acd073f104c1..."

// After (Using your own image in public/ folder)
src="/business.png"
```
