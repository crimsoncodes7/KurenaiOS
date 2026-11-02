import json,sys
S="audit-evidence/2026-11/qa/shots/shop-cosmetics"
F="audit-evidence/2026-11/qa/findings/shop-cosmetics.jsonl"
src=sys.stdin.read().replace("$S",S)
objs=json.loads(src)
if isinstance(objs,dict): objs=[objs]
with open(F,"a") as f:
  for o in objs: f.write(json.dumps(o,ensure_ascii=False)+"\n")
print(len(open(F).readlines()))
