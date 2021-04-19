import gql from "graphql-tag";

export const barFieldsQuery = gql`
  fragment barFields on Bar {
    id
    totalSupply
    ratio
    xSushiMinted
    xSushiBurned
    sushiStaked
    sushiStakedUSD
    sushiHarvested
    sushiHarvestedUSD
    xSushiAge
    xSushiAgeDestroyed
  }
`;

export const barQuery = gql`
  query barQuery($id: String! = "0x8798249c2e607446efb7ad49ec89dd1865ff4272") {
    bar(id: $id) {
      ...barFields
    }
  }
  ${barFieldsQuery}
`;

export const barHistoryFieldsQuery = gql`
  fragment barHistoryFields on History {
    id
    date
    timeframe
    sushiStaked
    sushiStakedUSD
    sushiHarvested
    sushiHarvestedUSD
    xSushiAge
    xSushiAgeDestroyed
    xSushiMinted
    xSushiBurned
    xSushiSupply
    ratio
  }
`;

export const barHistoriesQuery = gql`
  query barHistoriesQuery {
    histories(first: 1000) {
      ...barHistoryFields
    }
  }
  ${barHistoryFieldsQuery}
`;

export const barUserFieldsQuery = gql`
  fragment barUserFields on User {
    id
    bar {
      totalSupply
      sushiStaked
    }
    xSushi
    sushiStaked
    sushiStakedUSD
    sushiHarvested
    sushiHarvestedUSD
    xSushiIn
    xSushiOut
    xSushiOffset
    xSushiMinted
    xSushiBurned
    sushiIn
    sushiOut
    usdIn
    usdOut
    createdAt
    createdAtBlock
  }
`;

export const barUserQuery = gql`
  query barUserQuery($id: String!) {
    user(id: $id) {
      ...barUserFields
    }
  }
  ${barUserFieldsQuery}
`;
