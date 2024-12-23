const vscode = require('vscode');
const path = require('path');

class MarketPanel {
  static currentPanel = undefined;
  static viewType = 'marketPrices';

  static createOrShow(context) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (MarketPanel.currentPanel) {
      MarketPanel.currentPanel.panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      MarketPanel.viewType,
      'Currency for Coders',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(context.extensionPath, 'media'))
        ]
      }
    );

    MarketPanel.currentPanel = new MarketPanel(panel, context);
  }

  constructor(panel, context) {
    this.panel = panel;
    this.context = context;
    this._update();
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
  }

  async _update() {
    const webview = this.panel.webview;
    this.panel.webview.html = this._getHtmlForWebview(webview);
  }

  _getHtmlForWebview(webview) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              background: rgba(0, 0, 0, 0.8);
              color: white;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              padding: 20px;
              backdrop-filter: blur(10px);
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
            }
            .card {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 16px;
              backdrop-filter: blur(5px);
            }
            .price {
              font-size: 24px;
              font-weight: bold;
            }
            .change {
              color: #4CAF50;
            }
            .change.negative {
              color: #F44336;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Currency for Coders</h1>
            <div id="prices"></div>
          </div>
          <script>
            const vscode = acquireVsCodeApi();
            window.addEventListener('message', event => {
              const message = event.data;
              switch (message.command) {
                case 'update':
                  updatePrices(message.stocks, message.cryptos);
                  break;
              }
            });

            function updatePrices(stocks, cryptos) {
              const pricesDiv = document.getElementById('prices');
              pricesDiv.innerHTML = '';

              stocks.forEach(stock => {
                pricesDiv.innerHTML += createPriceCard(stock, 'Stock');
              });

              cryptos.forEach(crypto => {
                pricesDiv.innerHTML += createPriceCard(crypto, 'Crypto');
              });
            }

            function createPriceCard(item, type) {
              const changeClass = parseFloat(item.change) >= 0 ? 'change' : 'change negative';
              return \`
                <div class="card">
                  <h2>\${item.symbol} (\${type})</h2>
                  <div class="price">$\${parseFloat(item.price).toFixed(2)}</div>
                  <div class="\${changeClass}">
                    \${parseFloat(item.change).toFixed(2)}%
                  </div>
                </div>
              \`;
            }
          </script>
        </body>
      </html>
    `;
  }

  dispose() {
    MarketPanel.currentPanel = undefined;
    this.panel.dispose();
  }
}

module.exports = MarketPanel;