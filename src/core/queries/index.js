import gql from "graphql-tag";

export * from "./bar";
export * from "./blocks";
export * from "./exchange";
export * from "./masterchef";
export * from "./pages";
// Eth price...
// export const ethPriceQuery = (block) => gql`
//   query bundles($id: Int! = 1, $block: Block_height) {
//     bundles(id: $id${block ? ", block: { number: " + block + "}" : ""}) {
//       id
//       ethPrice
//     }
//   }
// `;

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

// export const timeTravelPairsQuery = gql`
//   query timeTravelPairsQuery($block: Block_height) {
//     pairs(first: 1000, orderBy: trackedReserveETH, orderDirection: desc) {
//       ...pairFields
//     }
//   }
// `;
