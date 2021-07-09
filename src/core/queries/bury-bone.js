import gql from "graphql-tag";

export const buryBoneQuery = gql`
  query buryBoneQuery($id: String! = "0xf7a0383750fef5abace57cc4c9ff98e3790202b3") {
    bury(id: $id) {
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
