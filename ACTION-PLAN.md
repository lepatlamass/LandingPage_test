# SEO Action Plan — refinedocs.com

This document outlines the prioritized action items to resolve the issues and capitalize on the opportunities identified in the [FULL-AUDIT-REPORT.md](file:///Users/cash/Documents/code/LandingPage_test/FULL-AUDIT-REPORT.md).

---

## 1. Quick Wins (High Impact, Low Effort)

These items can be fixed in under an hour and will immediately improve search visibility, usability, and authority.

### A) Optimize Title Tag
*   **Issue**: Title tag is 85 characters long and contains duplicate brand text.
*   **Action**: Change the homepage title tag to:
    ```html
    <title>Refinedocs: 100% Free Online Document & Image Tools</title>
    ```
*   **Impact**: Prevents truncation in Google SERPs, improving click-through rate (CTR).

### B) Fix H1 Heading Typo
*   **Issue**: Spacing typos in the main H1 tag (`OneDocument` and `ImageTools`).
*   **Action**: Correct the spacing in the HTML source:
    ```html
    <h1>All-in-One Document & Image Tools. 100% Free and Secure in the Browser.</h1>
    ```
*   **Impact**: Improves immediate content readability and signals higher professional quality.

### C) Add `aria-label` to Social Icon Links
*   **Issue**: Personal LinkedIn, X, and YouTube icon links are wrapped in `<a>` tags with no readable text.
*   **Action**: Add descriptive `aria-label` values:
    ```html
    <a href="https://www.linkedin.com/in/konwolorentz/" aria-label="Lorentz Konwo on LinkedIn" rel="noopener noreferrer">...</a>
    <a href="https://x.com/LorentzKonwo" aria-label="Lorentz Konwo on X" rel="noopener noreferrer">...</a>
    <a href="https://www.youtube.com/@konwolorentz7285" aria-label="Lorentz Konwo on YouTube" rel="noopener noreferrer">...</a>
    ```
*   **Impact**: Resolves critical accessibility (a11y) issues and passes text context to crawlers.

### D) Update Root Redirect (HTTP 307 to 301/308)
*   **Issue**: The root URL `https://refinedocs.com/` redirects to `https://refinedocs.com/en` via a 307 temporary redirect.
*   **Action**: Update the server configuration (e.g., in Next.js `next.config.js` or deployment settings) to return a 301 or 308 permanent redirect.
*   **Impact**: Consolidates PageRank and authority from the root domain to the language page.

### E) Create `/llms.txt` and `/llms-full.txt`
*   **Issue**: No `/llms.txt` file exists, leaving AI crawlers without a clear site summary.
*   **Action**: Create a `/llms.txt` file at the root containing:
    ```markdown
    # Refinedocs

    > 100% free online PDF, image, and conversion tools processed locally in the browser.

    ## Primary Tools
    - [PDF to Excel](https://refinedocs.com/en/tools/pdf-to-excel): Convert bank statements and invoices.
    - [PDF to Word](https://refinedocs.com/en/tools/pdf-to-word): Transform PDFs to editable Word documents.
    - [Background Remover](https://refinedocs.com/en/tools/bg-remover): Extract image backgrounds locally.
    - [Image Compressor](https://refinedocs.com/en/tools/compress-images): Optimize images for page speed.
    ```
*   **Impact**: Improves citation frequency and correctness in AI search engine responses (Gemini, ChatGPT, Perplexity).

---

## 2. Strategic Improvements (High Impact, Higher Effort)

These tasks require code orchestration, domain setup, or content creation.

### A) Setup Professional Branded Email
*   **Issue**: Using a generic Gmail address (`konwoubuntu@gmail.com`) for support.
*   **Action**: Set up custom domain email routing (e.g., `contact@refinedocs.com` or `support@refinedocs.com`) and update the mailto link.
*   **Impact**: Significantly improves E-E-A-T trust factors.

### B) Implement `SoftwareApplication` Structured Data
*   **Issue**: Missing structured schemas for the specific utility tools offered.
*   **Action**: Inject JSON-LD `SoftwareApplication` schemas on tool landing pages. E.g., for PDF to Excel:
    ```json
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Refinedocs PDF to Excel Converter",
      "operatingSystem": "All",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
    ```
*   **Impact**: Increases eligibility for rich tool features and software snippet rankings in search results.

### C) Configure Missing Security Headers
*   **Issue**: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy are missing.
*   **Action**: Inject headers via `next.config.js` or web server rules:
    ```js
    // example next.config.js headers
    module.exports = {
      async headers() {
        return [
          {
            source: '/(.*)',
            headers: [
              { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
              { key: 'X-Content-Type-Options', value: 'nosniff' },
              { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
            ]
          }
        ]
      }
    }
    ```
*   **Impact**: Strengthens site security against XSS/clickjacking and improves trust scores.

---

## 3. Maintenance and Performance (Medium Impact, Low Urgency)

These maintenance steps optimize UX and prevent future ranking erosion.

### A) Hardcode Width and Height on Image Tags
*   **Issue**: Images (SVGs) lack specific width/height dimensions, creating Cumulative Layout Shift (CLS) risks.
*   **Action**: Add explicit dimensions or aspect-ratio parameters directly on layout templates:
    ```html
    <img src="/Business.svg" alt="For Businesses" width="120" height="120" loading="lazy" />
    ```
*   **Impact**: Fixes Core Web Vitals layout shifts, providing a smoother user experience.

### B) Explicitly Manage AI Crawlers in `robots.txt`
*   **Issue**: Robots.txt leaves AI bots to inherit wildcard rules.
*   **Action**: Add explicit agent permissions or blocks:
    ```text
    User-agent: GPTBot
    Allow: /

    User-agent: ClaudeBot
    Allow: /
    ```
*   **Impact**: Ensures correct AI agent routing and crawler permission transparency.
