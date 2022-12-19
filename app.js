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

const getVolume=async (symbol)=> {
    const response = await axios.get(`${BASE}/open/api/v2/market/ticker?symbol=${symbol}`)
    const result = response.data.data[0].amount;
   // console.log(result)
    return result

}



//
const getSymbolKline = async (symbol,interval,limit) => {
    try {
        const response =await  axios.get(`${BASE}/open/api/v2/market/kline?symbol=${symbol}&interval=${interval}&limit=${limit}`);
        return  response.data.data;
        
    } catch (error) {
        
    }
  

  
};
//test fonksiyonu
const yaz= async()=>
{
    data =await getVolume("eth_usdt")
    console.log(data)
    //console.log(data.length)
}




// -----------ABOUT VOLATILE -------------
const diffStrategy =async (countKline,target=5)=>{
    const start = Date.now();
    const values = [];
    const symbols =await getMarketSymbols();

    // tüm pariteleri gezmesi için for döngüsü
    for(var i=0; i<100;i++)
    {
            const arr = await getSymbolKline(symbols[i],"1d",8)
            let highCount = 0;
            let avgDifference=0;
           
            // bir parite için istenilen özelliği tespit etmek için for döngüsü
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
               const volume=await getVolume(symbols[i])

                values.push({
                    'Coin Name':symbols[i],
                    'Average': avgDifference/4,
                    'volume(K)':volume/1000,
                    'high Count':highCount,
                    'target':target,
                    'index':i

                    
                })
                
              
            }
                    

    }

    
    console.table(values);
    const end = Date.now();
    const timeDiff = (end - start)/1000;
    console.log(`${symbols.length} adet parite için tarama işlemi ${timeDiff} saniye sürdü`);
}

   diffStrategy(3,15)
module.exports={
    getSymbolKline:getSymbolKline,
    getMarketSymbols:getMarketSymbols

}


