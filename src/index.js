import dotenv from 'dotenv';
import PolymarketClient from './polymarketClient.js';

dotenv.config();

const {
  POLYMARKET_PRIVATE_KEY,
  POLYMARKET_MARKET_ID,
  POLYMARKET_API_HOST,
  POLYMARKET_CHAIN_ID,
} = process.env;

function requireEnv(value, name) {
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`Usage: node src/index.js <command> [args]\n
Commands:
  price                          Show best bid/ask and mid price for the market
  market                         Show market metadata
  open-orders                    List open orders for the market
  place-order <side> <price> <size> [expiration]
                                 Place a limit order (side = BUY | SELL)
  cancel-order <orderId>         Cancel a specific order
  help                           Show this message
`);
}

async function run() {
  requireEnv(POLYMARKET_PRIVATE_KEY, 'POLYMARKET_PRIVATE_KEY');
  requireEnv(POLYMARKET_MARKET_ID, 'POLYMARKET_MARKET_ID');

  const chainId = POLYMARKET_CHAIN_ID ? Number(POLYMARKET_CHAIN_ID) : undefined;

  const client = new PolymarketClient(POLYMARKET_PRIVATE_KEY, POLYMARKET_MARKET_ID, {
    host: POLYMARKET_API_HOST,
    chainId,
  });

  const [command, ...args] = process.argv.slice(2);

  switch ((command ?? '').toLowerCase()) {
    case 'price': {
      const price = await client.getCurrentPrice();
      console.log(JSON.stringify(price, null, 2));
      break;
    }
    case 'market': {
      const details = await client.getMarketDetails();
      console.log(JSON.stringify(details, null, 2));
      break;
    }
    case 'open-orders': {
      const orders = await client.getOpenOrders();
      console.log(JSON.stringify(orders, null, 2));
      break;
    }
    case 'place-order': {
      const [side, price, size, expiration] = args;
      if (!side || !price || !size) {
        console.error('Usage: place-order <side> <price> <size> [expiration]');
        process.exit(1);
      }

      const order = await client.placeOrder({
        side: side.toUpperCase(),
        price: Number(price),
        size: Number(size),
        expiration: expiration ? Number(expiration) : undefined,
      });

      console.log('Created order:');
      console.log(JSON.stringify(order, null, 2));
      break;
    }
    case 'cancel-order': {
      const [orderId] = args;
      if (!orderId) {
        console.error('Usage: cancel-order <orderId>');
        process.exit(1);
      }

      const result = await client.cancelOrder(orderId);
      console.log('Cancelled order:');
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case 'help':
    case undefined:
    case '':
      printHelp();
      break;
    default:
      console.error(`Unknown command: ${command}\n`);
      printHelp();
      process.exit(1);
  }
}

run().catch((error) => {
  console.error('Unexpected error:', error.message);
  process.exit(1);
});
