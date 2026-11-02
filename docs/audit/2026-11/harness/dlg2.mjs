const pages = await fetch("http://127.0.0.1:9302/json").then(r=>r.json());
const p = pages.find(p=>p.type==="page" && p.url.includes(":9102/"));
console.log(p && p.url);
const ws = new WebSocket(p.webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener("open",r,{once:true}));
ws.addEventListener("message",e=>console.log(String(e.data).slice(0,300)));
ws.send(JSON.stringify({id:1,method:"Page.enable"}));
ws.send(JSON.stringify({id:2,method:"Page.handleJavaScriptDialog",params:{accept:true}}));
setTimeout(()=>process.exit(0),2000);
