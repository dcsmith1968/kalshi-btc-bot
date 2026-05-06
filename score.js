function scoreTA(ta){
const votes=[];
if(ta.rsi!=null){if(ta.rsi>55)votes.push(1);else if(ta.rsi<45)votes.push(-1);else votes.push(0);}
if(ta.macd)votes.push(ta.macd.hist>0?1:-1);
if(ta.haColor)votes.push(ta.haColor==='bull'?1:-1);
if(ta.vwap!=null&&ta.price!=null)votes.push(ta.price>ta.vwap?1:-1);
if(ta.d1!=null){if(ta.d1>0.02)votes.push(1);else if(ta.d1<-0.02)votes.push(-1);else votes.push(0);}
if(ta.d3!=null){const v=ta.d3>0.05?1:ta.d3<-0.05?-1:0;votes.push(v);votes.push(v);}
if(!votes.length)return 50;
const sum=votes.reduce((a,b)=>a+b,0),total=votes.length;
return Math.max(5,Math.min(95,((sum+total)/(total*2))*100));}
module.exports={scoreTA};
