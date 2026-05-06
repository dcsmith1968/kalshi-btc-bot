require('dotenv').config();
const{KalshiClient}=require('./kalshi');
const{fetchTA}=require('./ta');
const{scoreTA}=require('./score');
const{Logger}=require('./logger');
const{RiskManager}=require('./risk');
const config=require('./config');
const log=new Logger();
const risk=new RiskManager(config);
let running=true,cycleCount=0,lastTicker=null;
process.on('SIGINT',()=>{log.info('\nShutting down...');running=false;risk.printSummary(log);process.exit(0);});
async function run(){
const mode=config.liveMode?'LIVE':'PAPER';
log.banner(`Kalshi BTC Bot | ${mode} | Threshold: >${config.longThreshold}% / <${config.shortThreshold}% | Max bet: $${config.maxBetSize}`);
const client=new KalshiClient(config);
try{await client.authenticate();log.success('Kalshi auth OK');}
catch(e){log.error(`Auth failed: ${e.message}`);process.exit(1);}
while(running){
cycleCount++;
log.separator(`Cycle #${cycleCount} ${new Date().toLocaleTimeString()}`);
try{
const market=await client.findBTCMarket();
if(!market){log.warn('No active BTC market found');await sleep(config.pollIntervalMs);continue;}
if(market.ticker!==lastTicker){log.info(`Market: ${market.ticker} | "${market.title}"`);lastTicker=market.ticker;}
const ta=await fetchTA();
if(!ta){log.warn('TA fetch failed');await sleep(config.pollIntervalMs);continue;}
const score=scoreTA(ta);
log.taLine(ta,score);
if(risk.hasOpenPosition(market.ticker)){log.info(`Already in position — holding`);await sleep(config.pollIntervalMs);continue;}
if(!risk.canTrade(log)){await sleep(config.pollIntervalMs);continue;}
let side=null;
if(score>=config.longThreshold)side='YES';
else if(score<=config.shortThreshold)side='NO';
if(!side){log.info(`Score ${score.toFixed(1)}% — no signal`);await sleep(config.pollIntervalMs);continue;}
log.signal(side,score.toFixed(1),(100-score).toFixed(1));
const price=side==='YES'?market.yes_ask:market.no_ask;
const contracts=risk.size(price,config.maxBetSize);
if(contracts<1){log.warn('Bet too small — skip');await sleep(config.pollIntervalMs);continue;}
const order=await client.placeOrder({ticker:market.ticker,side,contracts,priceInCents:price});
risk.recordOrder(order,market,side,price,contracts,score);
log.order(order,side,contracts,price,config.liveMode);
}catch(err){log.error(`Cycle error: ${err.message}`);}
await sleep(config.pollIntervalMs);
}}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
run().catch(err=>{console.error('Fatal:',err);process.exit(1);});
