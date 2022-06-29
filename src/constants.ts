import WalletConnect from "@walletconnect/web3-provider/dist/umd/index.min";
import Fortmatic from "fortmatic";

// Example for Polygon/Matic:
const customNetworkOptions = {
  rpcUrl: 'https://rpc-mumbai.maticvigil.com',
  chainId: 80001
}

export const providerOptions = {
  injected: {
    display: {
      name: "Metamask",
      description: "Connect with the provider in your Browser"
    },
    package: null
  },
  fortmatic: {
    package: Fortmatic, // required
    options: {
      key: "pk_live_1BE6BBD3BEAFCDDD", // required
      network: customNetworkOptions // if we don't pass it, it will default to localhost:8454
    }
  },
  walletconnect: {
    package: WalletConnect, // required
    options: {
      infuraId: "0f270373e0934beda174c537257386b0",
      rpc: {
        80001: "https://matic-mumbai.chainstacklabs.com",
        137: "https://polygon-rpc.com"
      },
    }
  },
  binancechainwallet: {
    package: true
  },
};


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
  blockExplorer: 'https://mumbai.polygonscan.com/',
  graphUrl: 'https://api.thegraph.com/subgraphs/name/beehive-innovation/rain-protocol-mumbai-e590ce'
},
{
  label: "Avalanche Testnet",
  config: {
    chainId: '0xA869',
    chainName: 'Avalanche Testnet C-Chain',
    rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18
    },
    blockExplorerUrls: ['https://testnet.snowtrace.io/']
  }
},
{
  label: "Smart Chain - Testnet",
  config: {
    chainId: "0x61",
    chainName: 'Binance Smart Chain - Testnet',
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    nativeCurrency: {
      name: 'Binance Smart Chain',
      symbol: 'BNB',
      decimals: 18
    },
    blockExplorerUrls: ['https://testnet.bscscan.com']
  }
},
{
  label: "Fantom - Testnet",
  config: {
    chainId: "0xfa2",
    chainName: 'Fantom - Testnet',
    rpcUrls: ['https://rpc.testnet.fantom.network'],
    nativeCurrency: {
      name: 'Fantom - Testnet',
      symbol: 'FTM',
      decimals: 18
    },
    blockExplorerUrls: ['https://testnet.ftmscan.com']
  }
},
{
  label: "Ethereum",
  config: {
    chainId: "0x1",
    chainName: 'Ethereum',
    rpcUrls: ['https://eth-mainnet.public.blastapi.io'],
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    blockExplorerUrls: ['https://etherscan.io/']
  }
},
{
  label: "Ropsten",
  config: {
    chainId: "0x3",
    chainName: 'Ropsten',
    rpcUrls: ['https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    nativeCurrency: {
      name: 'Ropsten',
      symbol: 'ETH',
      decimals: 18
    },
    blockExplorerUrls: ['https://ropsten.etherscan.io/']
  }
},
{
  label: "Rinkeby",
  config: {
    chainId: "0x4",
    chainName: 'Rinkeby',
    rpcUrls: ['https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    nativeCurrency: {
      name: 'Rinkeby',
      symbol: 'ETH',
      decimals: 18
    },
    blockExplorerUrls: ['https://rinkeby.etherscan.io']
  }
},
{
  label: "Goerli",
  config: {
    chainId: "0x5",
    chainName: 'Goerli',
    rpcUrls: ['https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    nativeCurrency: {
      name: 'Goerli',
      symbol: 'ETH',
      decimals: 18
    },
    blockExplorerUrls: ['https://goerli.etherscan.io']
  }
},
{
  label: " Kovan",
  config: {
    chainId: "0x2a",
    chainName: ' Kovan',
    rpcUrls: ['https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    nativeCurrency: {
      name: ' Kovan',
      symbol: 'ETH',
      decimals: 18
    },
    blockExplorerUrls: ['https://kovan.etherscan.io']
  }
}
]

