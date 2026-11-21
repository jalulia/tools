import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
const code=fs.readFileSync(new URL('./count.js',import.meta.url),'utf8');
function boot({hash='',saved={},blocked=false,webdriver=false,framed=false}={}){
 const events={},requests=[],nodes=new Map();
 function element(tag){return {tag,children:[],style:{},setAttribute(){},appendChild(el){this.children.push(el);if(el.id)nodes.set(el.id,el);},addEventListener(){},remove(){nodes.delete(this.id);}}}
 const body=element('body');
 const localStorage={getItem(k){if(blocked)throw Error('blocked');return saved[k]||null},setItem(k,v){if(blocked)throw Error('blocked');saved[k]=v},removeItem(k){if(blocked)throw Error('blocked');delete saved[k]}};
 const document={body,referrer:'',getElementById:id=>nodes.get(id),createElement:element,addEventListener(n,f){(events[n]??=[]).push(f)}};
 const location={hostname:'jalulia.github.io',pathname:'/tools/test/',hash,search:''};
 const ctx={document,location,localStorage,navigator:{webdriver},history:{replaceState(){}},innerWidth:1200,URL,Math,Date,setTimeout,clearTimeout,fetch(u,o){requests.push({url:u,...JSON.parse(o.body)});return Promise.resolve({ok:true})},addEventListener(n,f){(events[n]??=[]).push(f)}};
 ctx.window=ctx;ctx.top=framed?{}:ctx;
 vm.runInNewContext(code,ctx);
 return {saved,requests,nodes,emit(n,e){for(const f of events[n]||[])f(e)},location};
}
function field(){return {type:'range',tagName:'INPUT',value:'10',classList:{contains(){return false}},matches(){return true},closest(){return null},labels:[{textContent:'Width'}],getAttribute(){return null}}}
test('ordinary visitor: view and control event still recorded',()=>{const b=boot();b.emit('change',{isTrusted:true,target:field()});assert.equal(b.requests.length,2)});
test('exclusion link suppresses its own page view and persists',()=>{const saved={};const b=boot({hash:'#analytics=exclude',saved});assert.equal(b.requests.length,0);assert.equal(saved['tools.analytics.exclude'],'1');assert.equal(boot({saved}).requests.length,0)});
test('CMS token still excludes views and control events',()=>{const b=boot({saved:{'tools.token':'test'}});b.emit('change',{isTrusted:true,target:field()});assert.equal(b.requests.length,0)});
test('status page reports exclusion and records nothing',()=>{const b=boot({hash:'#analytics=status',saved:{'tools.analytics.exclude':'1'}});assert.equal(b.requests.length,0);assert.match(b.nodes.get('tools-analytics-preference').children[0].textContent,/excluded/)});
test('include takes effect on next load, not settings visit',()=>{const saved={'tools.analytics.exclude':'1'};assert.equal(boot({hash:'#analytics=include',saved}).requests.length,0);assert.equal(boot({saved}).requests.length,1)});
test('include cannot override CMS exclusion',()=>{const saved={'tools.token':'test','tools.analytics.exclude':'1'};const b=boot({hash:'#analytics=include',saved});assert.match(b.nodes.get('tools-analytics-preference').children[0].textContent,/excluded/);assert.equal(boot({saved}).requests.length,0)});
test('storage failure is explicit and setup visit stays excluded',()=>{const b=boot({hash:'#analytics=exclude',blocked:true});assert.equal(b.requests.length,0);assert.match(b.nodes.get('tools-analytics-preference').children[0].textContent,/failed/)});
test('already-open tab stops sending when another tab excludes browser',()=>{const saved={};const b=boot({saved});saved['tools.analytics.exclude']='1';b.emit('change',{isTrusted:true,target:field()});assert.equal(b.requests.length,1)});
test('hash exclusion runs before route analytics',()=>{const b=boot();b.location.hash='#analytics=exclude';b.emit('hashchange',{});b.emit('change',{isTrusted:true,target:field()});assert.equal(b.requests.length,1)});
test('automated and framed pages remain excluded',()=>{assert.equal(boot({webdriver:true}).requests.length,0);assert.equal(boot({framed:true}).requests.length,0)});
