import fs from 'node:fs';
import {existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const localPW=new URL('../../playtime/node_modules/playwright/index.mjs',import.meta.url);
const worktreePW=new URL('../../../playtime/node_modules/playwright/index.mjs',import.meta.url);
const {chromium,webkit}=await import(existsSync(localPW)?localPW:worktreePW);
const base=process.env.HOMEPAGE_URL||'http://127.0.0.1:8789/';
const out=process.env.HOMEPAGE_QA_OUTPUT||'output/playwright/v77-local';
fs.mkdirSync(out,{recursive:true});
const results=[];
for(const [engine,type,width,height,lang] of [[chromium,'chromium',390,844,''],[chromium,'chromium',360,740,'en/'],[chromium,'chromium',1920,1080,''],[chromium,'chromium',1920,1080,'en/'],[webkit,'webkit',390,844,''],[webkit,'webkit',390,844,'en/']]){
 const browser=await engine.launch({headless:true});
 const context=await browser.newContext({viewport:{width,height},isMobile:width<821,hasTouch:width<821,deviceScaleFactor:1});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 // Do not submit real leads or pollute analytics while checking layout and interactions.
 await page.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
 await page.goto(new URL(lang,base).href,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.documentElement.classList.contains('full-scripts-ready'));
 await page.waitForFunction(()=>document.querySelector('.case-switcher-panel.is-active img').naturalWidth>1);
 const initial=await page.evaluate(()=>({marker:document.querySelector('meta[name="timux-build"]').content,overflow:document.documentElement.scrollWidth-innerWidth,hero:[...document.querySelectorAll('.case-switcher-panel.is-active img')].map(i=>({nw:i.naturalWidth,nh:i.naturalHeight,w:i.getBoundingClientRect().width,h:i.getBoundingClientRect().height,fit:getComputedStyle(i).objectFit})),order:[...document.querySelectorAll('main section[id]')].map(e=>e.id)}));
 assert.equal(initial.overflow,0);assert.match(initial.marker,/v77/);assert(initial.order.indexOf('outcomes')<initial.order.indexOf('solutions'));
 const im=initial.hero[0];if(width<821)assert(Math.abs(im.w/im.h-im.nw/im.nh)<.02);else assert.equal(im.fit,'contain');
 const label=`${type}-${width}-${lang?'en':'zh'}`;
 await page.screenshot({path:`${out}/${label}-hero.png`});
 await page.locator('#hero-case-tab-property').click();
 await page.waitForFunction(()=>document.querySelector('#hero-case-panel-property img').naturalWidth>1);
 await page.locator('#hero-case-tab-manufacturing').click();
 await page.locator('#solutions').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>document.querySelector('.solution-scene img').naturalWidth>1);
 const scene=await page.locator('.solution-scene img').evaluate(i=>({nw:i.naturalWidth,nh:i.naturalHeight,w:i.getBoundingClientRect().width,h:i.getBoundingClientRect().height}));assert(Math.abs(scene.w/scene.h-scene.nw/scene.nh)<.01);
 if(width<821){
  for(let i=0;i<4;i++){
   await page.locator('.mobile-solution-tabs button').nth(i).click();
   await page.waitForFunction(i=>{const grid=document.querySelector('.solution-grid');const cards=[...grid.children];return Math.abs(grid.scrollLeft-(cards[i].offsetLeft-cards[0].offsetLeft))<3},i);
   assert.equal(await page.locator('.mobile-solution-tabs button').nth(i).getAttribute('aria-selected'),'true');
  }
  await page.locator('.mobile-solution-tabs button').nth(0).click();
  await page.waitForFunction(()=>document.querySelector('.solution-grid').scrollLeft<3);
  // Touch gesture must also update the category, not only button clicks.
  if(type==='chromium'){
   const grid=await page.locator('.solution-grid').boundingBox();
   const cdp=await context.newCDPSession(page);const y=Math.min(height-130,Math.max(150,grid.y+100));
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:width-55,y}]});
   for(let x=width-55;x>=40;x-=25)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   await page.waitForFunction(()=>Number(document.querySelector('.mobile-solution-tabs').dataset.active)>0);
   await page.waitForTimeout(700); // Allow real touch inertia to settle before the next independent action.
  }
  await page.locator('.mobile-solution-tabs button').nth(0).click();
  await page.waitForFunction(()=>document.querySelector('.solution-grid').scrollLeft<3);
  await page.evaluate(()=>window.scrollTo({top:document.querySelector('.mobile-solution-tabs').getBoundingClientRect().top+scrollY-90,behavior:'instant'}));
 }else await page.evaluate(()=>window.scrollTo({top:document.querySelector('#solutions').getBoundingClientRect().top+scrollY-80,behavior:'instant'}));
 await page.waitForTimeout(650); // Capture the settled scroll-snap position, not a transition frame.
 await page.screenshot({path:`${out}/${label}-solutions.png`});
 await page.locator('#solution-customer>a').click();
 await page.waitForFunction(()=>!!document.querySelector('#workflow')?.value);
 assert.equal(await page.locator('#leadEmail').getAttribute('required'),'');
 await page.waitForFunction(()=>{const r=document.querySelector('#contact').getBoundingClientRect();return r.top<innerHeight-100&&r.bottom>80});
 await page.waitForTimeout(700);
 assert.equal(await page.locator('.mobile-contact-bar').isVisible(),false);
 await page.screenshot({path:`${out}/${label}-contact.png`});
 assert.deepEqual(errors,[]);
 results.push({label,initial,scene,heroSwitch:true,categories:true,workflowPrefill:true,errors});
 fs.writeFileSync(`${out}/results.json`,JSON.stringify({base,checkedAt:new Date().toISOString(),results},null,2));
 await browser.close();
 console.log('PASS',label);
}
// A missing WebP must fall back to the original JPEG without waiting for full styles/scripts.
{
 const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.route('**/manufacturing-order-delivery*.webp',r=>r.abort());
 await page.route('**/site-home-full-v73.css*',r=>r.abort());
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>{const i=document.querySelector('.case-switcher-panel img');return i.naturalWidth>1&&i.currentSrc.endsWith('.jpg')});
 const fallback=await page.locator('.case-switcher-panel img').first().evaluate(i=>({src:i.currentSrc,w:i.naturalWidth,h:i.naturalHeight,render:i.getBoundingClientRect().toJSON()}));
 results.push({fallback,fullStylesUnavailable:true});await page.screenshot({path:`${out}/fallback-no-full-css.png`});await browser.close();console.log('PASS JPEG fallback without full CSS');
}
fs.writeFileSync(`${out}/results.json`,JSON.stringify({base,checkedAt:new Date().toISOString(),results},null,2));
