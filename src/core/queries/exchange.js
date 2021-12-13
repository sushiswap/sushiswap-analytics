import gql from "graphql-tag";

export const factoryQuery = gql`
  query factoryQuery(
    $id: String! = "0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac"
  ) {
    factory(id: $id) {
      id
      volumeUSD
      oneDay @client
      twoDay @client
    }
  }
`;

export const factoryTimeTravelQuery = gql`
  query factoryTimeTravelQuery(
    $id: String! = "0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac"
    $block: Block_height!
  ) {
    factory(id: $id, block: $block) {
      id
      volumeUSD
    }
  }
`;

export const userIdsQuery = gql`
  query userIdsQuery($first: Int! = 1000, $skip: Int! = 0) {
    users(first: $first, skip: $skip) {
      id
    }
  }
`;

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
`;

export const oneDayEthPriceQuery = gql`
  query OneDayEthPrice {
    ethPrice @client
  }
`;

export const sevenDayEthPriceQuery = gql`
  query sevenDayEthPrice {
    ethPrice @client
  }
`;

export const bundleFields = gql`
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

export const dayDataFieldsQuery = gql`
  fragment dayDataFields on DayData {
    id
    date
    volumeETH
    volumeUSD
    untrackedVolume
    liquidityETH
    liquidityUSD
    txCount
  }
`;

// Dashboard...
export const dayDatasQuery = gql`
  query dayDatasQuery($first: Int! = 1000, $date: Int! = 0) {
    dayDatas(first: $first, orderBy: date, orderDirection: desc) {
      ...dayDataFields
    }
  }
  ${dayDataFieldsQuery}
`;

// Pairs...

export const pairTokenFieldsQuery = gql`
  fragment pairTokenFields on Token {
    id
    name
    symbol
    totalSupply
    derivedETH
  }
`;

export const pairFieldsQuery = gql`
  fragment pairFields on Pair {
    id
    reserveUSD
    reserveETH
    volumeUSD
    untrackedVolumeUSD
    trackedReserveETH
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
    totalSupply
    txCount
    timestamp
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
  query pairDayDatasQuery(
    $first: Int = 1000
    $date: Int = 0
    $pairs: [Bytes]!
  ) {
    pairDayDatas(
      first: $first
      orderBy: date
      orderDirection: desc
      where: { pair_in: $pairs, date_gt: $date }
    ) {
      date
      pair {
        id
      }
      token0 {
        derivedETH
      }
      token1 {
        derivedETH
      }
      reserveUSD
      volumeToken0
      volumeToken1
      volumeUSD
      txCount
    }
  }
`;

export const liquidityPositionSubsetQuery = gql`
  query liquidityPositionSubsetQuery($first: Int! = 1000, $user: Bytes!) {
    liquidityPositions(first: $first, where: { user: $user }) {
      id
      liquidityTokenBalance
      user {
        id
      }
      pair {
        id
      }
    }
  }
`;

export const pairSubsetQuery = gql`
  query pairSubsetQuery(
    $first: Int! = 1000
    $pairAddresses: [Bytes]!
    $orderBy: String! = "trackedReserveETH"
    $orderDirection: String! = "desc"
  ) {
    pairs(
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: { id_in: $pairAddresses }
    ) {
      ...pairFields
      oneDay @client
      sevenDay @client
    }
  }
  ${pairFieldsQuery}
`;

export const pairsQuery = gql`
  query pairsQuery(
    $first: Int! = 1000
    $orderBy: String! = "reserveUSD"
    $orderDirection: String! = "desc"
  ) {
    pairs(first: $first, orderBy: $orderBy, orderDirection: $orderDirection) {
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

// Tokens...
export const tokenFieldsQuery = gql`
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
    $date: Int! = 0
  ) {
    tokenDayDatas(
      first: $first
      orderBy: date
      orderDirection: desc
      where: { token_in: $tokens, date_gt: $date }
    ) {
      id
      date
      token {
        id
      }
      volumeUSD
      liquidityUSD
      priceUSD
      txCount
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
      dayData(first: 7, skip: 0, orderBy: date, order: asc) {
        id
        priceUSD
      }
      # hourData(first: 168, skip: 0, orderBy: date, order: asc) {
      #   priceUSD
      # }
      oneDay @client
      sevenDay @client
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
