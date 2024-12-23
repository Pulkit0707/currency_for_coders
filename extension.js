const vscode = require('vscode');
const MarketPanel = require('./src/webview/MarketPanel');
const marketService = require('./src/services/marketService');

function activate(context) {
  let disposable = vscode.commands.registerCommand('currency-for-coders.showPrices', () => {
    MarketPanel.createOrShow(context);
    updatePrices();
  });

  context.subscriptions.push(disposable);
}

async function updatePrices() {
  if (MarketPanel.currentPanel) {
    const stocks = await marketService.fetchStockPrices();
    const cryptos = await marketService.fetchCryptoPrices();
    
    MarketPanel.currentPanel.panel.webview.postMessage({
      command: 'update',
      stocks,
      cryptos
    });
  }
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}