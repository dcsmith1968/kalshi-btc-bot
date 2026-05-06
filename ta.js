const config=require('./config');
async function fetchTA(){
try{
const r=await fetch(`${config.binanceBase}/api/v3/klines?symbol=BTCUSDT&interval=${config.klineInterval}&limit=${config.klineLimit}`);
if(!r.ok)throw new Error(`Binance ${r.status}`);
const raw=await r.json();
const k=raw.map(x=>({t:x[0],o:parseFloat(x[1]),h:parseFloat(x[2]),l:parseFloat(x[3]),c:parseFloat(x[4]),v:parseFloat(x[5])}));
const closes=k.map(x=>x.c);
const price=closes[closes.length-1];
const ha=heikenAshi(k);
const haColor=ha[ha.length-1].c>=ha[ha.length-1].o?'bull':'bear';
const rsi=calcRSI(closes,14);
const macd=calcMACD(closes);
const vwap=calcVWAP(k);
const d1=closes.length>=2?pct(closes[closes.length-2],price):null;
const d3=closes.length>=4?pct(closes[closes.length-4],price):null;
return{price,rsi,macd,vwap,haColor,d1,d3};
}catch(e){return null;}}
function heikenAshi(k){
const ha=[];
for(let i=0;i<k.length;i++){const x=k[i];const hc=(x.o+x.h+x.l+x.c)/4;const ho=i===0?(x.o+x.c)/2:(ha[i-1].o+ha[i-1].c)/2;ha.push({o:ho,h:Math.max(x.h,ho,hc),l:Math.min(x.l,ho,hc),c:hc});}
return ha;}
function calcRSI(c,p=14){
if(c.length<p+1)return null;
let ag=0,al=0;
for(let i=1;i<=p;i++){const d=c[i]-c[i-1];if(d>0)ag+=d;else al-=d;}
ag/=p;al/=p;
for(let i=p+1;i<c.length;i++){const d=c[i]-c[i-1];ag=(ag*(p-1)+Math.max(d,0))/p;al=(al*(p-1)+Math.max(-d,0))/p;}
return al===0?100:100-100/(1+ag/al);}
function calcEMA(v,p){const k=2/(p+1);let e=v[0];const o=[e];for(let i=1;i<v.length;i++){e=v[i]*k+e*(1-k);o.push(e);}return o;}
function calcMACD(c){
if(c.length<26)return null;
const e12=calcEMA(c,12),e26=calcEMA(c,26);
const line=e12.map((v,i)=>v-e26[i]);
const sig=calcEMA(line.slice(-9),9);
const last=line[line.length-1],s=sig[sig.length-1];
return{hist:last-s};}
function calcVWAP(k){
const mn=new Date();mn.setHours(0,0,0,0);
const src=k.filter(x=>x.t>=mn.getTime());
const b=src.length>3?src:k;
let tv=0,v=0;
for(const x of b){const tp=(x.h+x.l+x.c)/3;tv+=tp*x.v;v+=x.v;}
return v>0?tv/v:null;}
function pct(a,b){return((b-a)/a)*100;}
module.exports={fetchTA};
