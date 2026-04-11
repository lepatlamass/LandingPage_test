const fs = require('fs');

function checkBalance(path) {
  const content = fs.readFileSync(path, 'utf8');
  let divCount = 0;
  let lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/<div/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    divCount += opens - closes;
    if (line.includes('DownloadGateModal')) {
      console.log(`Line ${i+1}: DownloadGateModal. Div depth is ${divCount}`);
    }
  }
}

checkBalance('/Users/cash/Documents/code/LandingPage_test/src/components/tools/CsvToExcel/CsvToExcelTool.tsx');
checkBalance('/Users/cash/Documents/code/LandingPage_test/src/components/tools/CompressPdf/CompressPdfTool.tsx');
