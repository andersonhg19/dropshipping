/**
 * Assign Unsplash fashion images to WooCommerce products without images
 * v2: Clears invalid image refs first, then assigns new images
 */
const http = require('http');

const WC_URL = 'localhost';
const WC_PORT = 8850;
const WC_KEY = process.env.WC_CONSUMER_KEY || (() => { throw new Error('Falta WC_CONSUMER_KEY. Uso: WC_CONSUMER_KEY=ck_... WC_CONSUMER_SECRET=cs_... node assign-images.js') })();
const WC_SECRET = process.env.WC_CONSUMER_SECRET;
const AUTH = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');

const CATEGORY_IMAGES = {
  'vestidos': [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80',
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80',
    'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800&q=80',
    'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=800&q=80',
    'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80',
  ],
  'blusas-y-camisas': [
    'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800&q=80',
    'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&q=80',
    'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80',
    'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&q=80',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
  ],
  'pantalones': [
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80',
    'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80',
  ],
  'pantalones-hombre': [
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80',
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
    'https://images.unsplash.com/photo-1519235106695-a4e0e9431f3f?w=800&q=80',
  ],
  'jeans': [
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',
    'https://images.unsplash.com/photo-1475178626620-a4d074967571?w=800&q=80',
    'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&q=80',
    'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&q=80',
  ],
  'jeans-hombre': [
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
    'https://images.unsplash.com/photo-1475178626620-a4d074967571?w=800&q=80',
    'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&q=80',
    'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=800&q=80',
  ],
  'faldas': [
    'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80',
    'https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=800&q=80',
    'https://images.unsplash.com/photo-1592301933927-35b597393c0a?w=800&q=80',
    'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d44?w=800&q=80',
  ],
  'chaquetas': [
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
    'https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800&q=80',
    'https://images.unsplash.com/photo-1544923246-77307dd270b9?w=800&q=80',
  ],
  'chaquetas-hombre': [
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&q=80',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  ],
  'camisetas': [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80',
  ],
  'camisas': [
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
    'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800&q=80',
    'https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=800&q=80',
  ],
  'ropa-deportiva': [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=800&q=80',
    'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&q=80',
    'https://images.unsplash.com/photo-1576633587382-13ddf37b1fc1?w=800&q=80',
  ],
  'ropa-deportiva-hombre': [
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&q=80',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
  ],
  'accesorios': [
    'https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=800&q=80',
    'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
  ],
  'accesorios-hombre': [
    'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    'https://images.unsplash.com/photo-1608505362930-d3ee5e104adb?w=800&q=80',
    'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80',
  ],
};

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
];

function wcRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: WC_URL,
      port: WC_PORT,
      path: `/wp-json/wc/v3${path}`,
      method: method,
      headers: {
        'Authorization': `Basic ${AUTH}`,
        'Content-Type': 'application/json',
      },
      timeout: 180000, // 3 min for image downloads
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Parse error: ${data.substring(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function getAllProducts() {
  let all = [];
  let page = 1;
  while (true) {
    console.log(`  Fetching page ${page}...`);
    const products = await wcRequest('GET', `/products?per_page=20&page=${page}`);
    if (!Array.isArray(products) || products.length === 0) break;
    all = all.concat(products);
    if (products.length < 20) break;
    page++;
  }
  return all;
}

async function main() {
  console.log('=== VISNEX Image Assigner v2 ===');
  console.log('Step 1: Fetching all products...');
  const products = await getAllProducts();
  console.log(`Total products: ${products.length}`);

  // Find products without valid images
  const noImage = products.filter(p => !p.images || p.images.length === 0);
  console.log(`Products without images: ${noImage.length}`);

  if (noImage.length === 0) {
    console.log('All products have images!');
    return;
  }

  console.log(`\nStep 2: Assigning images (this will take a while - WP downloads each image)...`);

  const counters = {};
  let updated = 0;
  let errors = 0;

  for (const product of noImage) {
    const catSlug = product.categories && product.categories.length > 0
      ? product.categories[0].slug : 'default';
    const images = CATEGORY_IMAGES[catSlug] || DEFAULT_IMAGES;
    if (!counters[catSlug]) counters[catSlug] = 0;
    const imgUrl = images[counters[catSlug] % images.length];
    counters[catSlug]++;

    try {
      // First clear any broken image refs
      await wcRequest('PUT', `/products/${product.id}`, { images: [] });

      // Then set new image
      const result = await wcRequest('PUT', `/products/${product.id}`, {
        images: [{ src: imgUrl, alt: product.name }]
      });

      if (result.images && result.images.length > 0) {
        updated++;
        console.log(`[${updated}/${noImage.length}] OK: ${product.name} (${catSlug})`);
      } else if (result.code) {
        errors++;
        console.log(`[ERR] ${product.name}: ${result.message}`);
      } else {
        errors++;
        console.log(`[ERR] ${product.name}: No image in response`);
      }

      // Small delay between requests
      await sleep(300);
    } catch (e) {
      errors++;
      console.log(`[ERR] ${product.name}: ${e.message}`);
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`Updated: ${updated}, Errors: ${errors}`);
}

main().catch(e => console.error('Fatal:', e));
