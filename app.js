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
            &&
            item.includes('_USDT')
            ){
            return item;
        }
       
      });
    
   return result
};
const getSupportApiSymbols = async () => {
    const response =await  axios.get(`${BASE}/open/api/v2/market/api_default_symbols`);
    let symbols = [];
    response.data.data.symbol.forEach(symbol=>{
        symbols.push(symbol)
    })

   
    let result = symbols.filter(item => {
        if( !(item.includes('5S_') || item.includes('5L_')||
              item.includes('4S_') || item.includes('4L_')||
              item.includes('3S_') || item.includes('3L_')||
              item.includes('2S_') || item.includes('2L_'))
              &&
              item.includes('_USDT')

             
            ){
            return item;
        }
       
      });
    
   return result
}

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





// -----------ABOUT VOLATILE -------------
const diffStrategy =async (countKline,target=5)=>{
    const start = Date.now();
    const values = [];
    const symbols =await getMarketSymbols();

    // tüm pariteleri gezmesi için for döngüsü
    for(var i=0; i<symbols.length;i++)
    {
            const arr = await getSymbolKline(symbols[i],"1d",8)
            let highCount = 0;
            let avgDifference=0;
            try {
            // bir parite için istenilen özelliği tespit etmek için for döngüsü
            for (let i = arr.length - countKline; i < arr.length; i++) {
              
                    let highDifference = (arr[i][3] - arr[i][4]) * 100 / arr[i][3];
                    avgDifference +=highDifference;
                    if (highDifference > target) {
                        highCount += 1;
                    }
                    
               
 
            }
        } catch (error) {
            //console.log("hatalı")
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
const yeniDeneme =async ()=>{
    var options = {
        headers: {'user-agent': 'axios/1.2.1'}
    }
  
    
        const start = Date.now();
 
        const symbols =await getMarketSymbols();
        try {
        const responses = await Promise.allSettled(
         symbols&&symbols.map(async (symbol) => {
              
                const res = await axios.get(
                    `${BASE}/open/api/v2/market/kline?symbol=${symbol}&interval=1d&limit=100`
               ); 
                
            })
        );
       console.log((responses.status == "fulfilled") ? responses : responses)
    } catch (error) {
        console.log("a")
    }
        
        const end = Date.now();
    const timeDiff = (end - start)/1000;
    console.log(`Tarama işlemi ${timeDiff} saniye sürdü`);
   
    
 
  

    

}





const getSymbolDetph = async (symbol,depth) => {
    const response =await  axios.get(`${BASE}/open/api/v2/market/depth?symbol=${symbol}&depth=${depth}`);
    return response.data.data;
   
}










module.exports={
    getSymbolKline:getSymbolKline,
    getMarketSymbols:getMarketSymbols

}


//test fonksiyonu
const yaz= async()=>
{
    data =await getSymbolDetph("NZERO_USDT",50)
    const values =[];
    for(let i=0;i<data.asks.length;i++){
        
    values.push({
        Taker:{
            'price':data.bids[i].price, 
            'Volume':data.bids[i].price * data.bids[i].quantity,
        },
        Maker:{
            'price':data.asks[i].price, 
           'Volume':data.asks[i].price * data.asks[i].quantity,
            
        }
    })
    
    }
    console.table(values) //console.log(data.length)
}

yaz()

