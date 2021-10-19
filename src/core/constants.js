export const TOKEN_DENY = [
  "0x495c7f3a713870f68f8b418b355c085dfdc412c3",
  "0xc3761eb917cd790b30dad99f6cc5b4ff93c4f9ea",
  "0xe31debd7abff90b06bca21010dd860d8701fd901",
  "0xfc989fbb6b3024de5ca0144dc23c18a063942ac1",
];

export const PAIR_DENY = ["0xb6a741f37d6e455ebcc9f17e2c16d0586c3f57a5"];

export const EXCHANGE_CREATED_TIMESTAMP = 1599214239;

export const POOL_DENY = ["14", "29", "45", "30"];

export const SUSHI_TOKEN = "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2";

export const DEFAULT_CHAIN_ID = 4;

export const ChainId = {
  RINKEBY: 4,
  SHIBUYA: 81,
  SHIDEN: 336,
};

export const SCANNERS = {
  [ChainId.RINKEBY]: {
    name: "Etherscan",
    url: "https://rinkeby.etherscan.io/",
    getUrl: (id) => {
      return `https://rinkeby.etherscan.io/address/${id}`;
    },
    getTxUrl: (id) => {
      return `https://rinkeby.etherscan.io/address/${id}`;
    },
  },
  [ChainId.SHIBUYA]: {
    name: "Subscan",
    url: "https://shibuya.subscan.io/",
    getUrl: (id) => {
      return `https://shibuya.subscan.io/account/${id}`;
    },
    getTxUrl: (id) => {
      return `https://shibuya.subscan.io/tx/${id}`;
    },
  },
};

// all addrs should be lowercase
export const FACTORY_ADDRESS = {
  [ChainId.RINKEBY]: "0xf659492744608b595670c1508aa0f5b92b84b94d",
  [ChainId.SHIBUYA]: "0x0e60c35fcf3184dce5cf04d4b736e56f2de7caf7",
  [ChainId.SHIDEN]: "0x1e3f3d16d8087752d8254906125b7fc39cb1bf59",
};

export const MASTERPOOL_ADDRESS = {
  [ChainId.RINKEBY]: "0x22079b36af1ab814350fff725cd8f67f3c70b753",
};

export const STND_ADDRESS = {
  [ChainId.RINKEBY]: "0xc8aeedb09f4d90d59ee47fed8c70d10fd267b2ab",
  [ChainId.SHIBUYA]: "0xb0a1aa4cb76c0e35d9ac9eba422bf76534bf155a",
};

export const DIVIDEND_POOL_ADDRESS = {
  [ChainId.RINKEBY]: "0x45fa9f11b06dff3f4b04746629523c21fb2cadb9",
};
