import gql from "graphql-tag";

export const buryShibQuery = gql`
  query buryShibQuery($id: String! = "0xad7AC262cC107b7e72D775E5576319296a377e5d") {
    buries(id: $id) {
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

export const buryShibUserQuery = gql`
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
