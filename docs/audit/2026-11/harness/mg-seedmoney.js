(async()=>{const M=KOS.money;const add=f=>new Promise(r=>M.addTx(f,(e,t)=>r(e?String(e):t)));
let seed=7;const rnd=()=>(seed=(seed*9301+49297)%233280)/233280;
const shops=[["Heron Foods","food",[2,9]],["Tesco Express","food",[3,15]],["Greggs","food",[2,6]],["Stagecoach","transport",[2,5]],["Steam","fun",[5,25]],["Amazon","shopping",[6,40]],["Boots","health",[3,12]],["Costa","food",[3,5]]];
const cats=M.categories({kind:"out"}).map(c=>c.id);let n=0;
for(let d=0;d<95;d++){const dt=new Date(2026,10,2);dt.setDate(dt.getDate()-d);const iso=dt.toISOString().slice(0,10);
 const k=Math.floor(rnd()*3);for(let i=0;i<k;i++){const s=shops[Math.floor(rnd()*shops.length)];const amt=(s[2][0]+rnd()*(s[2][1]-s[2][0])).toFixed(2);await add({date:iso,amount:amt,kind:"out",cat:cats.includes(s[1])?s[1]:"other",payee:s[0]});n++;}
 if(dt.getDate()===27) {await add({date:iso,amount:"450",kind:"in",payee:"Student Finance",cat:"other-in"});n++;}
 if(dt.getDay()===5){await add({date:iso,amount:"62.40",kind:"in",payee:"Part-time job",cat:"other-in"});n++;}}
M.addRule({name:"Spotify",payee:"Spotify",amount:"6.99",cat:cats.includes("bills")?"bills":"other",every:{n:1,unit:"month"},start:"2026-08-12",sub:true});
M.addRule({name:"Google One",payee:"Google One",amount:"1.59",cat:"bills",every:{n:1,unit:"month"},start:"2026-07-28",sub:true});
M.addRule({name:"Phone",payee:"Vodafone",amount:"10",cat:"bills",every:{n:1,unit:"month"},start:"2026-07-25"});
M.addRule({name:"Student Finance",kind:"in",amount:"450",every:{n:1,unit:"month"},start:"2026-09-27"});
const p=M.addPot({name:"New laptop for uni",targetAmount:"900",by:"2027-06-01",why:"The old one can't run Rider."});M.addPot({name:"Emergency",targetAmount:"300"});
await add({date:"2026-10-28",amount:"120",kind:"transfer",pot:p.id,dir:"in"});
M.setBudget("food","160");M.setBudget("transport","40");M.setBudget("fun","50");
KOS.store.save();return {n,cats}})()
