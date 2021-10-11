import gql from "graphql-tag";

export const buryShibQuery = gql`
  query buryShibQuery($id: String! = "0xb4a81261b16b92af0b9f7c4a83f1e885132d81e4") {
    bury(id: $id) {
      id
      totalSupply
      ratio
      xShibMinted
      xShibBurned
      shibStaked
      shibStakedUSD
      shibHarvested
      shibHarvestedUSD
      xShibAge
      xShibAgeDestroyed
    }
  }
`;

export const buryShibHistoriesQuery = gql`
  query buryShibHistoriesQuery {
    histories(first: 1000) {
      id
      date
      timeframe
      shibStaked
      shibStakedUSD
      shibHarvested
      shibHarvestedUSD
      xShibAge
      xShibAgeDestroyed
      xShibMinted
      xShibBurned
      xShibSupply
      ratio
    }
  }
`;

export const buryShibUserQuery1 = gql`
  query buryShibUserQuery($id: String!) {
    user(id: $id) {
      id
      buries {
        totalSupply
        shibStaked
      }
      xShib
      shibStaked
      shibStakedUSD
      shibHarvested
      shibHarvestedUSD
      xShibIn
      xShibOut
      xShibOffset
      xShibMinted
      xShibBurned
      shibIn
      shibOut
      usdIn
      usdOut
      createdAt
      createdAtBlock
    }
  }
`;


export const buryShibUserQuery = gql`
  query buryShibUserQuery($id: String!) {
    user(id: $id) {
      id
      bury {
        totalSupply
        shibStaked
      }
      xShib
      shibStaked
      shibStakedUSD
      shibHarvested
      shibHarvestedUSD
      xShibIn
      xShibOut
      xShibOffset
      xShibMinted
      xShibBurned
      shibIn
      shibOut
      usdIn
      usdOut
    }
  }
`;
