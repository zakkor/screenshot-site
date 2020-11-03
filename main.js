import { firefox } from 'playwright';
import fs from 'fs';

const SIZES = [
  { width: 375, height: 812 },
  { width: 1440, height: 791 },
  { width: 1920, height: 1080 },
];

let websites = [
  {
    name: 'Name',
    url: 'localhost:3000',
    pages: [
      '/',
    ]
  },
];

let zap = [
  '.selector',
];

let changeStyles = {
  '.selector': {
    flexShrink: 0,
  }
};

(async () => {
  fs.mkdirSync('dist', { recursive: true });

  const browser = await firefox.launch();
  const context = await browser.newContext({ deviceScaleFactor: 3 });
  const page = await context.newPage();

  // await page.exposeBinding('changeStyles', () => changeStyles);

  for (const size of SIZES) {
    await page.setViewportSize({ width: size.width, height: size.height });

    for (const site of websites) {
      fs.mkdirSync(`dist/${site.name}/${size.width}x${size.height}`, { recursive: true });

      for (const p of site.pages) {
        await page.goto(`${site.url}${p}`);
        await page.waitForTimeout(5000);

        // Remove elements by selector.
        for (const z of zap) {
          const handle = await page.$(z);
          if (handle) {
            await page.evaluateHandle(el => {
              el.remove();
            }, handle);
            await page.waitForTimeout(500);
            await handle.dispose();
          }
        }

        // Manipulate styles before screenshotting.
        // for (const selector of Object.keys(changeStyles)) {
        //   const handles = await page.$$(selector);
        //   for (const handle of handles) {
        //     await page.evaluateHandle(el => {
        //       const changeStyles = window.changeStyles();
        //       for (const [selector, style] of Object.entries(changeStyles)) {
        //         if (!el.matches(selector)) {
        //           continue;
        //         }

        //         for (const [prop, val] of Object.entries(style)) {
        //           el.style[prop] = val;
        //         }
        //       }
        //     }, handle);
        //     await handle.dispose();
        //   }
        // }
        await page.waitForTimeout(300);

        await page.screenshot({ path: `dist/${site.name}/${size.width}x${size.height}/${routeToName(p)}.png`, fullPage: true });
      }
    }
  }
 
  await browser.close();
})();

function routeToName(r) {
  r = r.replace(/\?/g, '_');
  r = r.slice(1);
  if (r === '') {
    r = 'index';
  }
  return r;
}