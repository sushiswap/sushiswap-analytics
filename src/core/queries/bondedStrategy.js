import gql from "graphql-tag";

export const bondedStrategyQuery = gql`
  query bondedStrategyQuery(
    $id: String! = "0x45fa9f11b06dff3f4b04746629523c21fb2cadb9"
  ) {
    bondedStrategy(id: $id) {
      id
      inception
      totalSupply
      totalClaimedUSD
      remainingRewardETH
      usersCount
      block
      timestamp
    }
  }
`;

export const bondedStrategyHistoriesQuery = gql`
  query bondedStrategyHistoriesQuery(
    $first: Int! = 1000
    $skip: Int! = 0
    $orderBy: String! = "timestamp"
    $orderDirection: String! = "desc"
  ) {
    bondedStrategyHistories(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      date
      timeframe
      totalSupply
      totalSupplyUSD
      usersCount
      totalClaimedUSD
      remainingRewardETH
      remainingRewardUSD
      block
      timestamp
    }
  }
`;

export const bondedStrategyUserQuery = gql`
  query bondedStrategyUserQuery($id: String!) {
    bondedStrategyUser(id: $id) {
      id
      bondedStrategy {
        id
        totalSupply
      }
      bonded
      lastBonded
      totalClaimedUSD
    }
  }
`;

export const bondedStrategyPairsQuery = gql`
  query bondedStrategyPairsQuery($first: Int! = 1000) {
    bondedStrategyPairs(first: $first) {
      id
      pair {
        name
        token0 {
          id
          name
          symbol
        }
        token1 {
          id
          name
          symbol
        }
      }
      claimedReward
      claimedRewardUSD
      remainingReward
      remainingRewardETH
      block
      timestamp
    }
  }
`;

export const bondedStrategyPairQuery = gql`
  query bondedStrategyPairQuery($id: String!) {
    bondedStrategyPair(id: $id) {
      id
      pair {
        name
        token0 {
          id
          name
          symbol
        }
        token1 {
          id
          name
          symbol
        }
      }
      claimedReward
      claimedRewardUSD
      remainingReward
      remainingRewardETH
      block
      timestamp
    }
  }
`;

export const bondedStrategyPairHistoriesQuery = gql`
  query bondedStrategyPairHistoriesQuery(
    $id: String!
    $first: Int! = 1000
    $skip: Int! = 0
    $orderBy: String! = "timestamp"
    $orderDirection: String! = "desc"
  ) {
    bondedStrategyPairHistories(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: { pair: $id }
    ) {
      id
      date
      timeframe
      # pair {
      #   token0 {
      #     id
      #     name
      #     symbol
      #   }
      #   token1 {
      #     id
      #     name
      #     symbol
      #   }
      # }
      claimedReward
      claimedRewardUSD
      remainingReward
      remainingRewardETH
      remainingRewardUSD
      block
      timestamp
    }
  }
`;
