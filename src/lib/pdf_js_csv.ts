export interface TableRow {
  [key: string]: string;
}

export async function extractTableFromPdf(
  arrayBuffer: ArrayBuffer,
  onPageProcessed?: (pageNumber: number) => void
): Promise<string[][]> {
  if (typeof window === 'undefined') return [];
  const pdfjsLib = await import('pdfjs-dist');
  const pdfjs = pdfjsLib.default || pdfjsLib;
  
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const allRows: string[][] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];

    if (items.length > 0) {
      // Sort items by Y coordinate (descending) and then X coordinate (ascending)
      const sortedItems = items.sort((a, b) => {
        const yDiff = b.transform[5] - a.transform[5];
        if (Math.abs(yDiff) > 5) return yDiff;
        return a.transform[4] - b.transform[4];
      });

      let currentRow: string[] = [];
      let lastY = sortedItems[0].transform[5];

      for (const item of sortedItems) {
        const y = item.transform[5];

        if (Math.abs(y - lastY) > 5) {
          if (currentRow.length > 0) {
            allRows.push(currentRow);
          }
          currentRow = [item.str];
          lastY = y;
        } else {
          currentRow.push(item.str);
        }
      }

      if (currentRow.length > 0) {
        allRows.push(currentRow);
      }
    }

    if (onPageProcessed) {
      onPageProcessed(i);
    }
  }

  return allRows;
}
