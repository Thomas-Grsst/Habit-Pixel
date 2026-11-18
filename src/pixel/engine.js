/* eslint-disable */
// Moteur pixel art procédural (porté depuis la maquette Habitudes Pixel).
const OUT='#0a0c12',BY=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]],TAU=Math.PI*2,sn=(f,n=8)=>Math.sin(f/n*TAU);
const R={leaf:['#1d4d2b','#2a7a3a','#3fa64a','#62d06a','#a6ef8a'],leafD:['#123620','#1a4f2a','#246b35','#348a44'],trunk:['#3b2416','#5a3a22','#7d5533','#9c7146'],grass:['#1f5a2e','#2f8a3c','#4fb84f','#86dd6a'],dirt:['#2b1b12','#4a3020','#6b4a2f','#8a6440'],rock:['#23262f','#3a3f4d','#59607a','#8089a0'],stone:['#3a3f50','#62697e','#949bb0','#c8cdd8'],blob:['#3a2463','#5b3d99','#8a63d2','#b392f0','#e3d4ff'],cosmic:['#0e0826','#22155a','#3d2c9c','#6a5ae0','#b8b0ff'],gold:['#7a4e12','#c08a22','#f2c94c','#fff0a8'],white:['#6f7a96','#b0bad0','#e2e8f4','#ffffff'],cyan:['#103a5a','#1c6a94','#36a8d0','#7fdcf0','#e0fbff'],pink:['#4a1640','#8a2a6e','#d0509a','#f29bc8','#ffe0f0'],violet:['#2a1450','#4a2a8a','#7a4fd0','#b392f0','#efe4ff'],ocean:['#0c2350','#14408a','#1f66c0','#3d93e0','#86c6f5'],land:['#1f5a26','#3f9440','#6cc05a','#a8e07a'],sand:['#8a7444','#bfa262','#e3cc8c'],red:['#5a1a1a','#9a2e2a','#d0503f','#f08a6a'],roof:['#4a1c22','#8a2e30','#c84a3c','#ef7a5a'],blue:['#1a2a6a','#2a4aa8','#4a78e0','#8ab0ff'],wall:['#8a7a5a','#c8b48a','#eadbb6','#fff6dc'],water:['#1c5a8a','#3d93e0','#7fd0f5','#e0f6ff'],fire:['#9a2e2a','#ef8a3c','#f6cf57','#fff6c0']};
const zmk=(w,h,ox=0,oy=0)=>({w,h,ox,oy,p:new Array(w*h).fill(null)});
const zpx=(b,x,y,c)=>{x=Math.floor(x+b.ox);y=Math.floor(y+b.oy);if(x>=0&&y>=0&&x<b.w&&y<b.h)b.p[y*b.w+x]=c};
const zget=(b,x,y)=>{x=Math.floor(x+b.ox);y=Math.floor(y+b.oy);return(x>=0&&y>=0&&x<b.w&&y<b.h)?b.p[y*b.w+x]:null};
function zpick(r,t,x,y){t=Math.max(0,Math.min(.999,t));const v=t*(r.length-1),i=Math.floor(v),f=v-i;return r[Math.min(r.length-1,i+(f*16>BY[((y%4)+4)%4][((x%4)+4)%4]+.5?1:0))]}
function zballFn(b,cx,cy,rx,ry,fn){for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){const nx=(x+.5-cx)/rx,ny=(y+.5-cy)/ry,d=nx*nx+ny*ny;if(d>1)continue;const t=(-nx*.5-ny*.62+Math.sqrt(1-d)*.6+.55)/1.6;const c=fn(x,y,t,nx,ny,d);if(c)zpx(b,x,y,c)}}
const zball=(b,cx,cy,rx,ry,r,clip)=>zballFn(b,cx,cy,rx,ry,(x,y,t)=>(!clip||clip(x,y))?zpick(r,t,x,y):null);
function zout(b,c=OUT){const q=b.p.slice(),W=b.w;for(let y=0;y<b.h;y++)for(let x=0;x<W;x++){if(q[y*W+x])continue;if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>{const X=x+dx,Y=y+dy;return X>=0&&Y>=0&&X<W&&Y<b.h&&q[Y*W+X]}))b.p[y*W+x]=c}}
function zurl(b){const c=document.createElement('canvas');c.width=b.w;c.height=b.h;const ctx=c.getContext('2d');b.p.forEach((col,i)=>{if(col){ctx.fillStyle=col;ctx.fillRect(i%b.w,Math.floor(i/b.w),1,1)}});return c.toDataURL()}
const zhash=(x,y,s)=>{const v=Math.sin(x*127.1+y*311.7+s*74.7)*43758.5453;return v-Math.floor(v)};
function znoise(x,y,s){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);const a=zhash(xi,yi,s),b=zhash(xi+1,yi,s),c=zhash(xi,yi+1,s),d=zhash(xi+1,yi+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function zline(b,x0,y0,x1,y1,c,th=1){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n;for(let k=0;k<th;k++)zpx(b,x+k,y,c)}}
let NOG=false;
function zground(b,cx,gy,rx){if(NOG)return;const depth=Math.max(4,rx*.55);for(let y=gy;y<=gy+depth;y++){const half=rx*Math.pow(1-(y-gy)/(depth+1),1.2);for(let x=Math.floor(cx-half);x<=Math.ceil(cx+half);x++)zpx(b,x,y,zpick(R.dirt,.75-(y-gy)/(depth*1.3)-((x-cx)/rx)*.35,x,y))}zball(b,cx,gy,rx,Math.max(2.5,rx*.22),R.grass);for(let x=Math.ceil(cx-rx+2);x<cx+rx-2;x+=3)if(zhash(x,gy,9)>.55)zpx(b,x,gy-Math.max(2.5,rx*.22)+Math.floor(zhash(x,1,2)*2)+1,'#a6ef8a')}
function ztrunk(b,cx,gy,h,w){for(let y=0;y<=h;y++){const ww=w*(1-.3*y/h),x0=cx-ww/2;for(let x=Math.round(x0);x<Math.round(x0+ww);x++)zpx(b,x,gy-y,zpick(R.trunk,.9-(x-x0)/ww*.75,x,gy-y))}if(w>=3){zpx(b,cx-w/2-1,gy,R.trunk[1]);zpx(b,cx+w/2,gy,R.trunk[0]);zpx(b,cx-w/2-2,gy+1,R.trunk[1]);zpx(b,cx+w/2+1,gy+1,R.trunk[0])}}
function zcan(b,cx,gy,back,front,f){const sw=sn(f);const S=(dy)=>Math.round(sw*Math.max(0,Math.min(1,(-dy-14)/18)));back.forEach(([dx,dy,r])=>zball(b,cx+dx+S(dy),gy+dy,r,r*.9,R.leafD));front.forEach(([dx,dy,r])=>zball(b,cx+dx+S(dy),gy+dy,r,r*.9,R.leaf))}
function zspark(b,x,y,big,c='#ffffff'){zpx(b,x,y,c);[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{zpx(b,x+dx,y+dy,'#bfefff');if(big)zpx(b,x+2*dx,y+2*dy,'#5fb0d0')})}
function GTREE(s,f){const b=zmk(64,64,6,10),cx=26,gy=44;
if(s===0){zground(b,cx,gy,9);zball(b,cx,gy-1.2,4.5,1.8,R.dirt);zball(b,cx,gy-2.5-(f%8===3?1:0),2.2,1.7,R.trunk)}
if(s===1){zground(b,cx,gy,10);const w=Math.round(sn(f));for(let y=gy-9;y<gy;y++){const o=y<gy-5?w:0;zpx(b,cx+o,y,'#3fa64a');zpx(b,cx+1+o,y,'#2a7a3a')}zball(b,cx-3+w,gy-8,3.2,1.8,R.leaf);zball(b,cx+4.5+w,gy-10,3.4,2,R.leaf);zball(b,cx+.5+w,gy-11,1.6,1.6,R.leaf)}
if(s===2){zground(b,cx,gy,12);ztrunk(b,cx,gy,11,2.6);zcan(b,cx,gy,[[0,-19,4]],[[-4,-13,5],[4,-13,5],[0,-17,6]],f)}
if(s===3){zground(b,cx,gy,15);ztrunk(b,cx,gy,16,3.6);zline(b,cx,gy-10,cx-7,gy-17,R.trunk[1],2);zline(b,cx+1,gy-11,cx+7,gy-18,R.trunk[0],2);zcan(b,cx,gy,[[-9,-20,6],[9,-20,6],[0,-30,6]],[[-5,-22,7],[5,-22,7],[0,-27,7],[-9,-16,5],[9,-16,5]],f)}
const bloom=(y1,p1,p2)=>{for(let y=-12;y<y1;y++)for(let x=-8;x<60;x++){const c=zget(b,x,y);if(c&&R.leaf.includes(c)){const h=zhash(x,y,3);if(h>p1)zpx(b,x,y,'#f29bb8');else if(h>p2)zpx(b,x,y,'#fff0f6')}}};
if(s===4){zground(b,cx,gy,20);ztrunk(b,cx,gy,20,5);zline(b,cx-1,gy-12,cx-10,gy-20,R.trunk[1],2);zline(b,cx+1,gy-13,cx+10,gy-21,R.trunk[0],2);zcan(b,cx,gy,[[-14,-22,7],[14,-22,7],[0,-36,8]],[[-7,-26,9],[7,-26,9],[0,-31,9],[-13,-18,6],[13,-18,6],[-5,-37,6],[6,-37,6]],f);bloom(gy-8,.95,.935)}
if(s===5){zground(b,cx,gy,22);ztrunk(b,cx,gy,22,6);zline(b,cx-1,gy-13,cx-12,gy-22,R.trunk[1],2);zline(b,cx+1,gy-14,cx+12,gy-22,R.trunk[0],2);zcan(b,cx,gy,[[-17,-24,8],[17,-24,8],[0,-40,9]],[[-9,-28,10],[9,-28,10],[0,-34,10],[-16,-19,7],[16,-19,7],[-6,-42,7],[7,-42,7]],f);
[[-12,-24],[-4,-30],[8,-26],[14,-18],[-17,-17],[2,-40],[10,-36],[-8,-38]].forEach(([dx,dy],i)=>zball(b,cx+dx,gy+dy,1.6,1.6,i%3?R.gold:R.red));
const ws=Math.round(sn(f)*2),sx=cx+13;zline(b,sx,gy-17,sx+ws,gy-6,'#c8b48a');zline(b,sx+4,gy-17,sx+4+ws,gy-6,'#c8b48a');for(let x=sx-1+ws;x<sx+6+ws;x++)zpx(b,x,gy-5,R.trunk[2])}
if(s===6){zground(b,cx,gy,25);ztrunk(b,cx,gy,24,7);[[-1,-14,-14,-24],[1,-15,14,-24],[0,-20,-6,-30]].forEach(([a,c,d,e])=>zline(b,cx+a,gy+c,cx+d,gy+e,R.trunk[1],2));
zcan(b,cx,gy,[[-20,-26,9],[20,-26,9],[0,-46,10],[-12,-44,7],[12,-44,7]],[[-11,-30,11],[11,-30,11],[0,-37,11],[-19,-20,8],[19,-20,8],[-7,-46,8],[8,-46,8]],f);bloom(gy-10,.97,.955);
[[-15,-18],[-3,-24],[10,-20],[18,-15],[4,-34]].forEach(([dx,dy],i)=>{zline(b,cx+dx,gy+dy-4,cx+dx,gy+dy-1,'#c8b48a');const on=(f+i)%4!==0;zpx(b,cx+dx,gy+dy,on?'#fff6c0':'#f6cf57');zpx(b,cx+dx+1,gy+dy,on?'#f6cf57':'#c08a22');zpx(b,cx+dx,gy+dy+1,'#c08a22');zpx(b,cx+dx+1,gy+dy+1,'#7a4e12')})}
zout(b);
if(s===4)for(let i=0;i<5;i++){const y=gy-26+((f*3+i*9)%24),x=cx-18+i*9+Math.round(sn(f+i*2)*1.5);zpx(b,x,y,'#f29bb8')}
if(s===5)for(let i=0;i<2;i++){const x=(f*4+i*30)%70-8,y=6+i*8+(f%2);zpx(b,x,y,'#e8ecef');zpx(b,x-1,y-1+(f%2)*2,'#e8ecef');zpx(b,x+1,y-1+(f%2)*2,'#e8ecef')}
if(s===6)for(let i=0;i<7;i++){const x=cx-24+Math.floor(zhash(i,1,4)*48),y=gy-((f*2+i*11)%54);if((f+i)%3)zpx(b,x,y,i%2?'#d8ff9a':'#fff6c0')}
return b}
function zface(b,cx,cy,sep,eh,blink){for(const sx of [cx-sep,cx+sep-1]){if(blink){zpx(b,sx,cy,OUT);zpx(b,sx+1,cy,OUT)}else{for(let k=0;k<eh;k++){zpx(b,sx,cy-k,OUT);zpx(b,sx+1,cy-k,OUT)}zpx(b,sx,cy-eh+1,'#ffffff')}}zpx(b,cx-sep-2,cy+2,'#f29bb8');zpx(b,cx-sep-1,cy+2,'#f29bb8');zpx(b,cx+sep,cy+2,'#f29bb8');zpx(b,cx+sep+1,cy+2,'#f29bb8');zpx(b,cx-2,cy+2,OUT);zpx(b,cx-1,cy+3,OUT);zpx(b,cx,cy+3,OUT);zpx(b,cx+1,cy+2,OUT)}
function zbody(b,cx,bot,rx,ry,r=R.blob){const cy=bot-ry*.65;zball(b,cx,cy,rx,ry,r,(x,y)=>y<=bot);return cy}
function zegg(b,cx,cy,clip){zballFn(b,cx,cy,7.5,9.5,(x,y,t)=>(!clip||clip(x,y))?(znoise(x*.45,y*.45,2)>.66?zpick(R.blob,t+.15,x,y):zpick(R.white,t,x,y)):null)}
function zcrown(b,cx,top){for(let x=cx-6;x<cx+6;x++)for(let y=top-3;y<=top;y++)zpx(b,x,y,zpick(R.gold,.9-(x-cx+6)/12*.7,x,y));[cx-6,cx-1,cx,cx+5].forEach(x=>{zpx(b,x,top-4,R.gold[2]);zpx(b,x,top-5,R.gold[3])});zpx(b,cx-1,top-2,'#d0503f');zpx(b,cx,top-2,'#d0503f');zpx(b,cx-1,top-3,'#f08a6a')}
function zwings(b,cx,y,f,big){const d=[0,-1,-2,-1,0,1,1,0][f%8],k=big?1.3:1;[-1,1].forEach(s=>{zball(b,cx+s*15*k,y+d,6*k,4.5*k,R.white);zball(b,cx+s*18*k,y+4+d*.5,4.5*k,3*k,R.white);zball(b,cx+s*12*k,y+5,3.5,2.5,R.white)})}
function GBLOB(s,f){const b=zmk(64,64,6,10),cx=26,gy=44,br=sn(f)*.6,blink=f%8===5;zground(b,cx,gy,[9,10,12,14,17,18,21][s]);
if(s===0)zegg(b,cx+[0,0,1,0,0,0,-1,0][f%8],gy-10);
if(s===1){const cy=zbody(b,cx,gy-3,6.5,6.5);zface(b,cx,cy-1,3,2,blink);zegg(b,cx,gy-9,(x,y)=>y>=gy-9+((x%4)<2?0:1));const l=(f%8===2||f%8===3)?2:0;zballFn(b,cx+1,gy-16-l,5.5,3.5,(x,y,t)=>y<=gy-16-l?zpick(R.white,t,x,y):null)}
if(s===2){const cy=zbody(b,cx,gy-2,8-br*.5,7.5+br);zface(b,cx,cy,3,2,blink)}
if(s===3){const cy=zbody(b,cx,gy-2,11-br*.6,10.5+br),top=Math.round(cy-10.5-br);zline(b,cx,top,cx,top-3,'#3fa64a');zball(b,cx+2.5+Math.round(sn(f)),top-3.5,2.4,1.4,R.leaf);zface(b,cx,cy,4,3,blink)}
if(s===4){const cy=zbody(b,cx,gy-2,13-br*.6,12.5+br);zcrown(b,cx,Math.round(cy-12.5-br));zface(b,cx,cy+1,5,3,blink)}
if(s===5){zwings(b,cx,gy-19,f,false);const cy=zbody(b,cx,gy-2,13.5-br*.6,13+br),top=Math.round(cy-13-br);zcrown(b,cx,top);const hy=top-9+Math.round(sn(f));zballFn(b,cx,hy,8,2.5,(x,y,t,nx,ny,d)=>d>.45?zpick(R.gold,t+.2,x,y):null);zface(b,cx,cy+1,5,3,blink)}
if(s===6){zwings(b,cx,gy-22,f,true);const cy=zbody(b,cx,gy-2,15-br*.6,15+br,R.cosmic),top=Math.round(cy-15-br);for(let y=top;y<gy;y++)for(let x=cx-15;x<cx+15;x++){const c=zget(b,x,y);if(c&&R.cosmic.includes(c)&&zhash(x,y,6)>.95)zpx(b,x,y,(zhash(x,y,7)*8+f)%8<5?'#ffffff':'#8a80e0')}zcrown(b,cx,top);const hy=top-9+Math.round(sn(f));zballFn(b,cx,hy,9,2.6,(x,y,t,nx,ny,d)=>d>.45?zpick(R.gold,t+.2,x,y):null);zface(b,cx,cy+1,6,3,blink)}
zout(b);
if(s===6)for(let i=0;i<3;i++){const a=f/8*TAU+i*TAU/3;zspark(b,Math.round(cx+Math.cos(a)*26),Math.round(gy-16+Math.sin(a)*8),i===0,'#fff6c0')}
if(s>=4&&s<6&&f%8===1)zspark(b,cx+9,gy-28,false);
return b}
function zhouse(b,x,yb,w,h){for(let y=yb-h+1;y<=yb;y++)for(let xx=x;xx<x+w;xx++)zpx(b,xx,y,zpick(R.wall,.9-(xx-x)/w*.7,xx,y));const dx=x+Math.floor(w/2);zpx(b,dx,yb,'#3a2416');zpx(b,dx,yb-1,'#3a2416');zpx(b,x+1,yb-h+2,'#f6cf57');if(w>5)zpx(b,x+w-2,yb-h+2,'#f6cf57');const cxh=x+w/2;for(let k=0;k<Math.ceil(w/2)+1;k++){const half=(w+2)/2-k,yy=yb-h-k;for(let xx=Math.floor(cxh-half);xx<Math.ceil(cxh+half);xx++)zpx(b,xx,yy,zpick(R.roof,(xx<cxh?.85:.4)-k*.04,xx,yy))}}
function zstree(b,x,yb,r,f=0){zpx(b,x,yb,R.trunk[1]);zpx(b,x,yb-1,R.trunk[2]);zball(b,x+.5+(f%8===2?1:f%8===6?-1:0)*(r>3?1:0),yb-1-r,r,r,R.leaf)}
function zpine(b,x,yb,h){zpx(b,x,yb,R.trunk[1]);for(let k=0;k<h;k++){const half=Math.max(.5,(h-k)*.45*((k%3)/3*.4+.8));for(let xx=Math.floor(x-half);xx<=Math.ceil(x+half);xx++)zpx(b,xx,yb-1-k,zpick(R.leafD.concat(R.leaf.slice(2)),.8-(xx-x+half)/(2*half)*.6,xx,yb-1-k))}}
function zfloat(b,cx,cy,rx,s0){const ry=rx*.26,depth=rx*.8;for(let y=cy;y<=cy+depth;y++){const half=rx*Math.pow(1-(y-cy)/(depth+1),1.25)+(zhash(cx,y,5)-.5)*2;for(let x=Math.floor(cx-half);x<=Math.ceil(cx+half);x++){const t=.75-(y-cy)/depth*.45-((x-cx)/Math.max(half,1))*.3;zpx(b,x,y,y<cy+3?zpick(R.dirt,t,x,y):(zhash(x,y,7)>.985?'#7fdcf0':zpick(R.rock,t,x,y)))}}zballFn(b,cx,cy,rx,ry,(x,y,t)=>s0&&znoise(x*.2,y*.4,4)<.55?zpick(R.rock,t+.1,x,y):zpick(R.grass,t,x,y))}
function zbird(b,x,y,f){const u=f%2;zpx(b,x,y,'#e8ecef');zpx(b,x-1,y-1+u*2,'#e8ecef');zpx(b,x+1,y-1+u*2,'#e8ecef');zpx(b,x-2,y-1+u*2,'#e8ecef');zpx(b,x+2,y-1+u*2,'#e8ecef')}
function zisland(s,f){const b=zmk(120,76,12,8),cx=48,cy=36,rx=[20,25,30,34,38,38,40][s];const G=dz=>Math.round(cy+dz);const bob=Math.round(sn(f));
if(s>=5){zfloat(b,99,18+bob,9,false);zline(b,84,cy-3,92,20+bob,'#8a6440');for(let i=0;i<5;i++)zpx(b,85+i*1.6,cy-4-i*2.6+bob*i/5,'#c8b48a');const wx=99,wy=17+bob;for(let k=0;k<7;k++){zpx(b,wx,wy-k,R.wall[2]);zpx(b,wx+1,wy-k,R.wall[1])}zpx(b,wx,wy-8,R.roof[2]);zpx(b,wx+1,wy-8,R.roof[1]);const bl=f%2?[[1,1],[-1,-1],[1,-1],[-1,1]]:[[1,0],[-1,0],[0,1],[0,-1]];bl.forEach(([dx,dy])=>{for(let k=1;k<5;k++)zpx(b,wx+.5+dx*k,wy-7+dy*k,'#e2e8f4')});zstree(b,105,20+bob,2)}
zfloat(b,cx,cy,rx,s===0);
if(s===0){zstree(b,52,G(0),2,f)}
if(s===1){zpine(b,62,G(-1),7);const x=40,yb=G(1);for(let k=0;k<6;k++)for(let xx=x-k;xx<=x+k;xx++)zpx(b,xx,yb-5+k,zpick(R.fire.slice(0,3),xx<x?.8:.3,xx,yb));zpx(b,x,yb,OUT);zpx(b,x,yb-1,OUT);zpx(b,50,G(2),R.trunk[1]);zpx(b,51,G(2),R.trunk[2]);zpx(b,50+(f%2),G(1),'#ef8a3c');zpx(b,51-(f%2),G(1),'#f6cf57');zpx(b,50+(f%3===0?1:0),G(0),'#f6cf57');if(f%4<2)zpx(b,50,G(-1),'#fff6c0');zstree(b,32,G(2),3,f)}
if(s===2){zpine(b,64,G(-2),9);zstree(b,30,G(1),3,f);zhouse(b,40,G(0),7,5);zstree(b,54,G(2),4,f);for(let y=G(1);y<G(6);y++)zpx(b,43,y,'#bfa262')}
if(s===3){zpine(b,72,G(-1),9);zhouse(b,30,G(-2),7,5);zhouse(b,58,G(-3),6,5);zstree(b,22,G(1),3,f);zhouse(b,44,G(1),8,6);zball(b,53,G(4),2.5,1.5,R.rock);zpx(b,53,G(3),R.water[1]);zstree(b,66,G(3),4,f);zstree(b,36,G(5),3,f)}
if(s>=4){for(let y=cy-1;y<70;y++)for(let dx=0;dx<3;dx++)zpx(b,12+dx,y,zhash(dx,y-f*2,2)>.75?'#e0f6ff':zpick(R.water,.3+dx*.25+(((y-f*2)%3+3)%3)*.08,12+dx,y));zball(b,15,cy-1,3,1.2,R.water);
if(s===6){const cs=[34,62],top=G(-4)-10;for(let x=36;x<62;x++)for(let y=top;y<=G(-4);y++)zpx(b,x,y,zpick(R.stone,.85-(x-36)/26*.6+((y+x%6<1)?.1:0),x,y));for(let x=36;x<62;x+=3){zpx(b,x,top-1,R.stone[2]);zpx(b,x+1,top-1,R.stone[1])}
cs.forEach((tx,i)=>{for(let y=G(-4)-17;y<=G(-4);y++)for(let x=tx-3;x<tx+3;x++)zpx(b,x,y,zpick(R.stone,.9-(x-tx+3)/6*.7,x,y));zpx(b,tx-1,G(-4)-12,'#f6cf57');for(let k=0;k<6;k++)for(let x=tx-4+k*.7;x<tx+4-k*.7;x++)zpx(b,x,G(-4)-18-k,zpick(R.blue,x<tx?.85:.35,x,G(-4)-18-k));const fy=G(-4)-25;zpx(b,tx,fy,OUT);zpx(b,tx,fy-1,OUT);zpx(b,tx,fy-2,OUT);for(let k=1;k<5;k++)zpx(b,tx+k,fy-2+((k+f)%4<2?0:1),i?'#f2c94c':'#d0503f');for(let k=1;k<4;k++)zpx(b,tx+k,fy-1+((k+f)%4<2?0:1),i?'#c08a22':'#9a2e2a')});
for(let y=G(-4)-4;y<=G(-4);y++)for(let x=47;x<51;x++)zpx(b,x,y,'#3a2416')}
zpine(b,34,G(-5),8);zhouse(b,26,G(-1),7,5);zhouse(b,54,G(-2),7,6);zstree(b,20,G(2),3,f);zhouse(b,40,G(2),8,6);zhouse(b,64,G(3),6,5);zstree(b,50,G(6),3,f);
const lx=74,ly=G(-1);for(let k=0;k<16;k++)for(let x=lx;x<lx+4;x++)zpx(b,x,ly-k,zpick(Math.floor(k/3)%2?R.wall:R.red,.9-(x-lx)/4*.6,x,ly-k));for(let x=lx-1;x<lx+5;x++)zpx(b,x,ly-16,R.red[1]);const lit=f%4<2;for(let x=lx;x<lx+4;x++){zpx(b,x,ly-17,lit?'#fff6c0':'#c08a22');zpx(b,x,ly-18,lit?'#f6cf57':'#7a4e12')}for(let x=lx;x<lx+4;x++)zpx(b,x,ly-19,R.red[2]);
zballFn(b,84,10+bob,6,7,(x,y,t)=>zpick(((x-78)>>1)%2?R.gold:R.red,t,x,y));zline(b,80,16+bob,82,21+bob,OUT);zline(b,88,16+bob,86,21+bob,OUT);for(let x=82;x<87;x++){zpx(b,x,21+bob,R.trunk[2]);zpx(b,x,22+bob,R.trunk[1])}
if(s===6){zballFn(b,4,4-bob,4,5,(x,y,t)=>zpick(((x)>>1)%2?R.white:R.blue,t,x,y));for(let x=3;x<6;x++)zpx(b,x,12-bob,R.trunk[2])}
const cd=Math.round(sn(f));zball(b,14+cd,12,5,2.2,R.white);zball(b,19+cd,11,4,2.6,R.white);zball(b,30-cd,18,3.5,1.6,R.white)}
zout(b);
if(s>=4&&f%4<2){const lx=74,ly=G(-1)-17;for(let k=2;k<9;k++){zpx(b,lx+3+k,ly+(f%2?0:1),'#fff6c0');zpx(b,lx-k,ly+(f%2?1:0),'#fff6c0')}}
if(s>=5){zbird(b,(f*3)%60+20,4+(f%2),f);zbird(b,(f*3+28)%60+20,8,f+1)}
return b}
function zshard(b,x,yb,w,h,lean,r){const tip=Math.ceil(w*.9);for(let k=0;k<h;k++){const yy=yb-k,ccx=x+lean*k/h,half=k<h-tip?w/2:(w/2)*((h-k)/tip);for(let xx=Math.floor(ccx-half);xx<Math.ceil(ccx+half);xx++){const u=(xx+.5-ccx)/Math.max(half,.5);let t=u<-.35?.85:u<.35?.55:.22;if(k>=h-tip)t+=.12;if(xx===Math.floor(ccx-half)&&k%3)t=1;zpx(b,xx,yy,zpick(r,t,xx,yy))}}}
function zdiamond(b,cx,cy,w,h,r){const top=Math.round(h*.35);for(let k=-top;k<h-top;k++){const half=k<0?(w/2)*(1+k/top*.55):(w/2)*(1-k/(h-top));for(let x=Math.floor(cx-half);x<Math.ceil(cx+half);x++){const u=(x+.5-cx)/Math.max(half,.5);let t=k<0?(u<0?.95:.7):(u<-.3?.75:u<.3?.5:.2);zpx(b,x,cy+k,zpick(r,t,x,cy+k))}}}
function GCRYSTAL(s,f){const b=zmk(64,64,6,10),cx=26,gy=44,C=R.cyan,P=R.pink,V=R.violet,bob=Math.round(sn(f)*1.5);
const big=[[cx-9,gy-1,5,18,-3,C],[cx+9,gy-2,5,21,3,P],[cx-3,gy-2,6,26,-1,P],[cx+3,gy-3,7,34,0,C],[cx-14,gy,4,9,-4,P],[cx+14,gy-1,4,12,4,C],[cx-1,gy,3,8,0,P]];
const L=[[[cx+2,gy-3,2,3,0,C]],[[cx-1,gy-3,4,11,0,C]],[[cx-6,gy-2,4,9,-2,C],[cx,gy-3,5,16,0,C],[cx+6,gy-2,4,8,2,C]],[[cx-10,gy-1,4,8,-3,P],[cx-5,gy-2,5,14,-2,C],[cx+7,gy-2,4,12,2,P],[cx+1,gy-3,6,21,0,C],[cx+11,gy-1,3,7,3,C]],big,[[cx-17,gy-1,5,16,-5,V],[cx+18,gy-1,5,18,5,V],...big],[[cx-17,gy-1,5,16,-5,V],[cx+18,gy-1,5,18,5,V],...big]][s];
L.forEach(a=>zshard(b,...a));const rw=[8,10,13,15,18,21,22][s];zball(b,cx,gy-1,rw,[3.5,4,5,5.5,6,6.5,7][s],R.rock,(x,y)=>y>=gy-2);zball(b,cx-rw+1,gy,2.5,1.8,R.rock);zball(b,cx+rw-1,gy+.5,2,1.5,R.rock);
if(s>=5){[[-20,-28,0],[22,-24,3],[-12,-38,5]].forEach(([dx,dy,o])=>zshard(b,cx+dx,gy+dy+Math.round(sn(f+o)*1.5),3,7,0,V))}
if(s===6){zdiamond(b,cx+3,gy-46+bob,13,17,R.gold)}
zout(b);
const sp=[[9,12],[43,9],[44,24],[12,28],[20,5],[38,-2],[4,0]];const n=[0,0,0,3,5,6,7][s];
for(let i=0;i<n;i++){const ph=(f+i*3)%8;if(ph<5)zspark(b,sp[i][0],sp[i][1],ph===2)}
if(s===6)for(let i=0;i<6;i++){const a=f/8*TAU+i*TAU/6,x=cx+3+Math.cos(a)*12,y=gy-37+bob+Math.sin(a)*3;zpx(b,x,y,Math.sin(a)>0?'#fff0a8':'#c08a22')}
if(s>=1&&s<3&&f%8<2)zspark(b,cx+1,gy-14+(s===2?-4:0),false);
return b}
function GPLANET(s,f){const b=zmk(64,64,6,6),c=26,ph=f/16*TAU;
const N=(lon,lat,sd)=>(znoise(Math.cos(lon)*2.4+5,lat*2.8+5,sd)+znoise(Math.sin(lon)*2.4+9,lat*2.8+1,sd+1))/2;
const ring=front=>zballFn(b,c,c,25,25,(x,y)=>{const dx=x+.5-c,dy=y+.5-c,a=-.28,X=dx*Math.cos(a)+dy*Math.sin(a),Y=-dx*Math.sin(a)+dy*Math.cos(a),e=(X/24)**2+(Y/6)**2;if(e<.5||e>1||(front?Y<0:Y>=0))return null;if(e>.72&&e<.78)return null;return zpick(R.gold,front?.95-(e-.5):.55-(e-.5),x,y)});
const surf=(r,land,cloud,lights)=>zballFn(b,c,c,r,r,(x,y,t,nx,ny)=>{const lon=Math.asin(Math.max(-1,Math.min(1,nx/Math.sqrt(Math.max(.001,1-ny*ny)))));if(cloud&&N(lon+ph*1.3,ny,11)>.6)return zpick(R.white,t+.1,x,y);if(land){const n=N(lon+ph,ny,7);if(n>.535){if(lights&&t<.3&&zhash(Math.round((lon+ph)*9),Math.round(ny*12),3)>.6)return(f+x)%5?'#f6cf57':'#fff0a8';return zpick(R.land,t,x,y)}if(n>.51)return zpick(R.sand,t,x,y)}return zpick(R.ocean,t,x,y)});
const moon=(a,rd,ry,r)=>({x:c+Math.cos(a)*rd,y:c+Math.sin(a)*ry,front:Math.sin(a)>0,r});
let moons=[];if(s===4)moons=[{x:45,y:8,front:true,r:4}];if(s>=5)moons.push(moon(ph,23,7,3));if(s===6)moons.push(moon(-ph*2+1,19,10,2.2));
const drawM=fr=>moons.forEach(m=>{if(m.front===fr){if(m.r>2.5)zball(b,m.x,m.y,m.r,m.r,R.rock);else{zpx(b,m.x,m.y,'#c8cdd8');zpx(b,m.x+1,m.y,'#8089a0');zpx(b,m.x-1,m.y,'#4a78e0');zpx(b,m.x+2,m.y,'#4a78e0')}}});
if(s===0){const w=[0,0,1,1,0,0,-1,-1][f%8];zballFn(b,c,c+w*.3,11,10,(x,y,t,nx,ny,d)=>d<1-znoise(x*.3+f*.05,y*.3,3)*.35?zpick(R.rock,t,x,y):null);[[22,22,2.4],[29,28,1.8],[24,30,1.4],[30,21,1.2]].forEach(([x,y,r])=>zballFn(b,x,y,r,r,(xx,yy,t)=>zget(b,xx,yy)?zpick(R.rock,.9-t,xx,yy):null))}
drawM(false);if(s>=4)ring(false);
if(s===1)surf(13,false,false);if(s===2)surf(14,true,false);if(s>=3)surf(15,true,true,s>=5);
zout(b,s>=3?'#2a5aa0':OUT);if(s>=4)ring(true);drawM(true);if(s>=4)zout(b);
for(let i=0;i<18;i++){const x=Math.floor(zhash(i,1,8)*64)-6,y=Math.floor(zhash(i,2,8)*64)-6;if(!zget(b,x,y)&&(f+i)%6)zpx(b,x,y,(f+i)%6===1?'#ffffff':'#4a5373')}
if(s===6&&f<6){for(let k=0;k<4;k++)zpx(b,-4+f*5-k,-2+f*2-k*.5,k?'#8ab0ff':'#ffffff')}
return b}
const GEN={blob:GBLOB,tree:GTREE,island:zisland,crystal:GCRYSTAL,planet:GPLANET},ZC={};
const zimg=(k,i,f)=>{f=k==='planet'?f%16:f%8;const id=k+i+'_'+f;return ZC[id]||(ZC[id]=zurl(GEN[k](i,f)))};
const DAYS=[0,3,7,14,30,60,100];
const EVOS=[{id:'2a',key:'blob',name:'Blob',sub:'compagnon qui éclot puis grandit',acc:'#b392f0',st:['Œuf','Éclosion','Bébé','Blob','Roi Blob','Blob ailé','Blob cosmique']},{id:'2b',key:'tree',name:'Arbre',sub:'de la graine à l’arbre-monde',acc:'#62d06a',st:['Graine','Pousse','Jeune arbre','Arbre','En fleurs','Arbre ancien','Arbre-monde']},{id:'2c',key:'island',name:'Île céleste v2',sub:'du rocher au royaume',acc:'#7fd0f5',st:['Rocher','Campement','Hameau','Village','Cité céleste','Archipel','Royaume'],wide:true},{id:'2d',key:'crystal',name:'Cristal',sub:'une géode qui pousse avec ta régularité',acc:'#f29bc8',st:['Pierre','Éclat','Grappe','Géode','Cœur','Couronne','Cœur céleste']},{id:'2e',key:'planet',name:'Planète',sub:'de l’astéroïde au système stellaire',acc:'#86c6f5',st:['Astéroïde','Océan','Continents','Vie','Monde annelé','Civilisation','Système']}];
const LEG=Array.from({length:15},(_,k)=>160+60*k);
const LEGN=['Lucioles','Halo de bronze','Socle gravé','Pluie d’étoiles','Halo d’argent','Gardiens','Aurore','Halo d’or','Socle doré','Comète','Halo de diamant','Constellation','Double aura','Couronne de légende','Aura légendaire'];
const LEAFS={'lf-automne':['#5a1e0a','#8a3a12','#c0601e','#ef8a3c','#ffd08a'],'lf-cerisier':['#5a1a3a','#8a2a5e','#d05a92','#f29bc8','#ffe8f4'],'lf-givre':['#1a3a5a','#2a6a94','#5aa8d0','#9ae0f0','#f0fbff']},GRS={'gr-lavande':['#3a2463','#5b3d99','#8a63d2','#b392f0'],'gr-dore':['#7a4e12','#c08a22','#f2c94c','#fff0a8']};
const SLOT={Teintes:'skin',Fonds:'bg',Arbre:'leaf','Île':'ground',Compagnons:'pet'},NUL=['sk-orig','bg-none','lf-orig','gr-orig'];
const SKINS={'sk-menthe':['#0f3d33','#1a6b55','#2fa37f','#62d6aa','#c8f7e4'],'sk-corail':['#4a1a1a','#8a3030','#d0604f','#f29a7a','#ffe2d6'],'sk-nuit':['#0e1030','#1e2460','#3a44a8','#6a7ae0','#c0c8ff'],'sk-or':['#4a3010','#8a5a18','#d09a2a','#f2c94c','#fff0b8'],'sk-rose':['#4a1636','#8a2a5e','#d05a92','#f29bc8','#ffe0f0'],'sk-glace':['#123a4a','#1f6a84','#4aa8c8','#9ae0f0','#ecfbff'],'sk-braise':['#3a0e0a','#7a1e12','#c0401e','#ef8a3c','#ffd08a']},SKL=Object.values(SKINS);
const MAIN={combo:[R.blob,R.cosmic],blob:[R.blob,R.cosmic],tree:[R.leaf,R.leafD],island:[R.roof,R.grass],crystal:[R.cyan,R.pink],planet:[R.ocean,R.land]},GYR={blob:54,tree:54,crystal:54,island:44,combo:94};
const ITEMS=[{id:'sk-orig',cat:'Teintes',n:'Originale',price:0},{id:'sk-menthe',cat:'Teintes',n:'Menthe',price:120},{id:'sk-corail',cat:'Teintes',n:'Corail',price:150},{id:'sk-nuit',cat:'Teintes',n:'Nuit',price:200},{id:'sk-rose',cat:'Teintes',n:'Rose',price:150},{id:'sk-glace',cat:'Teintes',n:'Glace',price:220},{id:'sk-braise',cat:'Teintes',n:'Braise',price:260},{id:'sk-prisme',cat:'Teintes',n:'Prisme (animée)',price:900},{id:'sk-or',cat:'Teintes',n:'Or massif',price:null,mission:'365 j'},{id:'lf-orig',cat:'Arbre',n:'Feuillage d’origine',price:0},{id:'lf-automne',cat:'Arbre',n:'Automne',price:180},{id:'lf-cerisier',cat:'Arbre',n:'Cerisier',price:220},{id:'lf-givre',cat:'Arbre',n:'Givre',price:280},{id:'gr-orig',cat:'Île',n:'Sol d’origine',price:0},{id:'gr-lavande',cat:'Île',n:'Prairie lavande',price:200},{id:'gr-dore',cat:'Île',n:'Blés dorés',price:260},{id:'gr-cristal',cat:'Île',n:'Roche de cristal',price:320},{id:'bg-none',cat:'Fonds',n:'Ciel nuit',price:0},{id:'bg-sunset',cat:'Fonds',n:'Coucher de soleil',price:180},{id:'bg-aurora',cat:'Fonds',n:'Aurore boréale',price:260},{id:'bg-space',cat:'Fonds',n:'Nébuleuse',price:320},{id:'ac-flag',cat:'Accessoires',n:'Fanion',price:60},{id:'ac-lantern',cat:'Accessoires',n:'Lanterne',price:90},{id:'ac-flowers',cat:'Accessoires',n:'Couronne de fleurs',price:140},{id:'ac-rainbow',cat:'Accessoires',n:'Arc-en-ciel',price:null,mission:'Méditer 30 j'},{id:'pet-firefly',cat:'Compagnons',n:'Luciole',price:100},{id:'pet-bird',cat:'Compagnons',n:'Oiseau',price:160},{id:'pet-slime',cat:'Compagnons',n:'Mini-blob',price:220},{id:'pet-cat',cat:'Compagnons',n:'Chat',price:300}];
const MISSIONS=[{id:'m1',tag:'Quotidienne',n:'Valider 5 habitudes aujourd’hui',goal:5,prog:()=>5,coins:60},{id:'m2',tag:'Hebdo',n:'Boire 2L d’eau 7 jours de suite',goal:7,prog:()=>7,coins:100},{id:'m3',tag:'Hebdo',n:'Semaine parfaite (7 jours sur 7)',goal:7,prog:()=>4,coins:250},{id:'m4',tag:'Défi',n:'Méditer 30 jours au total',goal:30,prog:()=>30,item:'ac-rainbow'},{id:'m5',tag:'Série',n:'Atteindre 100 jours de série',goal:100,prog:s=>s,coins:400},{id:'m6',tag:'Légende',n:'Atteindre 365 jours de série',goal:365,prog:s=>s,item:'sk-or'},{id:'m7',tag:'Légende',n:'Atteindre 1000 jours de série',goal:1000,prog:s=>s,coins:2000}];
const TAGC={Quotidienne:'#4ade80',Hebdo:'#7fd0f5','Défi':'#f29bc8','Série':'#b392f0','Légende':'#f6cf57'};
const CAT=["g...g..","ggggg..","gwgwg..","ggpgg..",".ggg..t",".gggg.t","gdgdgt."],CATC={g:'#9aa3ad',d:'#5d6773',w:'#f6cf57',p:'#f29bb8',t:'#7d8794'};
let COINURL=null;const zcoin=()=>{if(COINURL)return COINURL;const b=zmk(9,9);zball(b,4.5,4.5,3.6,3.6,R.gold);zpx(b,4,3,'#7a4e12');zpx(b,4,4,'#7a4e12');zpx(b,4,5,'#7a4e12');zout(b);return COINURL=zurl(b)};
const LEGNS={blob:['Champignons','Maisonnette','Un ami','Potager','Boîte aux lettres','Mare','Bébés blobs','Feu de camp','Arbre fruitier','Cerf-volant','Moulin','Fontaine','Château lointain','Montgolfière Momo','Grande fête'],tree:['Champignons','Nichoir','Ruche','Écureuil','Cabane perchée','Échelle de corde','Hibou','Ruisseau','Jeune pousse','Cerf','Fées','Banc & lanterne','Cascade','Village champignon','Château des cimes'],island:['Port aérien','Îlot ferme','Moulin','Pont suspendu','Dirigeable','Îlot du temple','Jardins suspendus','Observatoire','Grande cascade','Dragon','Flotte de ballons','Marché flottant','Tour du mage','Feux d’artifice','Palais doré']};
let LOCKU=null;const LOCK=()=>{if(LOCKU)return LOCKU;const b=zmk(20,20);for(let y=9;y<17;y++)for(let x=5;x<15;x++)zpx(b,x,y,zpick(R.rock,.8-(x-5)/10*.6,x,y));for(let k=0;k<5;k++){zpx(b,6,4+k,'#59607a');zpx(b,13,4+k,'#59607a')}for(let x=7;x<13;x++)zpx(b,x,3,'#59607a');zpx(b,9,12,OUT);zpx(b,10,12,OUT);zpx(b,9,13,OUT);zout(b);return LOCKU=zurl(b)};
const LN=(k,i)=>(k==='combo'?COMBON:LEGNS[k]||LEGN)[i];
function lmush(b,x,y,r=2){zpx(b,x,y,'#eadbb6');zpx(b,x,y-1,'#eadbb6');zball(b,x+.5,y-2,r+.5,r*.8,R.red,(xx,yy)=>yy<=y-2);zpx(b,x-1,y-3,'#fff6dc');zpx(b,x+1,y-4,'#fff6dc')}
function lminiblob(b,x,y,r,ramp,f,ph){const h=[0,1,2,1][(f+ph)%4],cy=y-r*.7-h;zball(b,x,cy,r,r*.85,ramp,(xx,yy)=>yy<=y-h);zpx(b,x-1,cy,OUT);zpx(b,x+1,cy,OUT)}
function lmill(b,x,yb,h,f){for(let k=0;k<h;k++){const hw=2.5-k/h;for(let xx=Math.floor(x-hw);xx<Math.ceil(x+hw);xx++)zpx(b,xx,yb-k,zpick(R.wall,.9-(xx-x+hw)/(2*hw)*.7,xx,yb-k))}zball(b,x,yb-h,2.5,2,R.roof);const bl=f%2?[[1,1],[-1,-1],[1,-1],[-1,1]]:[[1,0],[-1,0],[0,1],[0,-1]];bl.forEach(([dx,dy])=>{for(let k=1;k<7;k++)zpx(b,x+dx*k,yb-h+dy*k,k>2?'#e2e8f4':'#8a6440')})}
function lballoon(b,x,y,r,r1,r2){zballFn(b,x,y,r,r*1.15,(xx,yy,t)=>zpick(((xx-Math.floor(x))>>1)%2?r1:r2,t,xx,yy));zline(b,x-r*.6,y+r,x-1,y+r+3,OUT);zline(b,x+r*.6,y+r,x+1,y+r+3,OUT);for(let xx=x-1.5;xx<x+2;xx++){zpx(b,xx,y+r+4,R.trunk[2])}}
function lfire(b,x,y,f){zline(b,x-3,y,x+3,y,R.trunk[1]);zpx(b,x-1,y-1,'#ef8a3c');zpx(b,x,y-1,'#f6cf57');zpx(b,x+1,y-1,'#ef8a3c');zpx(b,x+(f%2?0:-1),y-2,'#f6cf57');zpx(b,x+(f%2?1:0),y-3,'#fff6c0');if(f%3===0)zpx(b,x,y-4,'#ef8a3c')}
function lworks(b,pts,f){const C=['#f29bc8','#7fdcf0','#f6cf57','#b392f0'];pts.forEach(([x,y],i)=>{const ph=(f+i*3)%8;if(ph>5)return;const r=ph*1.6+1;for(let k=0;k<8;k++){const a=k*TAU/8;zpx(b,x+Math.cos(a)*r,y+Math.sin(a)*r,C[(i+k)%4]);if(ph>1)zpx(b,x+Math.cos(a)*(r-1.5),y+Math.sin(a)*(r-1.5),'#ffffff')}})}
const DEER=["......kk.","..k..kk..","...kkkk..","..ddddw..",".dddddd..","ddddddd..","d.d..d.d.","d.d..d.d."],DEERC={k:'#5a3a22',d:'#9c7146',w:'#141821'};
function legendBlob(A,L,p,f){const g=70;
if(p>=13){for(const [x,h] of [[100,10],[110,13],[120,9]])for(let k=0;k<h;k++)for(let xx=x-2;xx<x+2;xx++)zpx(A,xx,58-k,zpick(['#3a2a5a','#5a4a8a','#7a6ab0'],.8-(xx-x+2)/4*.6,xx,58-k));for(let xx=98;xx<122;xx++)for(let y=52;y<59;y++)zpx(A,xx,y,zpick(['#3a2a5a','#5a4a8a','#7a6ab0'],.5,xx,y));[[100,10],[110,13],[120,9]].forEach(([x,h])=>{zpx(A,x,58-h-1,'#f6cf57');zpx(A,x-1,58-h,'#f6cf57')})}
if(p>=11)lmill(A,27,63,12,f);
if(p>=2)zhouse(A,8,66,11,7);
if(p>=4)for(const y of [73,76])for(let x=18;x<33;x+=3){zpx(A,x,y,'#ef8a3c');zpx(A,x,y-1,'#3fa64a');zpx(A,x+1,y-2,'#62d06a');zpx(A,x+1,y,'#4a3020')}
if(p>=5){for(let k=0;k<5;k++)zpx(A,38,68-k,R.trunk[1]);for(let x=37;x<41;x++){zpx(A,x,63,R.red[2]);zpx(A,x,62,R.red[1])}zpx(A,41,f%4<2?62:61,'#f6cf57')}
if(p>=9){zpx(A,122,68,R.trunk[1]);for(let k=0;k<6;k++)zpx(A,121,68-k,R.trunk[2]);zball(A,121.5,58,6,5.5,R.leaf);[[118,57],[123,55],[124,60],[119,61]].forEach(([x,y])=>zpx(A,x,y,'#d0503f'))}
if(p>=1){lmush(A,34,72);lmush(A,94,73,1.6);lmush(A,98,71)}
if(p>=3)lminiblob(A,108,69,4,SKINS['sk-menthe'],f,0);
if(p>=6){zball(A,78,77,7,2,R.water);zpx(A,75,77,'#62d06a');zpx(A,76,77,'#62d06a');zpx(A,81,76,'#3fa64a');if(f%4===0)zpx(A,79,77,'#e0f6ff')}
if(p>=7){lminiblob(A,50,76,2.4,R.blob,f,1);lminiblob(A,56,78,2,R.blob,f,3)}
if(p>=8)lfire(A,114,74,f);
if(p>=12){zball(A,64,78,6,1.6,R.stone);for(let y=72;y<78;y++)zpx(A,64,y,(y+f)%3?R.water[2]:'#e0f6ff');zpx(A,63,72+(f%2),R.water[3]);zpx(A,65,73-(f%2),R.water[3])}
if(p>=14)lballoon(A,108,14+Math.round(sn(f)),6,R.blob,R.violet);
if(p>=10){const kx=22+Math.round(sn(f)*2),ky=10;for(let k=0;k<4;k++)for(let xx=kx-k;xx<=kx+k;xx++){zpx(A,xx,ky+k,xx<kx?'#d0503f':'#f6cf57');zpx(A,xx,ky+7-k,xx<kx?'#9a2e2a':'#c08a22')}}
return()=>{if(p>=10){const kx=22+Math.round(sn(f)*2);for(let k=0;k<10;k++)zpx(L,kx+Math.round(Math.sin(k*.8+f)*1),18+k*1.5,k%3?'#c8b48a':'#d0503f')}
if(p>=14){zpx(L,107,14+Math.round(sn(f)),OUT);zpx(L,109,14+Math.round(sn(f)),OUT)}
if(p>=15){for(let x=4;x<124;x++){const y=Math.round(14+Math.sin((x-4)/120*Math.PI)*5);zpx(L,x,y,'#3a3f4d');if(x%6===0)zpx(L,x,y+1,['#f29bc8','#7fdcf0','#f6cf57','#62d06a'][((x/6)+f)%4])}lworks(L,[[30,6],[96,5],[78,3]],f)}}}
function legendTree(A,L,p,f){
if(p>=13){zball(A,120,58,7,6,R.rock);zball(A,115,64,5,4,R.rock);for(let y=56;y<77;y++)for(let dx=0;dx<2;dx++)zpx(A,112+dx,y,zhash(dx,y-f*2,3)>.7?'#e0f6ff':R.water[1+dx])}
if(p>=9){for(let k=0;k<10;k++)zpx(A,14,70-k,R.trunk[k%2+1]);zball(A,14,57,6,5.5,R.leaf);zball(A,10,61,4,3.5,R.leaf)}
if(p>=8)for(let x=6;x<122;x++){const y=76+Math.round(Math.sin(x*.08)*1.5);zpx(A,x,y,R.water[1]);zpx(A,x,y+1,R.water[0]);if((x+f*2)%9===0)zpx(A,x,y,'#e0f6ff')}
if(p>=1){lmush(A,54,72);lmush(A,76,73,1.6)}
if(p>=2){for(let y=56;y<60;y++)for(let x=68;x<72;x++)zpx(A,x,y,zpick(R.trunk,.9-(x-68)/4*.6,x,y));for(let x=67;x<73;x++)zpx(A,x,55,R.red[2]);zpx(A,69,57,OUT);zpx(A,70,57,OUT);if(f%8<4){zpx(A,72,56,'#f6cf57');zpx(A,73,56,'#d0503f')}}
if(p>=3){zline(A,46,44,46,48,'#c8b48a');zballFn(A,46,51,2.6,3.2,(x,y,t)=>zpick(y%2?R.gold:['#5a3a12','#7a4e12','#9a6a1a'],t,x,y))}
if(p>=4){zball(A,90,68,2.2,1.6,['#5a2e12','#8a4a22','#b86a32']);zball(A,93,65,1.8,2.4,['#5a2e12','#8a4a22','#b86a32']);zpx(A,89,66,'#b86a32');zpx(A,88,67,OUT)}
if(p>=5){for(let x=80;x<96;x++){zpx(A,x,40,R.trunk[2]);zpx(A,x,41,R.trunk[1])}zhouse(A,83,39,9,5)}
if(p>=6)for(let y=42;y<70;y++){zpx(A,86,y,'#c8b48a');zpx(A,89,y,'#c8b48a');if(y%3===0){zpx(A,87,y,R.trunk[2]);zpx(A,88,y,R.trunk[2])}}
if(p>=7){zball(A,42,34,2.6,3,R.trunk);if(f%8!==6){zpx(A,41,33,'#f6cf57');zpx(A,43,33,'#f6cf57')}zpx(A,42,35,'#ef8a3c')}
if(p>=10)DEER.forEach((row,j)=>{for(let i=0;i<row.length;i++)if(row[i]!=='.')zpx(A,103+i,61+j+(j<3&&f%8>=6?1:0),DEERC[row[i]])});
if(p>=12){for(let x=24;x<32;x++){zpx(A,x,69,R.trunk[2]);zpx(A,x,67,R.trunk[1])}zpx(A,24,70,R.trunk[0]);zpx(A,31,70,R.trunk[0]);zpx(A,24,68,R.trunk[0]);zpx(A,31,68,R.trunk[0]);for(let k=0;k<10;k++)zpx(A,36,70-k,'#3a3f4d');zpx(A,35,60,'#3a3f4d');zpx(A,37,60,'#3a3f4d');zpx(A,36,61,f%4<3?'#fff6c0':'#f6cf57')}
if(p>=14)[[46,77,4],[100,77,3.5]].forEach(([x,y,r])=>{for(let k=0;k<4;k++){zpx(A,x,y-k,'#eadbb6');zpx(A,x+1,y-k,'#c8b48a')}zball(A,x+.5,y-4,r+1,r*.8,R.red,(xx,yy)=>yy<=y-4);zpx(A,x,y-1,OUT);zpx(A,x-1,y-6,'#fff6dc');zpx(A,x+2,y-7,'#fff6dc');zpx(A,x+1,y-2,'#f6cf57')});
if(p>=15){const by=29;for(let x=58;x<71;x++)for(let y=by-6;y<by;y++)zpx(A,x,y,zpick(R.stone,.85-(x-58)/13*.6,x,y));[57,70].forEach((x,i)=>{for(let y=by-10;y<by;y++){zpx(A,x,y,R.stone[2]);zpx(A,x+1,y,R.stone[1])}zpx(A,x,by-11,R.blue[2]);zpx(A,x+1,by-11,R.blue[1]);zpx(A,x,by-12,R.blue[3]);zpx(A,x+1,by-14,OUT);zpx(A,x+1,by-13,OUT);zpx(A,x+2,by-14+((f%4)<2?0:1),i?'#f6cf57':'#d0503f')});zpx(A,64,by-1,'#3a2416');zpx(A,64,by-2,'#3a2416');zpx(A,61,by-4,'#f6cf57');zpx(A,67,by-4,'#f6cf57')}
return()=>{if(p>=3)for(let i=0;i<3;i++){const a=f/8*TAU+i*2.1;zpx(L,46+Math.cos(a)*5,51+Math.sin(a)*3,i%2?'#f6cf57':'#141821')}
if(p>=11)for(let i=0;i<4;i++){const a=f/8*TAU+i*TAU/4;zspark(L,Math.round(64+Math.cos(a)*30),Math.round(38+Math.sin(a)*12),false,i%2?'#ffd0f0':'#d0f8ff')}}}
function legendIsland(A,L,p,f,bob){
if(p>=6){zfloat(A,30,34+bob,12,false);for(let x=22;x<37;x++){zpx(A,x,31+bob,R.stone[2]);zpx(A,x,32+bob,R.stone[1])}for(let x=23;x<37;x+=4)for(let y=24;y<31;y++)zpx(A,x,y+bob,y%2?'#fff6dc':'#e2e8f4');for(let k=0;k<4;k++)for(let x=22+k*2;x<37-k*2;x++)zpx(A,x,23-k+bob,zpick(R.stone,x<29?.85:.4,x,23-k))}
if(p>=13){for(let k=0;k<15;k++)for(let x=39;x<42;x++)zpx(A,x,32-k+bob,zpick(R.violet,.9-(x-39)/3*.7,x,32-k));for(let k=0;k<5;k++)for(let x=38+k*.5;x<43-k*.5;x++)zpx(A,x,17-k+bob,zpick(R.blue,x<40.5?.8:.3,x,17-k))}
if(p>=2){zfloat(A,24,74,17,false);if(!(p>=8))0;for(let y=69;y<76;y+=2)for(let x=12+(y%4?1:0);x<38;x+=2)if(Math.abs(x-24)<15-Math.abs(y-74)*1.5)zpx(A,x,y,f%4<2&&x%4===0?'#fff0a8':'#f2c94c')}
if(p>=8){zballFn(A,14,70,4,4,(x,y,t)=>y<=70?zpick(R.white,t,x,y):null);zpx(A,15,67,OUT);zpx(A,15,68,OUT);zline(A,15,66,18,64,'#3a3f4d')}
if(p>=3)lmill(A,32,71,11,f);
if(p>=9)for(let y=76;y<100;y++)for(let dx=0;dx<2;dx++)zpx(A,8+dx,y,zhash(dx,y-f*2,4)>.72?'#e0f6ff':R.water[1+dx]);
if(p>=4){zline(A,40,72,62,64,'#8a6440');for(let i=0;i<8;i++)zpx(A,42+i*2.6,71-i*.95+(i>2&&i<6?1:0),'#c8b48a')}
if(p>=1){for(let x=48;x<63;x++)zpx(A,x,63,R.trunk[2]);zpx(A,50,64,R.trunk[0]);zpx(A,50,65,R.trunk[0]);zpx(A,56,64,R.trunk[0]);const by=56+bob;zballFn(A,44,by,6,2.6,(x,y,t)=>y>=by?zpick(R.trunk,t,x,y):null);zline(A,44,by,44,by-8,R.trunk[0]);for(let k=0;k<7;k++)for(let x=45;x<46+k*.7;x++)zpx(A,x,by-8+k,'#f4f1e8')}
if(p>=7)for(let x=66;x<136;x+=3){const n=3+Math.floor(zhash(x,1,9)*7);for(let k=0;k<n;k++)zpx(A,x,66+k,'#3fa64a');zpx(A,x,66+n,zhash(x,2,9)>.5?'#f29bc8':'#fff0f6')}
if(p>=12){zfloat(A,150,86,13,false);[142,149,156].forEach((x,i)=>{zpx(A,x,84,R.trunk[1]);zpx(A,x,83,R.trunk[1]);zpx(A,x+4,84,R.trunk[1]);zpx(A,x+4,83,R.trunk[1]);for(let xx=x-1;xx<x+6;xx++){zpx(A,xx,82,(xx%2)?'#fff6dc':['#d0503f','#4a78e0','#62d06a'][i]);zpx(A,xx,81,(xx%2)?['#d0503f','#4a78e0','#62d06a'][i]:'#fff6dc')}zpx(A,x+2,84,'#f6cf57')})}
if(p>=11){lballoon(A,64,20+bob,4,R.blue,R.white);lballoon(A,84,8-bob,3.5,R.gold,R.red);lballoon(A,12,14+bob,3.5,R.leaf,R.white)}
if(p>=5){const y=12+bob;zballFn(A,112,y,11,4,(x,yy,t)=>zpick((x>>2)%2?R.stone:R.red,t,x,yy));for(let x=108;x<117;x++){zpx(A,x,y+5,R.trunk[2]);zpx(A,x,y+6,R.trunk[1])}zpx(A,100,y+(f%2),'#e2e8f4');zpx(A,100,y-1+(f%2)*2,'#e2e8f4')}
if(p>=15)A.gold=true;
return()=>{if(p>=10){const a=f/8*TAU,x=Math.round(60+Math.cos(a)*44),y=Math.round(10+Math.sin(a)*6),d=Math.cos(a+Math.PI/2)>0?1:-1;for(let k=0;k<7;k++){zpx(L,x-d*k,y+Math.round(Math.sin(k*.9+f)*1),k<2?'#d0503f':'#9a2e2a')}zpx(L,x+d,y-1,'#f6cf57');const w=f%2?-2:2;zline(L,x-d*3,y,x-d*5,y+w,'#d0503f');zline(L,x-d*3,y,x-d*1,y+w,'#ef8a3c')}
if(p>=13&&f%4<2)zspark(L,40,10+bob,false,'#efe4ff');
if(p>=14)lworks(L,[[60,10],[150,16],[118,34]],f);
if(p>=15)for(let i=0;i<4;i++)if((f+i)%3)zspark(L,90+i*14,30+((i*7)%10),false,'#fff0a8')}}
const COMBON=['Nichoir','Maisonnette de Momo','Grande cascade','Ruche','Un ami pour Momo','Port aérien','Cabane perchée','Mare','Îlot ferme & moulin','Hibou','Feu de camp','Dirigeable','Fées','Dragon','Grande fête'];
const COMBO={key:'combo',name:'Tout-en-un',sub:'',acc:'#f6cf57',st:['Rocher','Éclosion','Jeune pousse','Hameau','Floraison','Royaume','Arbre-monde']};
function cdome(b,tx,cy,Rr,f,big){const sw=Math.round(sn(f)),r=Rr*(big?.3:.36),fl=big?.42:.55;const S=y=>y<cy-Rr*.2?sw:0;
const n=big?9:6;for(let i=0;i<n;i++){const a=Math.PI*(i+.5)/n,x=tx+Math.cos(a)*Rr,y=cy-Math.sin(a)*Rr*fl+4;zball(b,x+S(y),y,r*1.05,r*.95,R.leafD)}
for(let i=0;i<n-1;i++){const a=Math.PI*(i+.5)/(n-1),x=tx+Math.cos(a)*Rr*.68,y=cy-Math.sin(a)*Rr*fl*.9;zball(b,x+S(y),y,r*1.1,r,R.leaf)}
for(let i=0;i<(big?7:4);i++){const x=tx-Rr*.85+i*(Rr*1.7/((big?7:4)-1)),y=cy+Rr*.12;zball(b,x,y,r*.95,r*.8,R.leaf)}
zball(b,tx+sw,cy-Rr*.15,r*1.35,r*1.2,R.leaf)}
function ctrunk(b,tx,gy,top,w0,w1){for(let y=top;y<=gy;y++){const k=(y-top)/(gy-top),w=w1+(w0-w1)*k*k,x0=tx-w/2;for(let x=Math.round(x0);x<Math.round(x0+w);x++){let c=zpick(R.trunk,.92-(x-x0)/w*.8,x,y);if(w>8&&zhash(x>>1,y>>2,4)>.82)c=R.trunk[0];zpx(b,x,y,c)}}}
function lcastle(b,x0,gy,f){const top=gy-11;for(let x=x0;x<x0+24;x++)for(let y=top;y<=gy;y++)zpx(b,x,y,zpick(R.stone,.85-(x-x0)/24*.6,x,y));for(let x=x0;x<x0+24;x+=3){zpx(b,x,top-1,R.stone[2]);zpx(b,x+1,top-1,R.stone[1])}
[x0-2,x0+22].forEach((tx,i)=>{for(let y=gy-18;y<=gy;y++)for(let x=tx;x<tx+6;x++)zpx(b,x,y,zpick(R.stone,.9-(x-tx)/6*.7,x,y));zpx(b,tx+2,gy-13,'#f6cf57');for(let k=0;k<7;k++)for(let x=tx-1+k*.6;x<tx+7-k*.6;x++)zpx(b,x,gy-19-k,zpick(R.blue,x<tx+3?.85:.35,x,gy-19-k));const fy=gy-28;for(let k=0;k<3;k++)zpx(b,tx+3,fy+k,OUT);for(let k=1;k<6;k++){zpx(b,tx+3+k,fy+((k+f)%4<2?0:1),i?'#f2c94c':'#d0503f');zpx(b,tx+3+k,fy+1+((k+f)%4<2?0:1),i?'#c08a22':'#9a2e2a')}});
for(let y=gy-5;y<=gy;y++)for(let x=x0+10;x<x0+14;x++)zpx(b,x,y,'#3a2416');zpx(b,x0+4,gy-7,'#f6cf57');zpx(b,x0+19,gy-7,'#f6cf57')}
function GCOMBO(s,f,p){const W=200,H=150,b=zmk(W,H),cx=100,gy=96,rx=[11,18,28,38,48,58,66][s],bob=Math.round(sn(f));
const lay=fn=>{const t=zmk(W,H);fn(t);zout(t);t.p.forEach((c,i)=>{if(c)b.p[i]=c})};
const paste=(src,ox,oy)=>src.p.forEach((c,i)=>{if(c){const x=i%src.w+ox,y=((i/src.w)|0)+oy;if(x>=0&&y>=0&&x<W&&y<H)b.p[y*W+x]=c}});
const WT=s===6,tx=WT?92:cx-[0,6,12,16,18,20,0][s],mx=WT?142:tx+[14,16,24,30,36,40,0][s];
// sky extras behind
if(s>=5)lay(t=>{zfloat(t,186,62+bob,11,false);lmill(t,188,59+bob,10,f)});
if(p>=12)lay(t=>{const y=14+bob;zballFn(t,26,y,11,4,(x,yy,tt)=>zpick((x>>2)%2?R.stone:R.red,tt,x,yy));for(let x=22;x<31;x++){zpx(t,x,y+5,R.trunk[2]);zpx(t,x,y+6,R.trunk[1])}zpx(t,14,y+(f%2),'#e2e8f4');zpx(t,14,y-1+(f%2)*2,'#e2e8f4')});
if(p>=9)lay(t=>{zfloat(t,178,122,14,false);for(let y=117;y<123;y+=2)for(let x=166;x<190;x+=2)if(Math.abs(x-178)<12-Math.abs(y-122))zpx(t,x,y,f%4<2&&x%4===0?'#fff0a8':'#f2c94c');lmill(t,184,119,10,f)});
// island
lay(t=>{zfloat(t,cx,gy,rx,s===0);for(let x=cx-rx+4;x<cx+rx-4;x+=5)if(zhash(x,3,6)>.6&&s>0)zpx(t,x,gy-2+Math.floor(zhash(x,4,6)*4),zhash(x,5,6)>.5?'#f29bb8':'#fff0a8')});
if(s>=4||p>=3)for(let y=gy-1;y<H;y++)for(let dx=0;dx<3;dx++)zpx(b,cx-rx+3+dx,y,zhash(dx,y-f*2,4)>.72?'#e0f6ff':zpick(R.water,.3+dx*.25,cx-rx+3+dx,y));
// back scenery
if(s>=5)lay(t=>lcastle(t,WT?38:cx-rx+8,gy-1,f));
if(s>=3&&!WT)lay(t=>{zhouse(t,cx-rx+(s>=5?36:6),gy-1,8,6);if(s>=4)zhouse(t,cx+rx-16,gy,7,5)});
if(s>=4)lay(t=>{const lx=cx+rx-(WT?8:6),ly=gy-1;for(let k=0;k<16;k++)for(let x=lx;x<lx+4;x++)zpx(t,x,ly-k,zpick(Math.floor(k/3)%2?R.wall:R.red,.9-(x-lx)/4*.6,x,ly-k));for(let x=lx-1;x<lx+5;x++)zpx(t,x,ly-16,R.red[1]);for(let x=lx;x<lx+4;x++){zpx(t,x,ly-17,f%4<2?'#fff6c0':'#c08a22');zpx(t,x,ly-18,'#f6cf57');zpx(t,x,ly-19,R.red[2])}});
// tree
lay(t=>{if(s===0){zball(t,tx,gy-1.5,4.5,1.8,R.dirt);zball(t,tx,gy-2.5,2.2,1.7,R.trunk)}
if(s===1){const w=Math.round(sn(f));for(let y=gy-9;y<gy;y++){zpx(t,tx+(y<gy-5?w:0),y,'#3fa64a');zpx(t,tx+1+(y<gy-5?w:0),y,'#2a7a3a')}zball(t,tx-3+w,gy-8,3.2,1.8,R.leaf);zball(t,tx+4.5+w,gy-10,3.4,2,R.leaf)}
if(s>=2&&!WT){const R_=[0,0,10,15,20,26][s],top=gy-[0,0,14,22,30,40][s];ctrunk(t,tx,gy,top,[0,0,3,5,7,9][s],[0,0,2,3,4,5][s]);if(s>=4){zline(t,tx,top+8,tx-R_*.6,top-2,R.trunk[1],2);zline(t,tx,top+8,tx+R_*.6,top-2,R.trunk[0],2)}cdome(t,tx,top-R_*.25,R_,f,false)}
if(WT){const top=40;ctrunk(t,tx,gy,top,20,11);[[-1,1],[1,1]].forEach(([d])=>{for(let j=0;j<3;j++)zline(t,tx+d*(6+j*2),gy-1+j*.5,tx+d*(16+j*5),gy+2+j,R.trunk[1+j%2],2)});
[[-.9,62,-46,34],[.9,60,48,32],[-.4,52,-22,22],[.4,50,24,20]].forEach(([d,y0,dx,y1])=>zline(t,tx+d*4,y0,tx+dx,y1,R.trunk[d<0?2:1],4));
cdome(t,tx,44,64,f,true)}});
if(s>=4){const n=s===6?10+p*2:s===5?8:6,Rr=s===6?64:[0,0,10,15,20,26][s],cy=s===6?44:gy-[0,0,14,22,30,40][s]-Rr*.25;for(let i=0;i<n;i++){const a=zhash(i,1,12)*Math.PI,rr=zhash(i,2,12)*.8,x=tx+Math.cos(a)*Rr*rr,y=cy-Math.sin(a)*Rr*rr*.45+4;const on=(f+i)%4!==0;if(zget(b,x,y))zpx(b,x,y,s===4?(i%2?'#f29bb8':'#fff0f6'):on?'#fff6c0':'#f6cf57')}}
if(WT){for(let i=0;i<6;i++){const ry=58+i*5,x=tx-4+(i%2)*8;if((f+i)%3)zpx(b,x,ry,'#9fe8ff');zpx(b,x+1,ry,'#4aa8c8')}
for(let i=0;i<9;i++){const x=tx-56+i*14+Math.round(zhash(i,4,4)*6),len=6+Math.floor(zhash(i,5,4)*12),y0=60+Math.round(zhash(i,6,4)*8);for(let k=0;k<len;k++)zpx(b,x+Math.round(Math.sin(k*.4+f*.785)*.6),y0+k,'#2a7a3a');if(i%2===0){zpx(b,x,y0+len,'#fff6c0');zpx(b,x,y0+len+1,'#f6cf57')}}}
// Momo
NOG=true;const B=GBLOB(s,f);NOG=false;paste(B,mx-32,gy-54);
// legend paliers
if(p>=2)lay(t=>zhouse(t,66,99,9,6));
if(p>=1)lay(t=>{const x=97,y=78;for(let yy=y;yy<y+4;yy++)for(let xx=x;xx<x+4;xx++)zpx(t,xx,yy,zpick(['#5a3a22','#9c7146','#c89a62'],.9-(xx-x)/4*.6,xx,yy));for(let xx=x-1;xx<x+5;xx++)zpx(t,xx,y-1,R.red[2]);zpx(t,x+1,y+1,OUT);zpx(t,x+2,y+1,OUT);if(f%8<4){zpx(t,x+5,y,'#f6cf57');zpx(t,x+6,y,'#d0503f')}});
if(p>=4)lay(t=>{zline(t,64,72,64,76,'#c8b48a');zballFn(t,64,79,2.6,3.2,(x,y,tt)=>zpick(y%2?R.gold:['#5a3a12','#7a4e12','#9a6a1a'],tt,x,y))});
if(p>=7)lay(t=>{for(let x=36;x<58;x++){zpx(t,x,42,R.trunk[2]);zpx(t,x,43,R.trunk[1])}zhouse(t,38,41,8,5);zhouse(t,48,41,7,5);for(let y=44;y<60;y++){zpx(t,44,y,'#c8b48a');if(y%3===0)zpx(t,45,y,'#c8b48a')}});
if(p>=10)lay(t=>{zball(t,124,36,2.6,3,R.trunk);if(f%8!==6){zpx(t,123,35,'#f6cf57');zpx(t,125,35,'#f6cf57')}zpx(t,124,37,'#ef8a3c')});
if(p>=8)lay(t=>{zball(t,82,104,7,2,R.water);zpx(t,79,104,'#62d06a');zpx(t,84,103,'#3fa64a');if(f%4===0)zpx(t,83,104,'#e0f6ff')});
if(p>=5)lay(t=>lminiblob(t,112,103,3.5,SKINS['sk-menthe'],f,0));
if(p>=11)lay(t=>lfire(t,160,103,f));
if(p>=6)lay(t=>{for(let x=20;x<36;x++)zpx(t,x,gy-1,R.trunk[2]);zpx(t,24,gy,R.trunk[0]);zpx(t,24,gy+1,R.trunk[0]);const by=gy-8+bob,bx=16;zballFn(t,bx,by,6,2.6,(x,y,tt)=>y>=by?zpick(R.trunk,tt,x,y):null);zline(t,bx,by,bx,by-8,R.trunk[0]);for(let k=0;k<7;k++)for(let x=bx+1;x<bx+2+k*.7;x++)zpx(t,x,by-8+k,'#f4f1e8')});
if(p>=13)for(let i=0;i<6;i++){const a=f/8*TAU+i*TAU/6;zspark(b,Math.round(tx+Math.cos(a)*50),Math.round(34+Math.sin(a)*14),i%3===0,i%2?'#ffd0f0':'#d0f8ff')}
if(p>=4)for(let i=0;i<3;i++){const a=f/8*TAU+i*2.1;zpx(b,64+Math.cos(a)*5,79+Math.sin(a)*3,i%2?'#f6cf57':'#141821')}
if(p>=14){const a=f/8*TAU,x=Math.round(100+Math.cos(a)*80),y=Math.round(12+Math.sin(a)*6),d=Math.cos(a+Math.PI/2)>0?1:-1;for(let k=0;k<9;k++)zpx(b,x-d*k,y+Math.round(Math.sin(k*.9+f)),k<2?'#d0503f':'#9a2e2a');zpx(b,x+d,y-1,'#f6cf57');const w=f%2?-3:3;zline(b,x-d*4,y,x-d*7,y+w,'#d0503f');zline(b,x-d*4,y,x-d,y+w,'#ef8a3c')}
if(p>=15){for(let x=30;x<156;x++){const y=Math.round(66+Math.sin((x-30)/126*Math.PI)*8);if(!zget(b,x,y)||x%2)zpx(b,x,y,'#3a3f4d');if(x%6===0)zpx(b,x,y+1,['#f29bc8','#7fdcf0','#f6cf57','#62d06a'][((x/6)+f)%4])}lworks(b,[[16,30],[186,24],[170,8]],f)}
if(!WT&&s>=2)for(let i=0;i<2;i++){const x=(f*4+i*40)%120+40,y=10+i*8+(f%2);zbird(b,x,y,f)}
return b}
function zcompose(key,s,p,eq,f){f=key==='planet'?f%16:f%8;const acc=eq.acc||[];const id=['C',key,s,p,eq.skin,eq.leaf,eq.ground,eq.bg,acc.join('+'),eq.pet,f].join('|');if(ZC[id])return ZC[id];
let sp=key==='combo'?GCOMBO(s,f,p):GEN[key](s,f);const LG=p>=1&&LEGNS[key];let OX=0,OY=0;
if(LG){const isI=key==='island',W2=isI?170:128,H2=isI?100:80;OX=isI?40:32;OY=isI?20:16;const nb=zmk(W2,H2);sp.p.forEach((c,i)=>{if(c){const x=i%sp.w+OX,y=((i/sp.w)|0)+OY;if(x<W2&&y<H2)nb.p[y*W2+x]=c}});sp=nb}
const W=sp.w,H=sp.h,out=zmk(W,H),P=(x,y,c)=>zpx(out,x,y,c);
let skin=eq.skin&&SKINS[eq.skin];if(eq.skin==='sk-prisme')skin=SKL[Math.floor(f/2)%SKL.length];
const remap=(m)=>{sp.p=sp.p.map(c=>c&&m.has(c)?m.get(c):c)};
if(skin){const m=new Map();MAIN[key].forEach(r=>r.forEach((c,i)=>m.set(c,skin[Math.round(i*(skin.length-1)/(r.length-1))])));remap(m)}
const rmp=(from,to)=>{const m=new Map();from.forEach(r=>r.forEach((c,i)=>m.set(c,to[Math.round(i*(to.length-1)/(r.length-1))])));remap(m)};
if(eq.leaf&&LEAFS[eq.leaf])rmp([R.leaf,R.leafD],LEAFS[eq.leaf]);if(eq.ground&&GRS[eq.ground])rmp([R.grass],GRS[eq.ground]);if(eq.ground==='gr-cristal')rmp([R.rock],R.cyan);
let x0=W,x1=0,y0=H,y1=0;sp.p.forEach((c,i)=>{if(c){const x=i%W,y=(i/W)|0;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}});if(key==='planet'){x0=17;x1=47;y0=17;y1=47}
const cx=LG&&key!=='island'?64:Math.round((x0+x1)/2),gy=GYR[key]!=null?GYR[key]+OY:y1-2;let gl=x0,gr=x1;{let a=-1,z=-1;for(let x=0;x<W;x++)if(sp.p[gy*W+x]){if(a<0)a=x;z=x}if(a>=0){gl=a;gr=z}}
let ty=y0,tcx=cx;for(let y=0;y<H;y++){let n=0,sx=0;for(let x=0;x<W;x++)if(sp.p[y*W+x]){n++;sx+=x}if(n>=5){ty=y;tcx=Math.round(sx/n);break}}
if(eq.bg==='bg-sunset'){const r=['#1e1236','#3e1a4a','#7a2a52','#c04a4a','#ef8a4a','#f6c06a'];for(let y=0;y<H;y++)for(let x=0;x<W;x++)P(x,y,zpick(r,y/H*1.05,x,y));zball(out,W*.78,H*.6,6,6,['#ef8a4a','#f6c06a','#fff0b8'])}
if(eq.bg==='bg-space')for(let y=0;y<H;y++)for(let x=0;x<W;x++){const n=znoise(x*.07,y*.07,13);if(n>.5)P(x,y,zpick(['#120a26','#2a1450','#4a2a7a','#7a3a8a'],(n-.5)*3,x,y));else if(zhash(x,y,21)>.985)P(x,y,(x+f)%3?'#c9d1ff':'#ffffff')}
if(eq.bg==='bg-aurora')for(let x=0;x<W;x++){const yc=6+Math.sin(x*.12+f*.785)*3+Math.sin(x*.05)*2;for(let k=0;k<8;k++){const y=Math.round(yc+k);if((x+y)%2||k<4)P(x,y,zpick(['#0e2a2a','#1a6a4a','#3ac07a','#9af0b0'],1-k/8,x,y))}}
if(!LG&&p>=1&&key!=='combo'){if(p>=7)for(let x=0;x<W;x++){const yc=6+Math.sin(x*.12+f*.785)*3;for(let k=0;k<6;k++){const y=Math.round(yc+k);if((x+y)%2||k<3)P(x,y,zpick(['#1a1040','#3a2a8a','#7a5ae0','#c0a8ff'],1-k/6,x,y))}}
if(p>=4)for(let i=0;i<7;i++){const y=(Math.floor(zhash(i,4,5)*H)+f*4)%H,x=(Math.floor(zhash(i,3,5)*W)+Math.floor(y*.5))%W;P(x,y,'#e0e8ff');P(x-1,y-2,'#6a78a8')}}
if(acc.includes('ac-rainbow')){const r0=Math.max(10,(x1-x0)/2+2),cols=['#7a4fd0','#4a78e0','#62d06a','#f6cf57','#ef8a3c','#d0503f'];for(let y=0;y<gy;y++)for(let x=0;x<W;x++){const k=Math.floor(Math.hypot(x-cx,(y-gy)*1.1)-r0);if(k>=0&&k<6)P(x,y,cols[k])}}
const A=zmk(W,H),Lr=zmk(W,H);let late=null;
if(LG&&key!=='island'){const g2=zmk(W,H);zground(g2,64,70,56);zout(g2);g2.p.forEach((c,i)=>{if(c)out.p[i]=c})}
if(LG){if(key==='blob')late=legendBlob(A,Lr,p,f);if(key==='tree')late=legendTree(A,Lr,p,f);if(key==='island')late=legendIsland(A,Lr,p,f,Math.round(sn(f)))}
if(A.gold){const m=new Map();[R.blue,R.roof].forEach(r=>r.forEach((c,i)=>m.set(c,R.gold[Math.round(i*(R.gold.length-1)/(r.length-1))])));remap(m)}
const back=zmk(W,H),front=zmk(W,H);if(LG&&key==='blob'){A.p.forEach((c,i)=>{if(c)((i/W|0)<64||!LG?back:front).p[i]=c})}else A.p.forEach((c,i)=>{if(c)front.p[i]=c});
zout(back);back.p.forEach((c,i)=>{if(c)out.p[i]=c});
sp.p.forEach((c,i)=>{if(c)out.p[i]=c});
zout(front);front.p.forEach((c,i)=>{if(c)out.p[i]=c});
if(late)late();Lr.p.forEach((c,i)=>{if(c)out.p[i]=c});
if(!LG&&p>=2&&key!=='combo'){const hc=p>=8?'#f2c94c':'#d08a4a';for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(sp.p[i])continue;if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>sp.p[(y+dy)*W+x+dx]))out.p[i]=(x+y+f)%2?hc:out.p[i]}}
const part=fn=>{const t=zmk(W,H);fn(t);zout(t);t.p.forEach((c,i)=>{if(c)out.p[i]=c})};
if(acc.includes('ac-flag')){const x=gr-3,yb=gy-1;part(t=>{for(let k=0;k<10;k++)zpx(t,x,yb-k,R.trunk[1]);for(let i=1;i<6;i++)for(let j=0;j<3;j++)zpx(t,x+i,yb-9+j+(i>2&&(i+f)%4<2?1:0),j===1?'#f6cf57':'#d0503f')})}
if(acc.includes('ac-lantern')){const x=gl+2,yb=gy-1,on=f%4!==3;part(t=>{for(let k=0;k<8;k++)zpx(t,x,yb-k,'#3a3f4d');zpx(t,x+1,yb-7,'#3a3f4d');zpx(t,x+2,yb-7,'#3a3f4d');zpx(t,x+2,yb-6,'#3a3f4d');zpx(t,x+2,yb-5,on?'#fff6c0':'#f6cf57');zpx(t,x+3,yb-5,on?'#f6cf57':'#c08a22');zpx(t,x+2,yb-4,'#c08a22');zpx(t,x+3,yb-4,'#7a4e12')})}
if(acc.includes('ac-flowers')){const fc=['#f29bb8','#fff0f6','#f6cf57'];for(let i=-4;i<=4;i++){P(tcx+i,ty-1,i%2?'#3fa64a':fc[(i+4)%3]);if(i%2===0)P(tcx+i,ty-2,fc[(i+5)%3])}}
const sx0=LG?OX+6:x0,sx1=LG?OX+58:x1;
if(eq.pet==='pet-firefly'){const a=f/8*TAU,x=(sx0+sx1)/2+Math.cos(a)*((sx1-sx0)/2+3),y=(y0+gy)/2+Math.sin(a)*5;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>P(x+dx,y+dy,'#6a8a30'));P(x,y,f%2?'#fff6c0':'#e8ff9a')}
if(eq.pet==='pet-bird'){const x=sx0-4+((f*5)%(sx1-sx0+12)),y=Math.max(3,ty-3)+(f%2);part(t=>zbird(t,x,y,f))}
if(eq.pet==='pet-slime'){const h=[0,1,3,4,3,1,0,0][f%8],x=LG?OX+4:gl+7,y=gy-3-h;part(t=>{zball(t,x,y,3.2,2.6,R.blob);zpx(t,x-1,y-1,OUT);zpx(t,x+1,y-1,OUT)})}
if(eq.pet==='pet-cat'){const x=LG?OX+50:gr-12,yb=gy-1;part(t=>CAT.forEach((row,j)=>{for(let i=0;i<7;i++){let ch=row[i];if(ch==='t'&&f%8>=4&&j===4)ch='.';if(ch!=='.')zpx(t,x+i,yb-6+j,CATC[ch])}if(f%8>=4)zpx(t,x+6,yb-3,CATC.t)}))}
return ZC[id]=zurl(out)}

export { DAYS, LEG, EVOS, COMBO, ITEMS, zcompose, zcoin, LOCK, LN };
