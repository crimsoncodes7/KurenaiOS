(()=>{KOS.ai.CATEGORIES.forEach(c=>KOS.ai.setRouting(c,'ollama','fake-model'));
window.__calls=[];
KOS.ai._config({fetch:(url,opts)=>{let body={};try{body=JSON.parse(opts.body)}catch(e){}; window.__calls.push(String(url));
 if(/api\/tags|api\/version|api\/show/.test(url)) return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve({models:[{name:'fake-model'}],version:'0.9'}),text:()=>Promise.resolve('{}')});
 const msgs=body.messages||[]; const last=msgs[msgs.length-1]||{}; const user=[...msgs].reverse().find(m=>m.role==='user')||{};
 let message;
 if(last.role==='tool'){ message={role:'assistant',content:'Done. Here is a summary:\n\n| Subject | Hours |\n|---|---|\n| CS | 3.5 |\n| Maths | 2 |\n\n```csharp\nint x = 1;\n```\n\n- one\n- two'}; }
 else if(/delete/i.test(user.content||'')) message={role:'assistant',content:'',tool_calls:[{function:{name:'todo_delete_task',arguments:{id:1}}}]};
 else if(/add/i.test(user.content||'')) message={role:'assistant',content:'',tool_calls:[{function:{name:'todo_add_task',arguments:{text:'Revise BFS and DFS'}}}]};
 else message={role:'assistant',content:'A long answer. '.repeat(60)};
 return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve({message,done_reason:'stop',prompt_eval_count:10,eval_count:20}),text:()=>Promise.resolve(JSON.stringify({message}))});
}}); return 'faked'})()
