import * as pdfjsLib from 'pdfjs-dist';

export interface TableRow {
  [key: string]: string;
}

export async function extractTableFromPdf(arrayBuffer: ArrayBuffer): Promise<string[][]> {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const allRows: string[][] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];

    if (items.length === 0) continue;

    // Sort items by Y coordinate (descending) and then X coordinate (ascending)
    // Transform matrix: [scaleX, skewY, skewX, scaleY, translateX, translateY]
    // transform[5] is Y, transform[4] is X
    const sortedItems = items.sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5];
      if (Math.abs(yDiff) > 5) return yDiff; // Threshold for same row
      return a.transform[4] - b.transform[4];
    });

    let currentRow: string[] = [];
    let lastY = sortedItems[0].transform[5];

    for (const item of sortedItems) {
      const x = item.transform[4];
      const y = item.transform[5];

      if (Math.abs(y - lastY) > 5) {
        // New row
        if (currentRow.length > 0) {
          allRows.push(currentRow);
        }
        currentRow = [item.str];
        lastY = y;
      } else {
        // Same row
        // Check if there's a significant gap between items (could be a new column)
        // This is a simple heuristic. A more complex one would involve calculating column boundaries.
        currentRow.push(item.str);
      }
    }

    if (currentRow.length > 0) {
      allRows.push(currentRow);
    }
  }

  return allRows;
}
