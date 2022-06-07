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
    // chainId: '80001',
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
    // alwaysTier: '0x051dC03ba4d33eCC59Fb23F506Fe1e67004F142C',
    COMBINE_TIER_FACTORY_ADDRESS: '0x21fC48631F0efA5EFe790b5c05929cEdc271dB43',
    BALANCE_TIER_FACTORY_ADDRESS: '0xb1C8EA6E410a71290D5C21404D3324e61912e3c6',
    // erc20TransferTierFactory: '0x2f1554BF57a234828ca3D210bA65cF80d8e5073c',
    ERC721_BALANCE_TIER_FACTORY_ADDRESS: '0xC0E50AD884EBb7C2582677978d48338D46930a08',
    EMISSIONS_FACTORY: '0xE51BeE9adccBafc20507e01EAA4F5aA966306669',
    GATED_NFT_FACTORY: '0xbfe6E65daB36FbdB14bC7979D5DE244628F4eD3a',
    // noticeBoard: '0x4B02C8ceF32db81D4918e1C5b4b16EBA6830872a',
    ESCROW_ADDRESS: '0xCd67b4ef5659B776e996Dd4Be371DCac4ABba6c8',
    // redeemableERC20Factory: '0x4127ea3daf008043a3783094064670d1330d53f0',
    SALE_FACTORY: '0xE152e59e644e49AE5D73Df70658084DFc8b5CBb6',
    VERIFY_FACTORY: '0x6e55b00ecfc718d202e57709a747fe3fc7f6e61e',
    VERIFY_TIER_FACTORY: '0x2aAA6104B099B2d1DF1D984F67da042555506B71',
  },
  blockExplorer: 'https://mumbai.polygonscan.com/',
  graphUrl: 'https://api.thegraph.com/subgraphs/name/beehive-innovation/rain-protocol-mumbai-e590ce'
},
]