#!/bin/zsh
# usage: sc4.sh route size name [extra js] [theme]
Q=/private/tmp/claude-501/-Users-fj-Developer-KurenaiOS---Web/083a292e-9158-4ad4-8d86-0c9b8abd3917/scratchpad/qa
S=$Q/shots/shop-cosmetics
DISMISS="(async()=>{for(let i=0;i<30;i++){const b=[...document.querySelectorAll('.k-dialog-overlay button, [class*=ach] button')].find(b=>/^(Next|Done|Close|Later)$/.test(b.textContent.trim()));if(!b)break;b.click();await new Promise(r=>setTimeout(r,250));}document.querySelectorAll('[class*=ach-ping]').forEach(e=>e.remove());"
JS="${DISMISS}${4:-};return 1})()"
ARGS=()
[ -n "$5" ] && ARGS=(--theme $5)
node $Q/kos.mjs shot 4 "$1" $2 $S/$3.png --wait 1800 --js "$JS" $ARGS $6 | grep -v "^js:" | tail -4
