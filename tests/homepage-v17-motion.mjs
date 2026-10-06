import playwright from '../../playtime/node_modules/playwright/index.js';
import fs from 'node:fs';

const url=process.env.HOMEPAGE_URL||'http://127.0.0.1:8787/';
const output=process.env.HOMEPAGE_QA_OUTPUT||'output/playwright/homepage-v17-motion';
fs.mkdirSync(output,{recursive:true});
const browser=await playwright.chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1920,height:1080},recordVideo:{dir:output,size:{width:1920,height:1080}}});
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{
  window.motionMetrics={cls:0,lcp:0,longTasks:[]};
  new PerformanceObserver(list=>list.getEntries().forEach(e=>{if(!e.hadRecentInput)window.motionMetrics.cls+=e.value;})).observe({type:'layout-shift',buffered:true});
  new PerformanceObserver(list=>list.getEntries().forEach(e=>window.motionMetrics.lcp=e.startTime)).observe({type:'largest-contentful-paint',buffered:true});
  new PerformanceObserver(list=>list.getEntries().forEach(e=>window.motionMetrics.longTasks.push(e.duration))).observe({type:'longtask',buffered:true});
});
await page.goto(url,{waitUntil:'networkidle'});
await page.screenshot({path:`${output}/hero.png`});
for(let i=0;i<24;i++){await page.mouse.wheel(0,110);await page.waitForTimeout(65);}
await page.waitForTimeout(450);
await page.screenshot({path:`${output}/assembled.png`});
for(let i=0;i<24;i++){await page.mouse.wheel(0,-110);await page.waitForTimeout(65);}
await page.locator('.partner-orbit').scrollIntoViewIfNeeded();
await page.waitForTimeout(220);
await page.mouse.move(5,100);
const orbitCenter=await page.evaluate(()=>{const axis=document.querySelector('.partner-orbit-axis').getBoundingClientRect(),copy=document.querySelector('.partner-orbit .trust-copy').getBoundingClientRect();return {axis:[axis.left+axis.width/2,axis.top+axis.height/2],copy:[copy.left+copy.width/2,copy.top+copy.height/2]}});
if(Math.abs(orbitCenter.axis[0]-orbitCenter.copy[0])>1||Math.abs(orbitCenter.axis[1]-orbitCenter.copy[1])>1)throw Error(`partner copy is not centered: ${JSON.stringify(orbitCenter)}`);
const orbitBefore=await page.evaluate(()=>({phase:document.querySelector('.logo-row').dataset.orbitPhase,transforms:[...document.querySelectorAll('.partner-orbit .logo-card')].map(e=>getComputedStyle(e).transform),quality:[...document.querySelectorAll('.partner-orbit .logo-card img')].map(e=>({alt:e.alt,natural:[e.naturalWidth,e.naturalHeight],rendered:[e.getBoundingClientRect().width,e.getBoundingClientRect().height]}))}));
await page.waitForTimeout(700);
const orbitAfter=await page.evaluate(()=>({phase:document.querySelector('.logo-row').dataset.orbitPhase,transforms:[...document.querySelectorAll('.partner-orbit .logo-card')].map(e=>getComputedStyle(e).transform)}));
if(!orbitBefore.phase||orbitBefore.phase===orbitAfter.phase||orbitBefore.transforms.every((v,i)=>v===orbitAfter.transforms[i]))throw Error('partner orbit did not move');
if(orbitBefore.quality.some(x=>x.natural[0]+1<x.rendered[0]||x.natural[1]+1<x.rendered[1]))throw Error(`logo upscaled beyond source: ${JSON.stringify(orbitBefore.quality)}`);
await page.locator('.partner-orbit .trust-copy').hover();
const backgroundBefore=await page.locator('.logo-row').getAttribute('data-orbit-phase');
await page.waitForTimeout(500);
const backgroundAfter=await page.locator('.logo-row').getAttribute('data-orbit-phase');
if(backgroundBefore===backgroundAfter||await page.locator('.partner-orbit').evaluate(e=>e.classList.contains('is-paused')))throw Error('partner orbit paused outside a card');
const hoverCardBox=await page.locator('.logo-card').first().boundingBox();
if(!hoverCardBox)throw Error('partner card has no hover target');
await page.mouse.move(hoverCardBox.x+hoverCardBox.width/2,hoverCardBox.y+hoverCardBox.height/2);
await page.waitForTimeout(100);
const pausedBefore=await page.locator('.logo-row').getAttribute('data-orbit-phase');
await page.waitForTimeout(500);
const pausedAfter=await page.locator('.logo-row').getAttribute('data-orbit-phase');
if(pausedBefore!==pausedAfter||!await page.locator('.partner-orbit').evaluate(e=>e.classList.contains('is-paused')))throw Error('partner orbit did not pause on card hover');
await page.mouse.move(0,0);await page.waitForTimeout(300);
await page.screenshot({path:`${output}/partner-orbit.png`});
const cases=[];
const count=await page.locator('.case-track').count();
for(let i=0;i<count;i++){
  await page.locator('.case-track').nth(i).evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-110,behavior:'instant'}));
  await page.waitForTimeout(180);
  const before=await page.locator('.case-card').nth(i).locator('.case-screen,.phone').first().evaluate(e=>getComputedStyle(e).transform);
  for(let j=0;j<8;j++){await page.mouse.wheel(0,55);await page.waitForTimeout(70);}
  const sample=await page.locator('.case-card').nth(i).evaluate(e=>({phase:e.dataset.casePhase,top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom,transform:getComputedStyle(e.querySelector('.case-screen,.phone')).transform}));
  if(before===sample.transform||sample.top<77||sample.bottom>1080)throw Error(`case ${i} motion/layout: ${JSON.stringify(sample)}`);
  cases.push(sample);
  await page.screenshot({path:`${output}/case-${i}.png`});
}
await page.locator('.model-track').evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-80,behavior:'instant'}));
for(let i=0;i<22;i++){await page.mouse.wheel(0,66);await page.waitForTimeout(75);}
await page.screenshot({path:`${output}/trust.png`});
await page.locator('#roadmap').scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const metrics=await page.evaluate(()=>window.motionMetrics);
if(metrics.cls>.1)throw Error(`unexpected layout shift: ${metrics.cls}`);
const sweep=[];
for(const size of [{width:1600,height:900},{width:1366,height:768},{width:1100,height:700},{width:1024,height:768},{width:390,height:844},{width:360,height:740}]){
  await page.setViewportSize(size);
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.waitForTimeout(100);
  const checks=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,heroBottom:document.querySelector('.hero-actions').getBoundingClientRect().bottom,desktop:document.documentElement.classList.contains('story-desktop')}));
  if(checks.overflow>1||checks.desktop&&checks.heroBottom>size.height)throw Error(`viewport ${JSON.stringify({size,checks})}`);
  sweep.push({size,...checks});
}
await page.emulateMedia({reducedMotion:'reduce'});
if(await page.locator('html').evaluate(e=>e.classList.contains('story-desktop')))throw Error('reduced motion not respected');
await context.close();
const staticContext=await browser.newContext({javaScriptEnabled:false,viewport:{width:1920,height:1080}});
const staticPage=await staticContext.newPage();
await staticPage.goto(url);
if(!await staticPage.locator('h1').isVisible()||await staticPage.locator('.model-pie').count()!==3)throw Error('no JS content fallback');
await staticContext.close();
await browser.close();
if(errors.length)throw Error(JSON.stringify(errors));
const results={orbit:{before:orbitBefore,after:orbitAfter,center:orbitCenter,backgroundContinues:backgroundBefore!==backgroundAfter,cardPaused:pausedBefore===pausedAfter},cases,sweep,metrics,errors};
fs.writeFileSync(`${output}/motion-results.json`,JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
