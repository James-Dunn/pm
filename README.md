# Polymarket Node.js Client Example

A small Node.js project that wraps the [`@polymarket/clob-client`](https://www.npmjs.com/package/@polymarket/clob-client) SDK and exposes a few CLI helpers for inspecting a market, fetching prices, and placing/canceling orders. It is designed to run locally on macOS or any system with Node.js 18+.

## Prerequisites

- Node.js 18 or newer
- An existing Polymarket trading private key
- The market UUID you want to interact with (e.g., the "Ethereum Up or Down" CLOB market)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and fill in your credentials:

   ```bash
   cp .env.example .env
   # edit .env and set your values
   ```

   Required variables:
   - `POLYMARKET_PRIVATE_KEY` – your Polymarket trading private key
   - `POLYMARKET_MARKET_ID` – the CLOB market UUID you want to trade

   Optional variables:
   - `POLYMARKET_API_HOST` – override the API host (defaults to `https://clob.polymarket.com`)
   - `POLYMARKET_CHAIN_ID` – override the Polygon chain ID (defaults to `137`)

## Usage

Run commands with `npm start -- <command>`. Available commands:

- `price` – show best bid/ask and the mid price
- `market` – show market metadata
- `open-orders` – list open orders for the configured market
- `place-order <side> <price> <size> [expiration]` – place a limit order (`side` is `BUY` or `SELL`, `price` between 0 and 1, `size` in shares, optional `expiration` is a UNIX timestamp)
- `cancel-order <orderId>` – cancel an order by ID
- `help` – print the command list

Example: fetch the current market price

```bash
npm start -- price
```

Example: place a limit buy at $0.45 for 10 shares

```bash
npm start -- place-order BUY 0.45 10
```

## Notes

- The CLI will exit early if required environment variables are missing.
- The project uses ES modules (`type: module` in `package.json`).
- Be mindful that placing orders will create live trades on Polymarket; use a sandbox key if you want to test without risk.
