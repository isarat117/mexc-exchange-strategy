const veri = require('./veriAl')






  const fixData= async(symbol,interval,limit)=>{

   

        const data = {
            
            timestamp: [],
            open: [],
            close: [],
            high: [],
            low: [],
            vol: [],
            amount: []
        };
    
        const candles = await veri.getSymbolKline(symbol,interval,limit)
    
        candles.forEach((candle) => {
        data.timestamp.push(candle[0]);
        data.open.push(candle[1]);
        data.close.push(candle[2]);
        data.high.push(candle[3]);
        data.low.push(candle[4]);
        data.vol.push(candle[5]);
        data.amount.push(candle[6]);
        
        });
        return (data)
    
    

  

  }  
  

  




const calculateSuperTrend = (data, period, multiplier) => {
 
  const atr = ATR(data, period);

  
  const superTrendStart = (data[0].high + data[0].low) / 2;

  
  const superTrend = [];
  for (let i = 0; i < data.length; i++) {
  
    const up = superTrendStart + (multiplier * atr[i]);
    const down = superTrendStart - (multiplier * atr[i]);
    const close = data[i].close;

  
    let superTrendValue;
    if (i === 0) {
      superTrendValue = superTrendStart;
    } else if (superTrend[i - 1] === up) {
      superTrendValue = (close <= up) ? up : down;
    } else if (superTrend[i - 1] === down) {
      superTrendValue = (close >= down) ? down : up;
    }

  
    superTrend.push(superTrendValue);
  }

  
  return superTrend;
};
const sg =async()=>{
    data = await (fixData("btc_usdt","1d",100))
    console.log(data)
}
sg()