import gql from "graphql-tag";

export const poolUserQuery = gql`
  query poolUserQuery($address: String!) {
    users(where: { address: $address }) {
      id
      address
      pool {
        id
        pair
        balance
        accSushiPerShare
        lastRewardBlock
      }
      amount
      rewardDebt
      sushiHarvested
      sushiHarvestedSinceLockup
      entryUSD
      exitUSD
    }
  }
`;

export const poolHistoryQuery = gql`
  query poolHistoryQuery($id: String!) {
    poolHistories(first: 1000, where: { pool: $id }, orderBy: timestamp) {
      id
      pool {
        id
      }
      slpBalance
      slpAge
      slpAgeRemoved
      slpDeposited
      slpWithdrawn
      userCount
      timestamp
      block
    }
  }
`;

export const poolQuery = gql`
  query poolQuery($id: ID!) {
    pool(id: $id) {
      id
      pair
      allocPoint
      lastRewardBlock
      accSushiPerShare
      balance
      userCount
      owner {
        id
        sushiPerBlock
        totalAllocPoint
      }
      users(orderBy: amount, orderDirection: desc) {
        id
        address
        amount
        rewardDebt
      }
      slpAge
      liquidityPair @client
      timestamp
    }
  }
`;

export const poolsQuery = gql`
  query poolsQuery(
    $first: Int! = 1000
    $skip: Int! = 0
    $orderBy: String! = "timestamp"
    $orderDirection: String! = "desc"
  ) {
    pools(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      pair
      allocPoint
      lastRewardBlock
      accSushiPerShare
      balance
      userCount
      owner {
        id
        sushiPerBlock
        totalAllocPoint
      }
      # users {
      #   id
      #   address
      #   amount
      #   rewardDebt
      # }
      liquidityPair @client
      roiPerBlock @client
      roiPerHour @client
      roiPerDay @client
      roiPerMonth @client
      roiPerYear @client
      rewardPerThousand @client
      tvl @client
      timestamp
    }
  }
`;
