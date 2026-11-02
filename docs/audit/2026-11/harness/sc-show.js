const f=process.argv[2];const j=require(f);
for(const[k,v] of Object.entries(j)){const is=v.issues.filter(i=>!/ 1x1 |skip-link|k-search-input|menu-label|sr-only/.test(i));console.log(k,"->",v.hash,"doc",v.doc,"main",v.main);is.forEach(i=>console.log("   ",i))}
