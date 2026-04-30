import fs from 'fs';
import path from 'path';

const locales = ['en', 'es', 'fr', 'pt-PT', 'pt-BR', 'it'];

locales.forEach(locale => {
  const filePath = path.join('messages', `${locale}.json`);
  if (!fs.existsSync(filePath)) return;

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const tools = data.Tools;

  if (tools['excel-csv-desc']) {
    if (!tools['excel-to-csv-desc']) {
      tools['excel-to-csv-desc'] = tools['excel-csv-desc'];
    }
    if (!tools['csv-to-excel-desc']) {
      tools['csv-to-excel-desc'] = tools['excel-csv-desc'];
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Updated ${locale}.json`);
});
