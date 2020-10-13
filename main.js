import { firefox } from 'playwright';
import fs from 'fs';

const SIZES = [
  { width: 375, height: 812 },
  { width: 1440, height: 791 },
  { width: 1920, height: 1080 },
];

let websites = [
  {
    name: 'WebsiteName',
    url: 'https://example.com',
    pages: [
      '/',
      '/page',
      '/page/15',
    ]
  },
];

(async () => {
  fs.mkdirSync('dist', { recursive: true });

  const browser = await firefox.launch();
  const context = await browser.newContext({ deviceScaleFactor: 3 });
  const page = await context.newPage();
  for (const size of SIZES) {
    await page.setViewportSize({ width: size.width, height: size.height });

    for (const site of websites) {
      fs.mkdirSync(`dist/${site.name}/${size.width}x${size.height}`, { recursive: true });

      for (const p of site.pages) {
        await page.goto(`${site.url}${p}`);
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `dist/${site.name}/${size.width}x${size.height}/${routeToName(p)}.png`, fullPage: true });
      }
    }
  }
 
  await browser.close();
})();

function routeToName(r) {
  r = r.replace(/\//g, '_');
  r = r.slice(1);
  if (r === '') {
    r = 'index';
  }
  return r;
}