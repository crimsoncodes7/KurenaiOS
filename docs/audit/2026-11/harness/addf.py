import json,sys
S="/private/tmp/claude-501/-Users-fj-Developer-KurenaiOS---Web/083a292e-9158-4ad4-8d86-0c9b8abd3917/scratchpad/qa/shots/shop-cosmetics"
F="/private/tmp/claude-501/-Users-fj-Developer-KurenaiOS---Web/083a292e-9158-4ad4-8d86-0c9b8abd3917/scratchpad/qa/findings/shop-cosmetics.jsonl"
src=sys.stdin.read().replace("$S",S)
objs=json.loads(src)
if isinstance(objs,dict): objs=[objs]
with open(F,"a") as f:
  for o in objs: f.write(json.dumps(o,ensure_ascii=False)+"\n")
print(len(open(F).readlines()))
