const axios = require('axios');
const BASE = "https://www.mexc.com";
const getMarketSymbols = async () => {
    const response =await  axios.get(`${BASE}/open/api/v2/market/symbols`);
    let symbols = [];
    response.data.data.forEach(symbol=>{symbols.push(symbol.symbol)})
   return symbols
};



// symbol örneği btc_usdt
const getSymbolKline = async (symbol,interval,limit) => {
    const response =await  axios.get(`${BASE}/open/api/v2/market/kline?symbol=${symbol}&interval=${interval}&limit=${limit}`);
    response.data.data.symbol =symbol
    return  response.data.data;
  
};



const diffStrategy =async (countKline,target=5)=>{
    const a =await getMarketSymbols();

    for(var i=0; i<a.length;i++)
    {
            const arr = await getSymbolKline(a[i],"1d",8)
           


            let highCount = 0;
            let avgDifference=0;
           

            for (let i = arr.length - countKline; i < arr.length; i++) {
                try {
                    let highDifference = (arr[i][3] - arr[i][4]) * 100 / arr[i][3];
                    avgDifference +=highDifference;
                    if (highDifference > target) {
                        highCount += 1;
                    }
                    
                } catch (error) {
                    console.log("hatalo")
                    
                }
                
                
            }
           
            
            if (highCount === countKline) {
                var values = [];

                values.push({
                    'Coin Name':a[i],
                    'Average': avgDifference/4,
                    'high Count':highCount,
                    'target':target,
                    'index':i

                    
                })
                
                console.table(values)
            }
                    

    }

    

}
diffStrategy(4,7)