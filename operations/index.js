import gql from "graphql-tag";

// Eth price...
// export const ethPriceQuery = (block) => gql`
//   query bundles($id: Int! = 1, $block: Block_height) {
//     bundles(id: $id${block ? ", block: { number: " + block + "}" : ""}) {
//       id
//       ethPrice
//     }
//   }
// `;

// # xSushi
// # pools(where: amount_gt: 0) {
// #   pool {
// #     id
// #   }
// # }
// # barStaked
// # barPending
// # barHarvested
// # barYeild


export const userIdsQuery = gql`
  query userIdsQuery($first: Int! = 1000, $skip: Int! = 0) {
    users(first: $first, skip: $skip) {
      id
    }
  }
`

export const uniswapUserQuery = gql`
  query uniswapUserQuery($id: String!) {
    uniswapUser: user(id: $id) {
      id
      liquidityPositions {
        id
        liquidityTokenBalance
        # historicalSnapshots {
        #   id
        #   reserve0
        #   reserve1
        #   block
        #   timestamp
        #   liquidityTokenBalance
        #   liquidityTokenTotalSupply
        # }
      }
    }
  }
`

export const userQuery = gql`
  query userQuery($id: String!) {
    user(id: $id) {
      id
      bar {
        totalSupply
        stakedSushi
      }
      xSushi
      barStaked
      barHarvested
      liquidityPositions {
        id
        liquidityTokenBalance
        # historicalSnapshots {
        #   id
        #   reserve0
        #   reserve1
        #   block
        #   timestamp
        #   liquidityTokenBalance
        #   liquidityTokenTotalSupply
        # }
      }
      pools(where: {amount_gt: 0}) {
        pool {
          lpToken
          totalSupply
          accSushiPerShare
          lastRewardBlock
        }
        amount
        rewardDebt
      }
    }
  }
`;

export const oneDayEthPriceQuery = gql`
  query OneDayEthPrice {
    ethPrice @client
  }
`;

const bundleFields = gql`
  fragment bundleFields on Bundle {
    id
    ethPrice
  }
`;

export const ethPriceQuery = gql`
  query ethPriceQuery($id: Int! = 1) {
    bundles(id: $id) {
      ...bundleFields
    }
  }
  ${bundleFields}
`;

export const ethPriceTimeTravelQuery = gql`
  query ethPriceTimeTravelQuery($id: Int! = 1, $block: Block_height!) {
    bundles(id: $id, block: $block) {
      ...bundleFields
    }
  }
  ${bundleFields}
`;

// Dashboard...
export const uniswapDayDatasQuery = gql`
  query uniswapDayDatasQuery {
    dayDatas(where: { date_gt: 0 }) {
      id
      date
      volumeUSD
      liquidityUSD
    }
  }
`;

// Pairs...

const pairTokenFieldsQuery = gql`
  fragment pairTokenFields on Token {
    id
    symbol
    totalSupply
    derivedETH
  }
`;

const pairFieldsQuery = gql`
  fragment pairFields on Pair {
    id
    reserveUSD
    volumeUSD
    token0 {
      ...pairTokenFields
    }
    token1 {
      ...pairTokenFields
    }
    reserve0
    reserve1
    token0Price
    token1Price
    txCount
  }
  ${pairTokenFieldsQuery}
`;

export const pairQuery = gql`
  query pairQuery($id: String!) {
    pair(id: $id) {
      ...pairFields
      oneDay @client
      twoDay @client
    }
  }
  ${pairFieldsQuery}
`;

export const pairTimeTravelQuery = gql`
  query pairTimeTravelQuery($id: String!, $block: Block_height!) {
    pair(id: $id, block: $block) {
      ...pairFields
    }
  }
  ${pairFieldsQuery}
`;

export const pairIdsQuery = gql`
  query pairIdsQuery {
    pairs(first: 1000) {
      id
    }
  }
`;

export const pairCountQuery = gql`
  query pairCountQuery {
    uniswapFactories {
      pairCount
    }
  }
`;

export const pairDayDatasQuery = gql`
  query pairDayDatasQuery($first: Int = 1000, $pairs: [Bytes]!) {
    pairDayDatas(
      first: $first
      orderBy: date
      orderDirection: desc
      where: { pair_in: $pairs }
    ) {
      date
      pair {
        id
      }
      # dailyVolumeToken0
      # dailyVolumeToken1
      # dailyVolumeUSD
      # dailyTxns
      reserveUSD
      volumeToken0
      volumeToken1
      volumeUSD
      txCount
    }
  }
`;

// input PairsFilterInput {
//   first: Int!
//   block: Block_height
// }

