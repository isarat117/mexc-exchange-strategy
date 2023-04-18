const axios = require('axios');
const crypto = require('crypto')
require('dotenv').config();

const accessKey = process.env.API_KEY;
const secretKey = process.env.SECRET_KEY;
const recvWindow = '5000';
const timestamp = Date.now();
const BASE = "https://www.mexc.com";


const  createSignature=(accessKey, timestamp, secretKey, params="")=> {
    const signatureTargetString = `${accessKey}${timestamp}${params}`;
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(signatureTargetString)
      .digest("hex");
    return signature;
  }

const getMarketSymbols = async () => {
    const response = await axios.get(`${BASE}/open/api/v2/market/symbols`);
    let symbols = [];
    response.data.data.forEach(symbol => {
        symbols.push(symbol.symbol)
    })

    //removo margin parites
    let result = symbols.filter(item => {
        if (!(item.includes('5S_') || item.includes('5L_') ||
                item.includes('4S_') || item.includes('4L_') ||
                item.includes('3S_') || item.includes('3L_') ||
                item.includes('2S_') || item.includes('2L_')) &&
            item.includes('_USDT')
        ) {
            return item;
        }
    });

    return result
};

const getCurrency=async()=>{
    const symbols =await getMarketSymbols();

    let currencies = [];
    for(var i=0;i<symbols.length;i++){
        currencies.push(symbols[i].slice(0, -5))
    }

    return currencies
 }

const getSupportApiSymbols = async () => {
    const response = await axios.get(`${BASE}/open/api/v2/market/api_default_symbols`);
    let symbols = [];
    response.data.data.symbol.forEach(symbol => {
        symbols.push(symbol)
    })

    let result = symbols.filter(item => {
        if (!(item.includes('5S_') || item.includes('5L_') ||
                item.includes('4S_') || item.includes('4L_') ||
                item.includes('3S_') || item.includes('3L_') ||
                item.includes('2S_') || item.includes('2L_')) &&
            item.includes('_USDT')
        ) {
            return item;
        }

    });

    return result
}

const getVolume = async (symbol) => {
    const response = await axios.get(`${BASE}/open/api/v2/market/ticker?symbol=${symbol}`)
    const result = response.data.data[0].amount;

    return result
}

const getSymbolKline = async (symbol, interval, limit) => {
    try {
        const response = await axios.get(`${BASE}/open/api/v2/market/kline?symbol=${symbol}&interval=${interval}&limit=${limit}`);
        return response.data.data;

    } catch (error) {
    }

};


// -----------ABOUT VOLATILE -------------
const diffStrategy = async (countKline, target = 5) => {
    const start = Date.now();
    const values = [];
    const symbols = await getMarketSymbols();

    // tüm pariteleri gezmesi için for döngüsü
    for (var i = 0; i < symbols.length; i++) {
        const arr = await getSymbolKline(symbols[i], "1d", 8)
        let highCount = 0;
        let avgDifference = 0;
        try {
            for (let i = arr.length - countKline; i < arr.length; i++) {

                let highDifference = (arr[i][3] - arr[i][4]) * 100 / arr[i][3];
                avgDifference += highDifference;
                if (highDifference > target) {
                    highCount += 1;
                }



            }
        } catch (error) {
            console.log(error)
        }

        if (highCount === countKline) {
            const volume = await getVolume(symbols[i])

            values.push({
                'Coin Name': symbols[i],
                'Average': avgDifference / 4,
                'volume(K)': volume / 1000,   
                'url':`https://www.mexc.com/exchange/${symbols[i]}?_from=search_spot_trade`

            })
           console.log(i)
        }
    }

    console.table(values);
    const end = Date.now();
    const timeDiff = (end - start) / 1000;
    console.log(`${symbols.length} adet parite için tarama işlemi ${timeDiff} saniye sürdü`);
}


