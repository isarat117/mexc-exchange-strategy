const axios = require('axios');
const BASE = "https://www.mexc.com";
const getMarketSymbols = async () => {
    const response =await  axios.get(`${BASE}/open/api/v2/market/symbols`);
    let symbols = [];
    response.data.data.forEach(symbol=>{
        symbols.push(symbol.symbol)
    })

    //removo margin parites
    let result = symbols.filter(item => {
        if( !(item.includes('5S_') || item.includes('5L_') ||
            item.includes('4S_') || item.includes('4L_')||
            item.includes('3S_') || item.includes('3L_')||
            item.includes('2S_') || item.includes('2L_'))
            ){
            return item;
        }
       
      });
    
   return result
};



//
const getSymbolKline = async (symbol,interval,limit) => {
    const response =await  axios.get(`${BASE}/open/api/v2/market/kline?symbol=${symbol}&interval=${interval}&limit=${limit}`);
    response.data.data.symbol =symbol
    return  response.data.data;
  
};





// -----------ABOUT VOLATILE -------------
const diffStrategy =async (countKline,target=5)=>{
    const start = Date.now();
    const values = [];
    const symbol =await getMarketSymbols();

    for(var i=0; i<symbol.length;i++)
    {
            const arr = await getSymbolKline(symbol[i],"1d",8)
            
           


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
                    //console.log("hatalı")
                    
                }
                
                
            }
           
            
            if (highCount === countKline) {
               

                values.push({
                    'Coin Name':symbol[i],
                    'Average': avgDifference/4,
                    'high Count':highCount,
                    'target':target,
                    'index':i

                    
                })
                
              
            }
                    

    }

    
    console.table(values);
    const end = Date.now();
    const timeDiff = (end - start)/1000;
    console.log(`Tarama işlemi ${timeDiff} saniye sürdü`);
}

    diffStrategy(4,20)




