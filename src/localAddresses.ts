import { each } from 'svelte/internal';
import { derived, get, Readable, Writable, writable } from 'svelte/store';
import { selectedNetwork } from './stores';

type NetworkLibrary = Map<string, Map<string, { address: string, type: string }>>
type LocalLibrary = Map<string, NetworkLibrary>

const addressesDefault: LocalLibrary = new Map([
    ['Polygon',
        new Map([
            ['Tokens',
                new Map([
                    ['USDC',
                        { address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", type: "Stablecoin" }
                    ],
                    ['USDT',
                        { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", type: "Stablecoin" }
                    ],
                    ['DAI',
                        { address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", type: "Stablecoin" }
                    ],
                    ['WETH',
                        { address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", type: "Token" }
                    ],
                    ['WMATIC',
                        { address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", type: "Token" }
                    ],
                    ['WBTC',
                        { address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", type: "Token" }
                    ]
                ])
            ],
            ['Tiers',
                new Map([
                    ['AlwaysTier',
                        { address: "0xF81572101B3bD379ADFddCBF4d46f40268475A14", type: "Utility" }
                    ],
                    ['USDC BalanceTier',
                        { address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", type: "BalanceTier" }
                    ]
                ])
            ],
            ['Utility',
                new Map([
                    ['Zero Address',
                        { address: "0x0000000000000000000000000000000000000000", type: "Address" }
                    ]
                ])
            ]
        ])
    ],
    ['Mumbai',
        new Map([
            ['Tokens',
                new Map([
                    ['USDCC',
                        { address: "0x25a4Dd4cd97ED462EB5228de47822e636ec3E31A", type: "Stablecoin" }
                    ],
                    ['USDC',
                        { address: "0xe11A86849d99F524cAC3E7A0Ec1241828e332C62", type: "Stablecoin"}
                    ],
                    ['WETH',
                        { address: "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa", type: "Token" }
                    ]
                ])
            ],
            ['Tiers',
                new Map([
                    ['AlwaysTier',
                        { address: "0x051dC03ba4d33eCC59Fb23F506Fe1e67004F142C", type: "Utility" }
                    ],
                    ['USDCC BalanceTier',
                        { address: "0x6BA1fADB694E806c316337143241Dd6cFebd5033", type: "BalanceTier" }
                    ]
                ]),
            ],
            ['Utility',
                new Map([
                    ['Zero Address',
                        { address: "0x0000000000000000000000000000000000000000", type: "Address" }
                    ]
                ])
            ]
        ])
    ],
    ['Ethereum',
        new Map([
            ['Tokens',
                new Map([
                    ['USDC',
                        { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", type: "Stablecoin" }
                    ],
                    ['USDT',
                        { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", type: "Stablecoin" }
                    ],
                    ['DAI',
                        { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", type: "Stablecoin" }
                    ],
                    ['BUSD',
                        { address: "0x4Fabb145d64652a948d72533023f6E7A623C7C53", type: "Stablecoin" }
                    ],
                    ['FRAX',
                        { address: "0x853d955aCEf822Db058eb8505911ED77F175b99e", type: "Stablecoin" }
                    ],
                    ['USDP',
                        { address: "0x8E870D67F660D95d5be530380D0eC0bd388289E1", type: "Stablecoin" }
                    ],
                    ['WETH',
                        { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", type: "Token" }
                    ],
                    ['WBTC',
                        { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", type: "Token" }
                    ],
                    ['MATIC',
                        { address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0", type: "Token" }
                    ],
                    ['BNB',
                        { address: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52", type: "Token" }
                    ],
                    ['FTM',
                        { address: "0x4E15361FD6b4BB609Fa63C81A2be19d873717870", type: "Token" }
                    ],
                    ['UNI',
                        { address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", type: "Token" }
                    ],
                ])
            ],
            ['Tiers',
                new Map([
                    ['AlwaysTier',
                        { address: "0x735ECdF9a79e62531BAB9240696a450F94AB79f8", type: "Utility" }
                    ]
                ])
            ],
            ['Utility',
                new Map([
                    ['Zero Address',
                        { address: "0x0000000000000000000000000000000000000000", type: "Address" }
                    ]
                ])
            ]
        ])
    ],
    ['Goerli',
        new Map([
            ['Tokens',
                new Map([
                    ['USDC',
                        { address: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F", type: "Stablecoin" }
                    ],
                    ['WETH',
                        { address: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6", type: "Token" }
                    ],
                    ['UNI',
                        { address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", type: "Token" }
                    ]
                ])
            ],
            ['Tiers',
                new Map([
                    ['AlwaysTier',
                        { address: "0x1Fcf1f92919F0E0023463234c78296E9517b56Ea", type: "Utility" }
                    ]
               ])
            ],
            ['Utility',
                new Map([
                    ['Zero Address',
                        { address: "0x0000000000000000000000000000000000000000", type: "Address" }
                    ]
                ])
            ]
        ])
    ],
    ['Avalanche - Mainnet',
        new Map([
            ['Tokens',
                new Map([
                    ['USDC.e',
                        { address: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", type: "Stablecoin" }
                    ],
                    ['USDC',
                        { address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", type: "Stablecoin" }
                    ],
                    ['USDT.e',
                        { address: "0xc7198437980c041c805A1EDcbA50c1Ce5db95118", type: "Stablecoin" }
                    ],
                    ['USDT',
                        { address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", type: "Stablecoin" }
                    ],
                    ['DAI.e',
                        { address: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", type: "Stablecoin" }
                    ],
                    ['BUSD.e',
                        { address: "0x19860CCB0A68fd4213aB9D8266F7bBf05A8dDe98", type: "Stablecoin" }
                    ],
                    ['FRAX',
                        { address: "0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64", type: "Stablecoin" }
                    ],
                    ['WETH.e',
                        { address: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB", type: "Token" }
                    ],
                    ['WAVAX',
                        { address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", type: "Token" }
                    ],
                    ['WBTC.e',
                        { address: "0x50b7545627a5162F82A992c33b87aDc75187B218", type: "Token" }
                    ],
                    ['UNI.e',
                        { address: "0x8eBAf22B6F053dFFeaf46f4Dd9eFA95D89ba8580", type: "Token" }
                    ],
                ])
            ],
            ['Tiers',
                new Map([
                    ['AlwaysTier',
                        { address: "0x552E9bDA51Ca6f669277dB900FC2b05fAf7A79B5", type: "Utility" }
                    ]
                ]),
            ],
            ['Utility',
                new Map([
                    ['Zero Address',
                        { address: "0x0000000000000000000000000000000000000000", type: "Address" }
                    ]
                ])
            ]
        ])
    ],
    ['Avalanche - Testnet',
        new Map([
            ['Tokens',
                new Map([
                    ['USDC',
                        { address: "0x1Ad483798422423E3471d2fa8a7eF6EB83BD4926", type: "stablecoin" }
                    ],
                    ['USDT',
                        { address: "0x5425890298aed601595a70AB815c96711a31Bc65", type: "Stablecoin" }
                    ],
                    ['WETH',
                        { address: "0xf11C7e4Ce4846C7cc0669105f8358612d0E1F593", type: "Token" }
                    ]
                ])
            ],
            ['Tiers',
                new Map([
                    ['AlwaysTier',
                        { address: "0x3f16F26C6844be3d0934EC0543039d874D45da9e", type: "Utility" }
                    ]
                ])
            ],
            ['Utility',
                new Map([
                    ['Zero Address',
                        { address: "0x0000000000000000000000000000000000000000", type: "Address" }
                    ]
                ])
            ]
        ])
    ],
    ['BSC - Mainnet',
        new Map([
            ['Tokens',
                new Map([
                    ['USDC',
                        { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", type: "Stablecoin" }
                    ],
                    ['USDT',
                        { address: "0x55d398326f99059fF775485246999027B3197955", type: "Stablecoin" }
                    ],
                    ['DAI',
                        { address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", type: "Stablecoin" }
                    ],
                    ['BUSD',
                        { address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", type: "Stablecoin" }
                    ],
                    ['FRAX',
                        { address: "0x90C97F71E18723b0Cf0dfa30ee176Ab653E89F40", type: "Stablecoin" }
                    ],
                    ['ETH',
                        { address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", type: "Token" }
                    ],
                    ['BTCB',
                        { address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", type: "Token" }
                    ],
                    ['WBNB',
                        { address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", type: "Token" }
                    ],
                    ['AVAX',
                        { address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", type: "Token" }
                    ],
                    ['FTM',
                        { address: "0xAD29AbB318791D579433D831ed122aFeAf29dcfe", type: "Token" }
                    ],
                    ['UNI',
                        { address: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1", type: "Token" }
                    ]
                ])
            ],
            ['Tiers',
                new Map([
                    ['AlwaysTier',
                        { address: "0x735ECdF9a79e62531BAB9240696a450F94AB79f8", type: "Utility" }
                    ]
               ])
            ],
            ['Utility',
                new Map([
                    ['Zero Address',
                        { address: "0x0000000000000000000000000000000000000000", type: "Address" }
                    ]
                ])
            ]
        ])
    ],
    ['BSC - Testnet',
        new Map([
            ['Tokens',
                new Map([
                    ['BUSD',
                        { address: "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7", type: "Stablecoin" }
                    ],
                    ['USDT',
                        { address: "0x21007fbfe34972C9B968a4AB1AB94AfdE9170244", type: "Stablecoin" }
                    ],
                    ['DBUSD',
                        { address: "0x4bfe13fd065db627425068d203ba5237d6f185b1", type: "Stablecoin" }
                    ],
                    ['WBNB',
                        { address: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd", type: "Token" }
                    ]
                ])
            ],
            ['Tiers',
                new Map([
                    ['AlwaysTier',
                        { address: "0x735ECdF9a79e62531BAB9240696a450F94AB79f8", type: "Utility" }
                    ],
                    ['DBUSD BalanceTier',
                        { address: "0x37cb1b89bbf7769dd2dfbc631753f54c383b9798", type: "BalanceTier" }
                    ]
                ])
            ],
            ['Utility',
                new Map([
                    ['Zero Address',
                        { address: "0x0000000000000000000000000000000000000000", type: "Address" }
                    ]
                ])
            ]
        ])
    ],
    ['Fantom - Mainnet',
        new Map([
            ['Tokens',
                new Map([
                    ['USDC',
                        { address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", type: "Stablecoin" }
                    ],
                    ['DAI',
                        { address: "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E", type: "Stablecoin" }
                    ],
                    ['MIM',
                        { address: "0x82f0B8B456c1A451378467398982d4834b6829c1", type: "Stablecoin" }
                    ],
                    ['FRAX',
                        { address: "0xdc301622e621166BD8E82f2cA0A26c13Ad0BE355", type: "Stablecoin" }
                    ],
                    ['ETH',
                        { address: "0x74b23882a30290451A17c44f4F05243b6b58C76d", type: "Token" }
                    ],
                    ['fETH',
                        { address: "0x658b0c7613e890EE50B8C4BC6A3f41ef411208aD", type: "Token" }
                    ],
                    ['fBTC',
                        { address: "0xe1146b9AC456fCbB60644c36Fd3F868A9072fc6E", type: "Token" }
                    ],
                    ['WBTC',
                        { address: "0x321162Cd933E2Be498Cd2267a90534A804051b11", type: "Token" }
                    ],
                    ['WFTM',
                        { address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", type: "Token" }
                    ],
                    ['AVAX',
                        { address: "0x511D35c52a3C244E7b8bd92c0C297755FbD89212", type: "Token" }
                    ]
                ])
            ],
            ['Tiers',
                new Map([
                    ['AlwaysTier',
                        { address: "0x552E9bDA51Ca6f669277dB900FC2b05fAf7A79B5", type: "Utility" }
                    ]
               ])
            ],
            ['Utility',
                new Map([
                    ['Zero Address',
                        { address: "0x0000000000000000000000000000000000000000", type: "Address" }
                    ]
                ])
            ]
        ])
    ],
    ['Fantom - Testnet',
        new Map([
            ['Tokens',
                new Map([
                    ['USDC',
                        { address: "0xe773Fb9a95685cB584586928130A7D08be723458", type: "Stablecoin" }
                    ],
                    ['BUSD',
                        { address: "0x1e96C5CfF4C80ad2e3603e3FD32ad19CC74BC1BC", type: "Stablecoin" }
                    ]
                ])
            ],
            ['Tiers',
                new Map([
                    ['AlwaysTier',
                        { address: "0x01c289870AC24F51A95CBe70Cf79F43C9B6181F0", type: "Utility" }
                    ]
                ])
            ],
            ['Utility',
                new Map([
                    ['Zero Address',
                        { address: "0x0000000000000000000000000000000000000000", type: "Address" }
                    ]])
            ]
        ])
    ],
    ['Arbitrum',
        new Map([
            ['Tokens',
                new Map([
                    ['USDC',
                        { address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", type: "Stablecoin" }
                    ],
                    ['USDT',
                        { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", type: "Stablecoin" }
                    ],
                    ['DAI',
                        { address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", type: "Stablecoin" }
                    ],
                    ['MIM',
                        { address: "0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A", type: "Stablecoin" }
                    ],
                    ['FRAX',
                        { address: "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F", type: "Stablecoin" }
                    ],
                    ['WETH',
                        { address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", type: "Token" }
                    ],
                    ['WBTC',
                        { address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", type: "Token" }
                    ],
                    ['BNB',
                        { address: "0x20865e63B111B2649ef829EC220536c82C58ad7B", type: "Token" }
                    ],
                    ['UNI',
                        { address: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0", type: "Token" }
                    ],
                ])
            ],
            ['Tiers',
                new Map([
                    ['AlwaysTier',
                        { address: "0x552E9bDA51Ca6f669277dB900FC2b05fAf7A79B5", type: "Utility" }
                    ]
                ]),
            ],
            ['Utility',
                new Map([
                    ['Zero Address',
                        { address: "0x0000000000000000000000000000000000000000", type: "Address" }
                    ]
                ])
            ]
        ])
    ],
    ['Arbitrum - Rinkeby',
        new Map([
            ['Tokens',
                new Map([
                    ['DAI',
                        { address: "0x2f3C1B6A51A469051A22986aA0dDF98466cc8D3c", type: "Stablecoin" }
                    ],
                    ['PPUSD',
                        { address: "0x9e062eee2c0Ab96e1E1c8cE38bF14bA3fa0a35F6", type: "Stablecoin" }
                    ],
                    ['WETH',
                        { address: "0xEBbc3452Cc911591e4F18f3b36727Df45d6bd1f9", type: "Token" }
                    ]
                ])
            ],
            ['Tiers',
                new Map([
                    ['AlwaysTier',
                        { address: "0x552E9bDA51Ca6f669277dB900FC2b05fAf7A79B5", type: "Utility" }
                    ]
               ]),
            ],
            ['Utility',
                new Map([
                    ['Zero Address',
                        { address: "0x0000000000000000000000000000000000000000", type: "Address" }
                    ]])
            ]
        ])
    ],
    ['Celo - Mainnet',
        new Map([
            ['Tokens',
                new Map([
                    ['USDC',
                        { address: "0xef4229c8c3250C675F21BCefa42f58EfbfF6002a", type: "Stablecoin" }
                    ],
                    ['cUSD',
                        { address: "0x765DE816845861e75A25fCA122bb6898B8B1282a", type: "Stablecoin" }
                    ],
                    ['CELO',
                        { address: "0x471EcE3750Da237f93B8E339c536989b8978a438", type: "Native Token" }
                    ]
                ])
            ],
            ['Tiers',
                new Map([
                    ['AlwaysTier',
                        { address: "0x552E9bDA51Ca6f669277dB900FC2b05fAf7A79B5", type: "Utility" }
                    ]
                ]),
            ],
            ['Utility',
                new Map([
                    ['Zero Address',
                        { address: "0x0000000000000000000000000000000000000000", type: "Address" }
                    ]
                ])
            ]
        ])
    ],
    ['Celo - Alfajores',
        new Map([
            ['Tokens',
                new Map([
                    ['cUSD',
                        { address: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1", type: "Stablecoin" }
                    ],
                    ['DAI',
                        { address: "0x7d91E51C8F218f7140188A155f5C75388630B6a8", type: "Stablecoin" }
                    ],
                    ['CELO',
                        { address: "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9", type: "Token" }
                    ]
                ])
            ],
            ['Tiers',
                new Map([
                    ['AlwaysTier',
                        { address: "0x61904ed7643c7Bc12aaBfc6B29B830Be93231d8b", type: "Utility" }
                    ]
                ]),
            ],
            ['Utility',
                new Map([
                    ['Zero Address',
                        { address: "0x0000000000000000000000000000000000000000", type: "Address" }
                    ]
                ])
            ]
        ])
    ],
    ['Aurora - Mainnet',
        new Map([
            ['Tokens',
                new Map([
                    ['USDC',
                        { address: "0xB12BFcA5A55806AaF64E99521918A4bf0fC40802", type: "Stablecoin" }
                    ],
                    ['USDT',
                        { address: "0x4988a896b1227218e4A686fdE5EabdcAbd91571f", type: "Stablecoin" }
                    ],
                    ['FRAX',
                        { address: "0xE4B9e004389d91e4134a28F19BD833cBA1d994B6", type: "Stablecoin" }
                    ],
                    ['WETH',
                        { address: "0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB", type: "Token" }
                    ],
                    ['Aurora',
                        { address: "0x8BEc47865aDe3B172A928df8f990Bc7f2A3b9f79", type: "Token" }
                    ]
                ])
            ],
            ['Tiers',
                new Map([
                    ['AlwaysTier',
                        { address: "0x552E9bDA51Ca6f669277dB900FC2b05fAf7A79B5", type: "Utility" }
                    ]
                ]),
            ],
            ['Utility',
                new Map([
                    ['Zero Address',
                        { address: "0x0000000000000000000000000000000000000000", type: "Address" }
                    ]
                ])
            ]
        ])
    ],
    ['Aurora - Testnet',
        new Map([
            ['Tokens',
                new Map([
                    ['USDCC',
                        { address: "0x84606Cf2905f7004D6164a7aC2884A36BC8a0A90", type: "Stablecoin" }
                    ],
                    ['USDT',
                        { address: "0x8547A073cbc7D4aF48aD061b9D005C06D55337F5", type: "Stablecoin" }
                    ],
                    ['DAI',
                        { address: "0x22EE86789837529E2F58Fd6D1dD6B0B26fc1e092", type: "Stablecoin" }
                    ],
                    ['WETH',
                        { address: "0x8886E7A8883e9A40b30Bd4E16e0e25C2C3f29Cd8", type: "Token" }
                    ]
                ])
            ],
            ['Tiers',
                new Map([
                    ['AlwaysTier',
                        { address: "0xd51AAeCC45bfAeC2e5bc50d5d647D2B7FF48f807", type: "Utility" }
                    ]
                ]),
            ],
            ['Utility',
                new Map([
                    ['Zero Address',
                        { address: "0x0000000000000000000000000000000000000000", type: "Address" }
                    ]
                ])
            ]
        ])
    ],
])

const createLocalLibrary = (selectedNetworkStore: typeof selectedNetwork) => {

    const stored = localStorage.getItem('rainAddresses');
    let parsedTemp1 = addressesDefault;
    let parsedTemp2 = JSON.parse(stored, reviver);

    for (let key1 in parsedTemp1) {
        for (let key2 in parsedTemp2) {
            if (key1 === key2) {
                parsedTemp1[key1] = parsedTemp2[key2];
            }
        }
    }
    
    const parsed = parsedTemp1;
    
    const { subscribe, update } = writable(parsed)

    subscribe(v => localStorage.setItem('rainAddresses', JSON.stringify(v, replacer)))

    const removeGroup = (group: string) => {
        const network = get(selectedNetworkStore).label

        update(v => {
            const n = v.get(network)
            n.delete(group)
            v.set(network, n)
            return v
        })
    }

    const addAlias = (group: string, alias: string, address: string, type: string) => {
        const network = get(selectedNetworkStore).label

        update(v => {
            const n = v.get(network) || new Map()
            const g = n?.get(group) || new Map()

            g.set(alias, { address, type })
            n.set(group, g)
            v.set(network, n)
            return v
        }
        )
    }

    const removeAlias = (group: string, alias: string) => {
        const network = get(selectedNetworkStore).label

        update(v => {
            const n = v.get(network)
            const g = n?.get(group)

            if (!n || !g) { return v }

            g.delete(alias)
            n.set(group, g)
            v.set(network, n)

            return v
        })
    }

    return {
        subscribe,
        addAlias,
        removeAlias,
        removeGroup
    }

}

export const localLibrary: Readable<LocalLibrary> & { addAlias, removeAlias, removeGroup } = createLocalLibrary(selectedNetwork)

export const networkLibrary: Readable<NetworkLibrary> = derived([selectedNetwork, localLibrary], ([$selectedNetwork, $localLibrary], set) => {
    if ($selectedNetwork && $localLibrary) {
        set($localLibrary.get($selectedNetwork.label))
    }
})

function replacer(key, value) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()),
        };
    } else {
        return value;
    }
}
function reviver(key, value) {
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}

