class RiskManager{
constructor(config){this.config=config;this.openPositions={};this.closedTrades=[];this.dailyLoss=0;this.dailyDate=new Date().toDateString();this.totalPnl=0;this.totalTrades=0;this.wins=0;}
_checkDayRollover(){const today=new Date().toDateString();if(today!==this.dailyDate){this.dailyLoss=0;this.dailyDate=today;}}
hasOpenPosition(ticker){return!!this.openPositions[ticker];}
canTrade(log){
this._checkDayRollover();
if(this.dailyLoss>=this.config.maxDailyLoss){log.warn(`Daily loss limit hit — trading paused`);return false;}
const openCount=Object.keys(this.openPositions).length;
if(openCount>=this.config.maxOpenTrades){log.warn(`Max open positions reached`);return false;}
return true;}
size(priceInCents,maxUSD){if(!priceInCents||priceInCents<=0)return 0;return Math.max(0,Math.floor(maxUSD/(priceInCents/100)));}
recordOrder(order,market,side,priceInCents,contracts,score){
this.openPositions[market.ticker]={orderId:order.order_id||order.id||'unknown',ticker:market.ticker,title:market.title,side,contracts,priceInCents,costUSD:(priceInCents/100)*contracts,score,openedAt:new Date()};
this.totalTrades++;}
settle(ticker,won){
const pos=this.openPositions[ticker];if(!pos)return;
const pnl=won?(1-pos.priceInCents/100)*pos.contracts:-(pos.priceInCents/100)*pos.contracts;
this.totalPnl+=pnl;if(!won)this.dailyLoss+=Math.abs(pnl);if(won)this.wins++;
this.closedTrades.push({...pos,pnl,won,closedAt:new Date()});
delete this.openPositions[ticker];return pnl;}
printSummary(log){
const closed=this.closedTrades.length,wr=closed>0?((this.wins/closed)*100).toFixed(1):'n/a';
log.separator('Session Summary');
log.info(`  Total cycles: ${this.totalTrades}`);
log.info(`  Closed trades: ${closed} (win rate: ${wr}%)`);
log.info(`  Open positions: ${Object.keys(this.openPositions).length}`);
log.info(`  Total P&L: $${this.totalPnl.toFixed(2)}`);
log.info(`  Daily loss: $${this.dailyLoss.toFixed(2)}`);}}
module.exports={RiskManager};
