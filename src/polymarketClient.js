import { ClobClient } from '@polymarket/clob-client';

/**
 * Thin wrapper around Polymarket's CLOB client with a few helper methods
 * tailored to the "Ethereum Up or Down" market or any other market UUID
 * you provide.
 */
export default class PolymarketClient {
  /**
   * @param {string} privateKey - Polymarket trading private key
   * @param {string} marketId - CLOB market UUID
   * @param {{ host?: string, chainId?: number }} [options]
   */
  constructor(privateKey, marketId, options = {}) {
    if (!privateKey) {
      throw new Error('A trading private key is required to initialize the client.');
    }

    if (!marketId) {
      throw new Error('A market UUID is required to initialize the client.');
    }

    const host = options.host ?? 'https://clob.polymarket.com';
    const chainId = options.chainId ?? 137; // Polygon mainnet

    this.marketId = marketId;
    this.client = new ClobClient(host, chainId, privateKey);
  }

  /**
   * Get current best bid/ask and mid price for the configured market.
   * @returns {Promise<{ bestBid: number|null, bestAsk: number|null, mid: number|null }>}
   */
  async getCurrentPrice() {
    const book = await this.client.getOrderBook(this.marketId);

    const bestBid = book.bids?.[0]?.price ?? null;
    const bestAsk = book.asks?.[0]?.price ?? null;

    let mid = null;
    if (bestBid != null && bestAsk != null) {
      mid = (parseFloat(bestBid) + parseFloat(bestAsk)) / 2;
    }

    return {
      bestBid: bestBid ? Number(bestBid) : null,
      bestAsk: bestAsk ? Number(bestAsk) : null,
      mid,
    };
  }

  /**
   * Get market metadata including strike price, end time, and question text.
   */
  async getMarketDetails() {
    const market = await this.client.getMarket(this.marketId);

    return {
      question: market.question,
      description: market.description,
      resolutionTime: market.end_date,
      outcomeTokens: market.outcomes,
      volume: market.volume,
      marketStatus: market.status,
      extraInfo: market.extra_info,
    };
  }

  /**
   * Place a limit order (buy/sell).
   * @param {{ side: 'BUY' | 'SELL', price: number, size: number, expiration?: number }} order
   */
  async placeOrder({ side, price, size, expiration }) {
    const order = await this.client.createOrder({
      marketId: this.marketId,
      price: String(price),
      size: String(size),
      side,
      expiration,
    });

    return order;
  }

  /**
   * Cancel an order by its ID.
   * @param {string} orderId
   */
  async cancelOrder(orderId) {
    if (!orderId) {
      throw new Error('An order ID is required to cancel an order.');
    }

    return this.client.cancelOrder(orderId);
  }

  /**
   * Fetch a list of active open orders for the configured market.
   */
  async getOpenOrders() {
    const orders = await this.client.getOrders({
      market: this.marketId,
      status: 'OPEN',
    });

    return orders;
  }
}
