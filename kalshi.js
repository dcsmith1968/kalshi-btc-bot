class KalshiClient{
constructor(config){this.config=config;this.baseUrl=config.kalshiBaseUrl;this.token=null;}
async authenticate(){
const res=await this._post('/login',{email:this.config.kalshiEmail,password:this.config.kalshiPassword},false);
this.token=res.token;this.memberId=res.member_id;return res;}
async ensureAuth(){if(!this.token)await this.authenticate();}
async findBTCMarket(){
await this.ensureAuth();
const data=await this._get('/markets',{status:'open',ticker_prefix:this.config.btcTickerPrefix,limit:'50'});
const markets=data.markets||[];
const btc=markets.filter(m=>m.ticker&&m.ticker.toUpperCase().includes('BTC')&&m.status==='open');
if(!btc.length)return null;
btc.sort((a,b)=>new Date(a.close_time)-new Date(b.close_time));
for(const m of btc){
const book=await this.getOrderBook(m.ticker);if(!book)continue;
const yesBid=book.yes?.[0]?.[0]??null,yesAsk=book.yes?.[book.yes.length-1]?.[0]??null;
const noBid=book.no?.[0]?.[0]??null,noAsk=book.no?.[book.no.length-1]?.[0]??null;
if(yesBid&&yesAsk&&noBid&&noAsk)return{...m,yes_bid:yesBid,yes_ask:yesAsk,no_bid:noBid,no_ask:noAsk};}
return btc[0]||null;}
async getOrderBook(ticker){
await this.ensureAuth();
try{const data=await this._get(`/markets/${ticker}/orderbook`);return data.orderbook||null;}catch{return null;}}
async placeOrder({ticker,side,contracts,priceInCents}){
await this.ensureAuth();
const body={ticker,client_order_id:`btcbot-${Date.now()}`,type:'limit',action:'buy',side:side.toLowerCase(),count:contracts,price:(priceInCents/100).toFixed(4)};
const data=await this._post('/portfolio/orders',body);return data.order||data;}
async getBalance(){await this.ensureAuth();const data=await this._get('/portfolio/balance');return data.balance||{};}
async _get(path,params={}){
const url=new URL(this.baseUrl+path);
Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));
const res=await fetch(url.toString(),{headers:this._headers()});return this._handle(res);}
async _post(path,body,auth=true){
const res=await fetch(this.baseUrl+path,{method:'POST',headers:{'Content-Type':'application/json',...(auth?this._headers():{})},body:JSON.stringify(body)});
return this._handle(res);}
_headers(){return{'Authorization':`Bearer ${this.token}`,'Content-Type':'application/json'};}
async _handle(res){
const text=await res.text();let json;try{json=JSON.parse(text);}catch{json={raw:text};}
if(!res.ok)throw new Error(`Kalshi API ${res.status}: ${json.message||json.error||text}`);
return json;}}
module.exports={KalshiClient};
