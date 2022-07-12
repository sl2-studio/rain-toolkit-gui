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
                        { address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", type: "Token" }
                    ],
                    ['USDT',
                        { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", type: "Token" }
                    ],
                    ['DAI',
                        { address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", type: "Token" }
                    ]
                ])
            ],
            ['Tiers',
                new Map([
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
                        { address: "0x25a4Dd4cd97ED462EB5228de47822e636ec3E31A", type: "Token" }
                    ],
                    ['USDC',
                        { address: "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23", type: "Token"}
                    ]
                ])
            ],
            ['Tiers',
                new Map([
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
                        { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", type: "Token" }
                    ],
                    ['USDT',
                        { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", type: "Token" }
                    ],
                    ['DAI',
                        { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", type: "Token" }
                    ]
                ])
            ],
            // ['Tiers',
            //     new Map([
            //         ['DBUSD BalanceTier',
            //             { address: "0x37cb1b89bbf7769dd2dfbc631753f54c383b9798", type: "BalanceTier" }
            //         ]
            //     ])
            // ],
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
                        { address: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F", type: "Token" }
                    ]
                ])
            ],
            // ['Tiers',
            //     new Map([
            //         ['USDT BalanceTier',
            //             { address: "0x37cb1b89bbf7769dd2dfbc631753f54c383b9798", type: "BalanceTier" }
            //         ]
            //    ])
            // ],
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
                        { address: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", type: "Token" }
                    ],
                    ['USDT.e',
                        { address: "0xc7198437980c041c805A1EDcbA50c1Ce5db95118", type: "Token" }
                    ],
                    ['DAI.e',
                        { address: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", type: "Token" }
                    ]
                ])
            ],
            ['Tiers',
                new Map([
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
    ['Avalanche - Testnet',
        new Map([
            ['Tokens',
                new Map([
                    ['USDT',
                        { address: "0x5425890298aed601595a70AB815c96711a31Bc65", type: "Token" }
                    ]
                ])
            ],
            // ['Tiers',
            //     new Map([
            //         ['DBUSD BalanceTier',
            //             { address: "0x37cb1b89bbf7769dd2dfbc631753f54c383b9798", type: "BalanceTier" }
            //         ]
            //     ])
            // ],
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
                        { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", type: "Token" }
                    ],
                    ['USDT',
                        { address: "0x55d398326f99059fF775485246999027B3197955", type: "Token" }
                    ],
                    ['DAI',
                        { address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", type: "Token" }
                    ]
                ])
            ],
            // ['Tiers',
            //     new Map([
            //         ['DBUSD BalanceTier',
            //             { address: "0x37cb1b89bbf7769dd2dfbc631753f54c383b9798", type: "BalanceTier" }
            //         ]
            //    ])
            // ],
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
                    ['DBUSD',
                        { address: "0x4bfe13fd065db627425068d203ba5237d6f185b1", type: "Token" }
                    ]
                ])
            ],
            ['Tiers',
                new Map([
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
                        { address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", type: "Token" }
                    ],
                    ['DAI',
                        { address: "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E", type: "Token" }
                    ]
                ])
            ],
            // ['Tiers',
            //     new Map([
            //         ['DBUSD BalanceTier',
            //             { address: "0x37cb1b89bbf7769dd2dfbc631753f54c383b9798", type: "BalanceTier" }
            //         ]
            //    ])
            // ],
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
            // ['Tokens',
            //     new Map([
            //         ['USDT',
            //             { address: "0x35085aCEc0E09eF7Dc78073822A8908D52Db9D83", type: "Token" }
            //         ]
            //     ])
            // ],
            // ['Tiers',
            //     new Map([
            //         ['DBUSD BalanceTier',
            //             { address: "0x37cb1b89bbf7769dd2dfbc631753f54c383b9798", type: "BalanceTier" }
            //         ]])
            // ],
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
                        { address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", type: "Token" }
                    ],
                    ['USDT',
                        { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", type: "Token" }
                    ],
                    ['DAI',
                        { address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", type: "Token" }
                    ]
                ])
            ],
            // ['Tiers',
            //     new Map([
            //         ['USDCC BalanceTier',
            //             { address: "0x6BA1fADB694E806c316337143241Dd6cFebd5033", type: "BalanceTier" }
            //         ]
            //     ]),

            // ],
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
            // ['Tokens',
            //     new Map([
            //         ['USDCC',
            //             { address: "0x25a4Dd4cd97ED462EB5228de47822e636ec3E31A", type: "Token" }
            //         ]
            //     ])
            // ],
            // ['Tiers',
            //     new Map([
            //         ['USDCC BalanceTier',
            //             { address: "0x6BA1fADB694E806c316337143241Dd6cFebd5033", type: "BalanceTier" }
            //         ]
            //    ]),
            // ],
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
                        { address: "0xef4229c8c3250C675F21BCefa42f58EfbfF6002a", type: "Token" }
                    ],
                    ['cUSD',
                        { address: "0x765DE816845861e75A25fCA122bb6898B8B1282a", type: "Token" }
                    ]
                ])
            ],
            // ['Tiers',
            //     new Map([
            //         ['USDCC BalanceTier',
            //             { address: "0x6BA1fADB694E806c316337143241Dd6cFebd5033", type: "BalanceTier" }
            //         ]
            //     ]),
            // ],
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
            // ['Tokens',
            //     new Map([
            //         ['USDCC',
            //             { address: "0x25a4Dd4cd97ED462EB5228de47822e636ec3E31A", type: "Token" }
            //         ]
            //     ])
            // ],
            // ['Tiers',
            //     new Map([
            //         ['USDCC BalanceTier',
            //             { address: "0x6BA1fADB694E806c316337143241Dd6cFebd5033", type: "BalanceTier" }
            //         ]
            //     ]),
            // ],
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
                        { address: "0xB12BFcA5A55806AaF64E99521918A4bf0fC40802", type: "Token" }
                    ],
                    ['USDT',
                        { address: "0x4988a896b1227218e4A686fdE5EabdcAbd91571f", type: "Token" }
                    ],
                    ['FRAX',
                        { address: "0xE4B9e004389d91e4134a28F19BD833cBA1d994B6", type: "Token" }
                    ]
                ])
            ],
            // ['Tiers',
            //     new Map([
            //         ['USDCC BalanceTier',
            //             { address: "0x6BA1fADB694E806c316337143241Dd6cFebd5033", type: "BalanceTier" }
            //         ]
            //     ]),
            // ],
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
            // ['Tokens',
            //     new Map([
            //         ['USDCC',
            //             { address: "0x25a4Dd4cd97ED462EB5228de47822e636ec3E31A", type: "Token" }
            //         ]])
            // ],
            // ['Tiers',
            //     new Map([
            //         ['USDCC BalanceTier',
            //             { address: "0x6BA1fADB694E806c316337143241Dd6cFebd5033", type: "BalanceTier" }
            //         ]
            //     ]),
            // ],
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

