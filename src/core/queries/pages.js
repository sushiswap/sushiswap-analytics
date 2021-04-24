import gql from "graphql-tag";
import { pairFieldsQuery, tokenFieldsQuery } from "./exchange";
import { barFieldsQuery, barHistoryFieldsQuery, barUserFieldsQuery } from "./bar";

// Bar
export const barPageQuery = gql`
  query barPageQuery($barId: String! = "0x8798249c2e607446efb7ad49ec89dd1865ff4272") {
    bar(id: $barId) {
      ...barFields
    }
    histories(first: 1000) {
      ...barHistoryFields
    }
    sushiPrice @client
    oneDayVolume @client
    dayDatas @client
  }
  ${barFieldsQuery}
  ${barHistoryFieldsQuery}
  ${barUserFieldsQuery}
`;

// Pools
export const poolPageQuery = gql`
  query poolPageQuery($id: ID!) {
    pool @client
    poolHistories @client
  }
`;

// Tokens
export const tokenPageQuery = gql`
  query tokenPageQuery($id: ID!) {
    token(id: $id) {
      ...tokenFields
      oneDay @client
      twoDay @client
    }
    pairs @client
    transactions @client
    ethPrice @client
    oneDayEthPrice @client
  }
  ${tokenFieldsQuery}
`;

// Gainers
export const gainersQuery = gql`
  query gainersQuery($first: Int! = 1000) {
    pairs(first: $first, orderBy: trackedReserveETH, orderDirection: desc) {
      ...pairFields
      reserveUSDGained @client
      reserveUSDGainedYesterday @client
      volumeUSDGained @client
      volumeUSDGainedYesterday @client
      feesUSDGained @client
      feesUSDGainedYesterday @client
    }
  }
  ${pairFieldsQuery}
`;

// Losers
export const losersQuery = gql`
  query losersQuery($first: Int! = 1000) {
    pairs(first: $first, orderBy: trackedReserveETH, orderDirection: desc) {
      ...pairFields
      reserveUSDLost @client
      reserveUSDLostYesterday @client
      volumeUSDLost @client
      volumeUSDLostYesterday @client
      feesUSDLost @client
      feesUSDLostYesterday @client
    }
  }
  ${pairFieldsQuery}
`;
