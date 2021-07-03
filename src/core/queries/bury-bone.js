import gql from "graphql-tag";

export const buryBoneQuery = gql`
  query buryBoneQuery($id: String! = "0xaFd395a2a95Cbd13721f8077fb6f55e14d48E554") {
    buries(id: $id) {
      id
      totalSupply
      ratio
      tBoneMinted
      tBoneBurned
      boneStaked
      boneStakedUSD
      boneHarvested
      boneHarvestedUSD
      tBoneAge
      tBoneAgeDestroyed
    }
  }
`;

export const buryBoneHistoriesQuery = gql`
  query buryBoneHistoriesQuery {
    histories(first: 1000) {
      id
      date
      timeframe
      boneStaked
      boneStakedUSD
      boneHarvested
      boneHarvestedUSD
      tBoneAge
      tBoneAgeDestroyed
      tBoneMinted
      tBoneBurned
      tBoneSupply
      ratio
    }
  }
`;

export const buryBoneUserQuery = gql`
  query buryBoneUserQuery($id: String!) {
    user(id: $id) {
      id
      buries {
        totalSupply
        boneStaked
      }
      tBone
      boneStaked
      boneStakedUSD
      boneHarvested
      boneHarvestedUSD
      tBoneIn
      tBoneOut
      tBoneOffset
      tBoneMinted
      tBoneBurned
      boneIn
      boneOut
      usdIn
      usdOut
      createdAt
      createdAtBlock
    }
  }
`;
