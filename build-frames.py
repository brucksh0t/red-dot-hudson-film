# Red Dot r7 scrub frames from Red Dot's full-size photos. Every output pixel is drawn from >=1 source pixel (crop >= output; no upscale).
import os,sys,shutil
from PIL import Image
from concurrent.futures import ProcessPoolExecutor
S='/workspace/rd6/src/';O='/workspace/revenue-ops/funnel/hudson/v5/red-dot-film/frames/'
BAR='spots_63_5f9b86b31749b09b43e5ff3283a00b.jpg';FR='spots_6b_d7ba0c532947debe063317f74c6696.jpg';BR='spots_79_3e16ef4cef4fe582ae876ba454ba24.jpg'
def ease(t):return t*t*(3-2*t)
# name, tier, src, W, H, n, box0, box1   (boxes in source px: l,t,r,b)
JOBS=[('hero','m',BAR,390,694,90,(380,0,770,694),(1132,0,1522,694)),            # lateral truck along the bar, BAR sign to the flowers, 1.0 src px / output px
      ('hero','t',BAR,760,694,90,(0,0,760,694),(762,0,1522,694)),            # tablet portrait: lateral truck along the whole bar, 1.0 src px / output px
      ('hero','d',BAR,1100,600,90,(0,0,1272,694),(422,94,1522,694)),         # push-in (1.16x) while trucking right
      ('frites','m',FR,560,1212,72,(0,0,615,1331),(820,80,1380,1292)),       # push-in + pan across the plate
      ('frites','d',FR,1600,900,72,(0,0,2000,1125),(250,260,1850,1160)),     # push-in 1.25x
      ('brunch','m',BR,560,1212,72,(1385,0,2000,1331),(380,80,940,1292)),    # pan right-to-left + push
      ('brunch','d',BR,1600,900,72,(0,206,2000,1331),(400,120,2000,1020))]   # pan + push
def one(a):
    name,tier,src,W,H,n,b0,b1,k=a;im=Image.open(S+src).convert('RGB');t=ease(k/(n-1));b=tuple(b0[i]+(b1[i]-b0[i])*t for i in range(4))
    assert b[2]-b[0]>=W-.01 and b[3]-b[1]>=H-.01 and b[0]>=0 and b[1]>=0 and b[2]<=im.width and b[3]<=im.height,(name,tier,k,b)
    f=im.resize((W,H),Image.LANCZOS,box=b);s='%03d'%(k+1);d=O+name+'/'
    f.save(d+tier+'/'+s+'.webp',quality=74,method=5)
    if k%3==0 or k==n-1:f.save(d+tier+'q/'+s+'.webp',quality=30,method=5)
    if k%6==0 or k==n-1:f.save(d+tier+'t/'+s+'.webp',quality=6,method=5)
    return (b[2]-b[0])/W
if __name__=='__main__':
    if os.path.exists(O):shutil.rmtree(O)
    tasks=[]
    for j in JOBS:
        for x in ('','q','t'):os.makedirs(O+j[0]+'/'+j[1]+x,exist_ok=True)
        tasks+= [j+(k,) for k in range(j[5])]
    with ProcessPoolExecutor(8) as ex:r=list(ex.map(one,tasks,chunksize=4))
    print('min src px per output px',min(r))
    for n in ('hero','frites','brunch'):
        for t in (('m','t','d') if n=='hero' else ('m','d')):shutil.copy(O+n+'/'+t+'/001.webp',O+n+'/poster-'+t+'.webp')
