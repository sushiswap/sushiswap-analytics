import gql from "graphql-tag";

export const buryLeashQuery = gql`
  query buryLeashQuery($id: String! = "0xa57d319b3cf3ad0e4d19770f71e63cf847263a0b") {
    bury(id: $id) {
      id
      totalSupply
      ratio
      xLeashMinted
      xLeashBurned
      leashStaked
      leashStakedUSD
      leashHarvested
      leashHarvestedUSD
      xLeashAge
      xLeashAgeDestroyed
    }
  }
`;

export const buryLeashHistoriesQuery = gql`
  query buryLeashHistoriesQuery {
    histories(first: 1000) {
      id
      date
      timeframe
      leashStaked
      leashStakedUSD
      leashHarvested
      leashHarvestedUSD
      xLeashAge
      xLeashAgeDestroyed
      xLeashMinted
      xLeashBurned
      xLeashSupply
      ratio
    }
  }
`;

export const buryLeashUserQuery = gql`
  query buryLeashUserQuery($id: String!) {
    user(id: $id) {
      id
      bury {
        totalSupply
        leashStaked
      }
      xLeash
      leashStaked
      leashStakedUSD
      leashHarvested
      leashHarvestedUSD
      xLeashIn
      xLeashOut
      xLeashOffset
      xLeashMinted
      xLeashBurned
      leashIn
      leashOut
      usdIn
      usdOut
#      createdAt
#      createdAtBlock
    }
  }
`;
