export const networks = [{
  label: "Polygon",
  config: {
    chainId: '0x89',
    chainName: 'Polygon',
    rpcUrls: ['https://polygon-rpc.com'],
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC', // 2-6 characters long
      decimals: 18
    },
    blockExplorerUrls: ['https://polygonscan.com/']
  },
  addresses: {
    BALANCE_TIER_FACTORY_ADDRESS:
      "0xC6A8DA983f47E9c444Dac0b1881253bf8848a117",
    ERC721_BALANCE_TIER_FACTORY_ADDRESS:
      "0xa6703bAC5A591fa7f59B1aF76060D4c34c7DaAaB",
    COMBINE_TIER_FACTORY_ADDRESS:
      "0x8a28BD4F8F210e6BE7Ee83f06b310Fe89A72c142",
    SALE_FACTORY: "0x125102a6Fa1f8E83Cc5329F03f179E165eF623d5",
    EMISSIONS_FACTORY: "0x83b45E84dfd5f00a03c6C483B27C44A0C4E9903f",
    GATED_NFT_FACTORY: "0xCB265d72a2669F1fA587327Ddb809dc5A4a6E45a",
    VERIFY_TIER_FACTORY: "0x535C0ae92B66F75aFF5B0125298E43B1CBc3fa63",
    VERIFY_FACTORY: "0x2b730c060FFA83Ce5D2B29016591874f31405A23"
  },
  blockExplorer: 'https://polygonscan.com/',
  graphUrl: 'https://api.thegraph.com/subgraphs/name/beehive-innovation/rain-protocol-v2-polygon'
},
{
  label: "Mumbai",
  config: {
    chainId: '0x13881',
    chainName: 'Mumbai',
    rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC', // 2-6 characters long
      decimals: 18
    },
    blockExplorerUrls: ['https://mumbai.polygonscan.com/']
  },
  addresses: {
    BALANCE_TIER_FACTORY_ADDRESS:
      "0x31a5F2f477297C2F3AED28E03Fec8934cc4298a7",
    ERC721_BALANCE_TIER_FACTORY_ADDRESS:
      "0xF95c6106d8b0FE566805a856Dfb7F64083369caF",
    COMBINE_TIER_FACTORY_ADDRESS:
      "0x09f91AC0215AFa0533Bf3212FBe59086300c3165",
    SALE_FACTORY: "0x7fbc27F1D14e0c59e2F4346B5166692659c4694D",
    EMISSIONS_FACTORY: "0x83b45E84dfd5f00a03c6C483B27C44A0C4E9903f",
    GATED_NFT_FACTORY: "0xD9AD3A87E4c1F604091c1A0E147c88B3A9E1B4ad",
    VERIFY_TIER_FACTORY: "0x007aB50f8c491AE54114139b9ada40aB3c6e4811",
    VERIFY_FACTORY: "0x39e3c764e6185C6a3100D0dA1195D26519b42750"
  },
  blockExplorer: 'https://mumbai.polygonscan.com/',
  graphUrl: 'https://api.thegraph.com/subgraphs/name/beehive-innovation/rain-protocol-v2_1-mumbai'
},
]