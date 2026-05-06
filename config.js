require('dotenv').config();
module.exports={
liveMode:process.env.LIVE_MODE==='true',
kalshiEmail:process.env.KALSHI_EMAIL||'',
kalshiPassword:process.env.KALSHI_PASSWORD||'',
get kalshiBaseUrl(){
if(process.env.KALSHI_BASE_URL)return process.env.KALSHI_BASE_URL;
return this.liveMode
?'https://api.elections.kalshi.com/trade-api/v2'
:'https://demo-api.kalshi.co/trade-api/v2';
},
longThreshold:parseFloat(process.env.LONG_THRESHOLD)||60,
shortThreshold:parseFloat(process.env.SHORT_THRESHOLD)||40,
maxBetSize:parseFloat(process.env.MAX_BET_SIZE)||5,
maxOpenTrades:parseInt(process.env.MAX_OPEN_TRADES)||3,
maxDailyLoss:parseFloat(process.env.MAX_DAILY_LOSS)||25,
pollIntervalMs:parseInt(process.env.POLL_INTERVAL_MS)||60000,
binanceBase:'https://api.binance.com',
klineInterval:'1m',
klineLimit:50,
btcTickerPrefix:process.env.BTC_TICKER_PREFIX||'KXBTC',
logFile:process.env.LOG_FILE||'trades.log',
debug:process.env.DEBUG==='true',
};
