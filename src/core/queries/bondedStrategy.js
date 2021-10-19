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
      claimedReward
      claimedRewardUSD
      remainingReward
      remainingRewardETH
      block
      timestamp
    }
  }
`;
