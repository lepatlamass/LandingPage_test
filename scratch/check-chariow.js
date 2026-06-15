import fs from 'fs';

// Parse .env.local manually
const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n');
for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx > 0) {
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    process.env[key] = val;
  }
}

const CHARIOW_BASE_URL = 'https://api.chariow.com/v1';
const MONTHLY_PRODUCT_ID = 'prd_zvd1cf';
const YEARLY_PRODUCT_ID = 'prd_ge7e1g';

async function testProduct(productId) {
  const apiKey = process.env.CHARIOW_API_KEY;
  console.log(`Testing product: ${productId} with API key starting with: ${apiKey ? apiKey.substring(0, 10) : 'none'}`);
  
  try {
    const res = await fetch(`${CHARIOW_BASE_URL}/products/${productId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    
    console.log(`Response status: ${res.status} ${res.statusText}`);
    const json = await res.json();
    console.log(`Response body:`, JSON.stringify(json, null, 2));
  } catch (err) {
    console.error(`Error fetching product:`, err);
  }
}

async function run() {
  await testProduct(MONTHLY_PRODUCT_ID);
  await testProduct(YEARLY_PRODUCT_ID);
}

run();
