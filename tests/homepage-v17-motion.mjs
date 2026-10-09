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
const orbitCenter=await page.evaluate(()=>{const axisElement=document.querySelector('.partner-orbit-axis'),axis=axisElement.getBoundingClientRect(),copy=document.querySelector('.partner-orbit .trust-copy').getBoundingClientRect();return {axis:[axis.left+axis.width/2,axis.top+axis.height/2],copy:[copy.left+copy.width/2,copy.top+copy.height/2],centerDot:getComputedStyle(axisElement,'::after').content}});
if(Math.abs(orbitCenter.axis[0]-orbitCenter.copy[0])>1||Math.abs(orbitCenter.axis[1]-orbitCenter.copy[1])>1||orbitCenter.centerDot!=='none')throw Error(`partner center regression: ${JSON.stringify(orbitCenter)}`);
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
const mjDepthSamples=[];
const count=await page.locator('.case-track').count();
for(let i=0;i<count;i++){
  await page.locator('.case-track').nth(i).evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-110,behavior:'instant'}));
  await page.waitForTimeout(180);
  const before=i===0
    ? await page.locator('[data-case-replay]').getAttribute('data-replay-sequence')
    : await page.locator('.case-card').nth(i).locator('.case-screen,.phone').first().evaluate(e=>getComputedStyle(e).transform);
  for(let j=0;j<8;j++){await page.mouse.wheel(0,55);await page.waitForTimeout(70);}
  const sample=await page.locator('.case-card').nth(i).evaluate(e=>({phase:e.dataset.casePhase,top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom,transform:e.querySelector('.case-screen,.phone')?getComputedStyle(e.querySelector('.case-screen,.phone')).transform:null,replaySequence:e.querySelector('[data-case-replay]')?.dataset.replaySequence||null}));
  if(sample.top<77||sample.bottom>1080||i>0&&before===sample.transform)throw Error(`case ${i} motion/layout: ${JSON.stringify(sample)}`);
  if(i===0){
    const replayProgress=[];
    for(const [q,expected,messages] of [[.16,'1',1],[.52,'3',2],[.88,'5',3],[.16,'1',1],[.88,'5',3]]){
      await page.evaluate(q=>{
        const track=document.querySelector('#case-southeast').parentElement,rect=track.getBoundingClientRect();
        scrollTo({top:rect.top+scrollY-80+q*Math.max(1,rect.height-innerHeight+80),behavior:'instant'});
      },q);
      await page.waitForTimeout(180);
      const state=await page.locator('[data-case-replay]').evaluate(element=>({sequence:element.dataset.replaySequence,stage:element.dataset.replayStage,visibleMessages:element.querySelectorAll('.replay-message.is-visible').length,activeSteps:element.closest('.case-card').querySelectorAll('.case-replay-step.replay-selected').length}));
      replayProgress.push(state.sequence);
      if(state.sequence!==expected||state.visibleMessages!==messages||state.activeSteps!==1)throw Error(`case replay scroll progression invalid at ${q}: ${JSON.stringify(state)}`);
    }
    sample.replaySequence=`${before}->${replayProgress.join('->')}`;
  }
  cases.push(sample);
  await page.screenshot({path:`${output}/case-${i}.png`});
}
for(const [q,expectedNear] of [[0,0],[.5,1],[1,2]]){
  await page.evaluate(q=>{
    const track=document.querySelector('#case-mj').parentElement,rect=track.getBoundingClientRect();
    scrollTo({top:rect.top+scrollY-80+q*Math.max(1,rect.height-innerHeight+80),behavior:'instant'});
  },q);
  await page.waitForTimeout(180);
  const state=await page.locator('#case-mj').evaluate(card=>{
    const phones=[...card.querySelectorAll('.phone')];
    const visual=card.querySelector('.case-visual').getBoundingClientRect();
    const info=card.querySelector('.case-info').getBoundingClientRect();
    return {
      ratio:visual.width/info.width,
      scales:phones.map(phone=>Number(getComputedStyle(phone).getPropertyValue('--screen-scale'))),
      widths:phones.map(phone=>phone.getBoundingClientRect().width),
      z:phones.map(phone=>Number(getComputedStyle(phone).getPropertyValue('--screen-z').replace('px','')))
    };
  });
  const actualNear=state.scales.indexOf(Math.max(...state.scales));
  if(state.ratio<1.95||actualNear!==expectedNear||state.scales[expectedNear]-Math.min(...state.scales)<.33||state.widths[expectedNear]/Math.min(...state.widths)<1.65||state.z[expectedNear]<30){
    throw Error(`MJ phone depth/layout invalid at ${q}: ${JSON.stringify({expectedNear,actualNear,state})}`);
  }
  mjDepthSamples.push({q,expectedNear,...state});
}
async function sampleRoute(selector,points){
  const samples=[];
  for(const q of points){
    await page.evaluate(({selector,q})=>{
      const container=document.querySelector(selector),rect=container.getBoundingClientRect();
      const top=rect.top+scrollY,denominator=Math.min(rect.height+innerHeight*.2,innerHeight*.85);
      scrollTo({top:Math.max(0,top-innerHeight*.84+q*denominator),behavior:'instant'});
    },{selector,q});
    await page.waitForTimeout(140);
    samples.push(await page.locator(selector).evaluate(container=>{
      const cards=[...container.querySelectorAll(':scope > article')],route=container.previousElementSibling;
      return {
        current:cards.findIndex(card=>card.classList.contains('route-current')),
        complete:cards.filter(card=>card.classList.contains('route-complete')).length,
        upcoming:cards.filter(card=>card.classList.contains('route-upcoming')).length,
        dash:route.querySelector('.route-ink').style.strokeDashoffset,
        head:Number(route.querySelector('.route-head').getAttribute('cx')),
        states:cards.map(card=>({opacity:card.style.getPropertyValue('--step-opacity'),scale:card.style.getPropertyValue('--step-scale')}))
      };
    }));
  }
  if(samples.some((sample,index)=>sample.current!==index||sample.complete!==index||!sample.dash||!Number.isFinite(sample.head)))throw Error(`${selector} route progression invalid: ${JSON.stringify(samples)}`);
  return samples;
}
const adoptionProgression=await sampleRoute('.adoption-path',[.12,.5,.88]);
await page.screenshot({path:`${output}/adoption-progression.png`});
const roadmapProgression=await sampleRoute('.phase-grid',[.12,.38,.63,.88]);
await page.screenshot({path:`${output}/roadmap-progression.png`});
await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
await page.waitForTimeout(100);
const reversedRoute=await sampleRoute('.phase-grid',[.12]);
if(reversedRoute[0].current!==0)throw Error(`route did not reverse: ${JSON.stringify(reversedRoute)}`);
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
await page.waitForTimeout(100);
if(await page.locator('[data-case-replay]').getAttribute('data-replay-sequence')!=='5')throw Error('case replay reduced-motion fallback incomplete');
await context.close();
const staticContext=await browser.newContext({javaScriptEnabled:false,viewport:{width:1920,height:1080}});
const staticPage=await staticContext.newPage();
await staticPage.goto(url);
if(!await staticPage.locator('h1').isVisible()||await staticPage.locator('.model-pie').count()!==3)throw Error('no JS content fallback');
await staticContext.close();
await browser.close();
if(errors.length)throw Error(JSON.stringify(errors));
const results={orbit:{before:orbitBefore,after:orbitAfter,center:orbitCenter,backgroundContinues:backgroundBefore!==backgroundAfter,cardPaused:pausedBefore===pausedAfter},cases,mjDepthSamples,adoptionProgression,roadmapProgression,reversedRoute,sweep,metrics,errors};
fs.writeFileSync(`${output}/motion-results.json`,JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
