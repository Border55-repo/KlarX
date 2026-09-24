import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile,readdir} from 'node:fs/promises';
import vm from 'node:vm';
test('retired site ships only Kova Companion migration pages and legacy workers',async()=>{
  execFileSync(process.execPath,['scripts/build.mjs']);
  assert.deepEqual((await readdir('dist')).sort(),['404.html','index.html','kova','sw.js']);
  const admin=await readFile('dist/kova/admin/index.html','utf8');
  assert.match(admin,/KOVA-Companion-Android\/admin\//);
  assert.match(admin,/destination.search=location.search/);
  const handlers={};
  vm.runInNewContext(await readFile('dist/kova/sw.js','utf8'),{URL,Response,self:{addEventListener:(n,fn)=>handlers[n]=fn}});
  let response;
  handlers.fetch({request:{mode:'navigate',url:'https://border55-repo.github.io/KlarX/kova/admin/?x=1'},respondWith:p=>response=p});
  assert.equal((await response).headers.get('Location'),'https://border55-repo.github.io/KOVA-Companion-Android/admin/?x=1');
});
