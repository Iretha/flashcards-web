import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdir,writeFile,readFile,lstat,realpath,rm } from 'node:fs/promises';
import { resolve,dirname,basename } from 'node:path';
const root=resolve('.wrangler');await mkdir(root,{recursive:true});const canonicalRoot=await realpath(root);
const owner=randomUUID(),storage=resolve(canonicalRoot,`v4-e2e-${owner}`);
await mkdir(storage);await writeFile(resolve(storage,'.owner'),owner);
let interrupted=false;
try {
 const child=spawn(process.execPath,['node_modules/@playwright/test/cli.js','test',...process.argv.slice(2)],{stdio:'inherit',env:{...process.env,FLASHCARDS_E2E_STORAGE:storage}});
 const interrupt=()=>{interrupted=true;child.kill('SIGINT')};process.on('SIGINT',interrupt);process.on('SIGTERM',interrupt);
 const code=await new Promise((ok,fail)=>{child.once('error',fail);child.once('close',code=>ok(code??1))});
 process.removeListener('SIGINT',interrupt);process.removeListener('SIGTERM',interrupt);process.exitCode=code;
}finally{
 if(interrupted||process.env.KEEP_E2E_STORAGE==='1')console.log(`Retained E2E storage: ${storage}`);
 else try {
  if(dirname(storage)!==canonicalRoot||!basename(storage).startsWith('v4-e2e-')||(await lstat(storage)).isSymbolicLink()||await realpath(storage)!==storage||await readFile(resolve(storage,'.owner'),'utf8')!==owner)throw new Error('Storage ownership check failed');
  await rm(storage,{recursive:true,maxRetries:10,retryDelay:200});
 }catch(error){console.error(`E2E cleanup failed (${error.code ?? 'ownership'}); inspect ${storage}`);process.exitCode=1}
}
