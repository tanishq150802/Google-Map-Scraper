import pandas as pd
# df=df.reset_index(drop=True)
df=pd.read_csv("huge.csv")
df=df.reset_index(drop=True)

import re

new=df
for i in new.index:
  if pd.isna(new['phone'][i])==True and pd.isna(new['description'][i])==False:
    x = re.findall('^.*\s([\d\s]{6})\s.*$', new['description'][i])
    y = re.findall('^.*(\d{5}).*$', new['description'][i])
    if(len(x)==1 and len(y)==1):
       new['phone'][i]=x[0]+y[0]
data=new.copy()
data=data.drop(['placeUrl','dataId','openState','description'], axis=1)
d= data.dropna(axis=0, subset=['phone'])
for i in d.index:
  if(d['phone'][i][0]=='O' or d['phone'][i][0]=='C'):
    d=d.drop(i)
print(len(d))
d.to_csv('end.csv')