const fs=require('fs'),path=require('path'),config=require('./config');
class Logger{
constructor(){this.logPath=path.resolve(process.cwd(),config.logFile);}
_ts(){return new Date().toISOString();}
_write(line){try{fs.appendFileSync(this.logPath,line+'\n');}catch(e){}}
_print(line){console.log(line);this._write(line);}
banner(text){this._print(`\n== ${text} ==\n`);}
separator(label=''){this._print(`-- ${label} --`);}
info(msg){this._print(`[${this._ts()}] ${msg}`);}
success(msg){this._print(`[${this._ts()}] OK: ${msg}`);}
warn(msg){this._print(`[${this._ts()}] WARN: ${msg}`);}
error(msg){this._print(`[${this._ts()}] ERROR: ${msg}`);}
taLine(ta,score){
const rsi=ta.rsi!=null?ta.rsi.toFixed(1):'--';
const hist=ta.macd?(ta.macd.hist>0?'+':'')+ta.macd.hist.toFixed(2):'--';
const vwap=ta.vwap?'$'+Math.round(ta.vwap):'--';
const d1=ta.d1!=null?ta.d1.toFixed(3)+'%':'--';
const d3=ta.d3!=null?ta.d3.toFixed(3)+'%':'--';
this._print(`[${this._ts()}] BTC $${Math.round(ta.price)} RSI:${rsi} MACD:${hist} VWAP:${vwap} HA:${ta.haColor} D1:${d1} D3:${d3} Score:${score.toFixed(1)}%`);}
signal(side,longPct,shortPct){this._print(`[${this._ts()}] SIGNAL: BUY ${side} (LONG ${longPct}% / SHORT ${shortPct}%)`);}
order(order,side,contracts,priceInCents,isLive){
const mode=isLive?'LIVE':'PAPER';
const cost=((priceInCents/100)*contracts).toFixed(2);
const id=order.order_id||order.id||'n/a';
this._print(`[${this._ts()}] ${mode} ORDER: BUY ${contracts}x ${side} @ ${priceInCents}c Cost:$${cost} ID:${id}`);}}
module.exports={Logger};
