const axios = require('axios');

class MarketService {
  constructor() {
    this.stocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];
    this.cryptoMapping = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum'
    };
  }

  async fetchStockPrices() {
    try {
      const prices = await Promise.all(
        this.stocks.map(async (symbol) => {
          const response = await axios.get(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
          );
          return {
            symbol,
            price: response.data['Global Quote']['05. price'],
            change: response.data['Global Quote']['09. change'],
          };
        })
      );
      return prices;
    } catch (error) {
      console.error('Error fetching stock prices:', error);
      return [];
    }
  }

  async fetchCryptoPrices() {
    try {
      const cryptoIds = Object.values(this.cryptoMapping).join(',');
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=usd&include_24hr_change=true`
      );

      return Object.entries(this.cryptoMapping).map(([symbol, id]) => ({
        symbol,
        price: response.data[id].usd,
        change: response.data[id].usd_24h_change,
      }));
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      return [];
    }
  }
}

module.exports = new MarketService();