export const pairsQuery = gql`
  query pairsQuery($first: Int! = 1000) {
    pairs(first: $first, orderBy: trackedReserveETH, orderDirection: desc) {
      ...pairFields
      oneDay @client
      sevenDay @client
    }
  }
  ${pairFieldsQuery}
`;

export const pairsTimeTravelQuery = gql`
  query pairsTimeTravelQuery(
    $first: Int! = 1000
    $pairAddresses: [Bytes]!
    $block: Block_height!
  ) {
    pairs(
      first: $first
      block: $block
      orderBy: trackedReserveETH
      orderDirection: desc
      where: { id_in: $pairAddresses }
    ) {
      id
      reserveUSD
      trackedReserveETH
      volumeUSD
      untrackedVolumeUSD
      txCount
    }
  }
`;

export const blockQuery = gql`
  query blockQuery($start: Int!, $end: Int!) {
    blocks(
      first: 1
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gt: $start, timestamp_lt: $end }
    ) {
      id
      number
      timestamp
    }
  }
`;

// Tokens...
const tokenFieldsQuery = gql`
  fragment tokenFields on Token {
    id
    symbol
    name
    decimals
    totalSupply
    volume
    volumeUSD
    untrackedVolumeUSD
    txCount
    liquidity
    derivedETH
  }
`;

export const tokenQuery = gql`
  query tokenQuery($id: String!) {
    token(id: $id) {
      ...tokenFields
      oneDay @client
      twoDay @client
    }
  }
  ${tokenFieldsQuery}
`;

export const tokenTimeTravelQuery = gql`
  query tokenTimeTravelQuery($id: String!, $block: Block_height!) {
    token(id: $id, block: $block) {
      ...tokenFields
    }
  }
  ${tokenFieldsQuery}
`;

export const tokenIdsQuery = gql`
  query tokenIdsQuery {
    tokens(first: 1000) {
      id
    }
  }
`;

export const tokenDayDatasQuery = gql`
  query tokenDayDatasQuery(
    $first: Int! = 1000
    $tokens: [Bytes]!
    $start: Int
    $end: Int
  ) {
    tokenDayDatas(
      first: $first
      orderBy: date
      orderDirection: desc
      where: { token_in: $tokens }
    ) {
      id
      date
      token {
        id
      }
      # dailyVolumeToken
      # dailyVolumeETH
      # dailyVolumeUSD
      # dailyTxns
      # totalLiquidityToken
      # totalLiquidityETH
      # totalLiquidityUSD
      volumeUSD
      liquidityUSD
      priceUSD
    }
  }
`;

export const tokenPairsQuery = gql`
  query tokenPairsQuery($id: String!) {
    pairs0: pairs(
      first: 1000
      orderBy: reserveUSD
      orderDirection: desc
      where: { token0: $id }
    ) {
      ...pairFields
      oneDay @client
      sevenDay @client
    }
    pairs1: pairs(
      first: 1000
      orderBy: reserveUSD
      orderDirection: desc
      where: { token1: $id }
    ) {
      ...pairFields
      oneDay @client
      sevenDay @client
    }
  }
  ${pairFieldsQuery}
`;

export const tokensQuery = gql`
  query tokensQuery($first: Int! = 1000) {
    tokens(first: $first, orderBy: volumeUSD, orderDirection: desc) {
      ...tokenFields
      oneDay @client
    }
  }
  ${tokenFieldsQuery}
`;

// block @client @export(as: "block")
export const tokensTimeTravelQuery = gql`
  query tokensTimeTravelQuery($first: Int! = 1000, $block: Block_height!) {
    tokens(first: $first, block: $block) {
      ...tokenFields
    }
  }
  ${tokenFieldsQuery}
`;

// Transactions...
export const transactionsQuery = gql`
  query transactionsQuery($pairAddresses: [Bytes]!) {
    swaps(
      orderBy: timestamp
      orderDirection: desc
      where: { pair_in: $pairAddresses }
    ) {
      id
      timestamp
      pair {
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
      sender
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      to
    }
    mints(
      orderBy: timestamp
      orderDirection: desc
      where: { pair_in: $pairAddresses }
    ) {
      id
      timestamp
      pair {
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
      sender
      amount0
      amount1
      amountUSD
      to
    }
    burns(
      orderBy: timestamp
      orderDirection: desc
      where: { pair_in: $pairAddresses }
    ) {
      id
      timestamp
      pair {
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
      sender
      amount0
      amount1
      amountUSD
      to
    }
  }
`;

// export const timeTravelPairsQuery = gql`
//   query timeTravelPairsQuery($block: Block_height) {
//     pairs(first: 1000, orderBy: trackedReserveETH, orderDirection: desc) {
//       ...pairFields
//     }
//   }
// `;
