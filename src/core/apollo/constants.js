import { ChainId } from "../constants";
export const GRAPH_HOST = {
  [ChainId.RINKEBY]: "https://api.thegraph.com/subgraphs/name",
  [ChainId.SHIBUYA]: "https://graph.shibuya.standardtech.xyz/subgraphs/name",
};

export const EXCHANGE = {
  [ChainId.RINKEBY]: "/billjhlee/rinkeby-exchange",
  [ChainId.SHIBUYA]: "/digitalnativeinc/shibuya-exchange",
};

export const MASTERCHEF = {
  [ChainId.RINKEBY]: "/billjhlee/rinkeby-master-pool2",
  [ChainId.SHIBUYA]: "/digitalnativeinc/shibuya-master-pool",
};

export const BLOCKS = {
  [ChainId.RINKEBY]: "/billjhlee/rinkeby-blocks",
  [ChainId.SHIBUYA]: "",
};

export const getExchangeGraphAddr = (chainId) =>
  `${GRAPH_HOST[chainId]}${EXCHANGE[chainId]}`;
export const getBlocksGraphAddr = (chainId) =>
  `${GRAPH_HOST[chainId]}${BLOCKS[chainId]}`;
export const getMasterChefGraphAddr = (chainId) =>
  `${GRAPH_HOST[chainId]}${MASTERCHEF[chainId]}`;