//hatalar çözülmeli
const paralelCagrı = async () => {
    var options = {
        headers: {
            'user-agent': 'axios/1.2.1'
        }
    }

    const start = Date.now();

    const symbols = await getMarketSymbols();
    try {
        const responses = await Promise.allSettled(
            symbols && symbols.map(async (symbol) => {

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
    const timeDiff = (end - start) / 1000;
    console.log(`Tarama işlemi ${timeDiff} saniye sürdü`);
}

const getSymbolDetph = async (symbol, depth) => {
    const response = await axios.get(`${BASE}/open/api/v2/market/depth?symbol=${symbol}&depth=${depth}`);
    
    return response.data.data;
}


//////// ACOUNT İNFORMATİON ENDPOİNTS /////////////////

const getInfoBalance =async()=> {

    const response= await axios.get(`${BASE}/open/api/v2/account/info`,{
        headers:{
            apiKey: accessKey,
            'Request-Time': timestamp,
            'Signature': createSignature(accessKey,timestamp,secretKey),
            'Content-Type': 'application/json',
            'Recv-Window': recvWindow
            
          }

    })
    console.log(response.data.data)
}

const getDepositAddress=async(symbol)=>{
    const response= await axios(`${BASE}/open/api/v2/asset/deposit/address/list?currency=${symbol}`,{
        headers:{
            apiKey: accessKey,
            'Request-Time': timestamp,
            'Signature': createSignature(accessKey,timestamp,secretKey,`currency=${symbol}`),
            'Content-Type': 'application/json',
            'Recv-Window': recvWindow
            
          }
    })
    console.log(response.data.data)
}

const openOrders=async(symbol)=>{
    const response = await axios.get(`${BASE}/open/api/v2/order/open_orders?symbol=${symbol}`,{
        headers:{
            apiKey: accessKey,
            'Request-Time': timestamp,
            'Signature': createSignature(accessKey,timestamp,secretKey,`symbol=${symbol}`),
            'Content-Type': 'application/json',
            'Recv-Window': recvWindow
            
          }

    }
  )
    console.log(response.data)
}

const dealsHistory=async(symbol)=>{
    const response= await axios.get(`${BASE}/open/api/v2/order/deals?symbol=${symbol}`,{
        headers:{
            apiKey: accessKey,
            'Request-Time': timestamp,
            'Signature': createSignature(accessKey,timestamp,secretKey,`symbol=${symbol}`),
            'Content-Type': 'application/json',
            'Recv-Window': recvWindow
            
          }
    })
    console.log(response.data)
}

const depositRecord=async()=>{
 
    const response = await axios.get(`${BASE}/open/api/v2/asset/deposit/list`,
    {
        headers:{
            apiKey: accessKey,
            'Request-Time': timestamp,
            'Signature': createSignature(accessKey,timestamp,secretKey),
            'Content-Type': 'application/json',
            'Recv-Window': recvWindow
            
          }
    })
    console.log(response.data.data)
}

const isEnableForDopesit=async(currency)=>{
    const response = await axios.get(`${BASE}/open/api/v2/market/coin/list?currency=${currency}`)
    const chainLength = response.data.data[0].coins.length
    var decision = false
    for(var i = 0;i<chainLength;i++){
        if(response.data.data[0].coins[i].is_deposit_enabled){
            decision= true
        }
    }
    return decision
    
 }

const getCurrencyInfo=async(currency)=>{
    const response = await axios.get(`${BASE}/open/api/v2/market/coin/list?currency=${currency}`)
    
    if(await isEnableForDopesit(currency)){
        console.log("yatır")
    }else{
        console.log("yatırma")
    }
   
}

const noDepositCoin =async()=>{
    const currensies = await getCurrency();
    
        for(var i= 254;i<currensies.length;i++){
            try {
            if(!(await isEnableForDopesit(currensies[i]))){
                console.log(`${i} coin: ${currensies[i]} yatırıma uygun değil`)
            }
        } catch (error) {
            console.log("hata")
        }
    
        }
}


////////////////////--TRADE----///////////////

const order=async(symbol,price,quantity,trade_type,order_type)=>{
    /*
    symbol     : symbol name
    price      : price
    quantity   : amount
    trade_type : trade type	BID，ASK
    order_type : order type	LIMIT_ORDER，POST_ONLY，IMMEDIATE_OR_CANCEL
    */
    const signatureData = { 
        symbol: symbol, 
        price: price, 
        quantity: quantity, 
        trade_type: trade_type, 
        order_type: order_type 
    }
    const body = JSON.stringify(signatureData);
        const response = await axios.post(`${BASE}/open/api/v2/order/place_batch`,signatureData, {
            headers:{
                apiKey: accessKey,
                'Request-Time': timestamp,
                'Signature':  createSignature(accessKey,timestamp,secretKey,body),
                'Content-Type': 'application/json',
                'Recv-Window': recvWindow
                
              }
        } ) 
    
    console.log(response)
}

const cancelOrder =async(symbol)=>{
    const response=await axios.delete(`${BASE}/open/api/v2/order/cancel_by_symbol?symbol=${symbol}`)
}


