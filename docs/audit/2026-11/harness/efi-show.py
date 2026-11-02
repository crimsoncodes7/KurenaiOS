import json,sys
d=json.load(open(sys.argv[1]))
for k,v in d.items():
  iss=[i for i in v['issues'] if 'Notifications' not in i and 'sr-only' not in i and 'k-ex-file' not in i and 'files.input' not in i]
  print(k,'|',v['t'],'|doc',v['doc'],v['main'],'n',len(iss)); [print('   ',i) for i in iss[:16]]
