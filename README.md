# SushiSwap Analytics

SushiSwap Analytics is a progressive web application for the SushiSwap Protocol.

## Core goals

- High performance ✔️
- SEO Friendly ✔️
- Desktop/Mobile installable ✔️
- PWA (Progressive Web Application) https://web.dev/progressive-web-apps ✔️
- Perfect Goolge Lighthouse score (98th percentile) ✔️
- Feature parity with Uniswap.info for v1 of the application ✔️

## Future goals

### Pools

Like Pairs/Tokens, a list of pools with relevent metrics should be added to the homescreen, and /pools, with links to invidvidual pool pages as described below.

### Pool analytics

Analytics for pools would provide additional data, and be extremely useful for analysing pool performance.

- Return on investment (including impermanent loss)
- Liquidity providers
- Trades

### Account overview

- Total value of assets
- Staked
- Liquidity pools
- Yeild farming
- Asset distribution (Staked, Liquidity pools, Yeild farming)

### Sparklines

The use of dynamic sparklines provides some beautiful UI/UX opportunities for price change, and ROI change, within lists of tokens/pairs/pools.

![](https://i.imgur.com/RCoTFHg.png)

Reference: https://coinmarketcap.com/

### Refinement of Pair/Token pages

- Improve UI/UX of chart and filter toolbar
- Add additional timespans to chart filters (e.g. One Day)
- Add additional metrics to chart filters (e.g. Transactions)

### Pagination

Make use of Apollo Pagination to reduce initial data transfer size.

### Query optimisation

Although fast, there's some work that could be done to optimise queries to further increase performance.

## Licence

MIT
