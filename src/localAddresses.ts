import { derived, get, Readable, Writable, writable } from 'svelte/store';
import { selectedNetwork } from './stores';

type NetworkLibrary = Map<string, Map<string, { address: string, type: string }>>
type LocalLibrary = Map<string, NetworkLibrary>

const addressesDefault: LocalLibrary = new Map([
    ['Mumbai',
        new Map([
            ['Tokens',
                new Map([
                    ['USDCC',
                        { address: "0x25a4Dd4cd97ED462EB5228de47822e636ec3E31A", type: "Token" }
                    ]])
            ],
            ['Tiers',
                new Map([
                    ['VerifyTier',
                        { address: "0xe30289f881ee37c51ad5678ed799677e6c3e788f", type: "BalanceTier" }
                    ]]),

            ],
            ['Utility',
                new Map([
                    ['Zero Address',
                        { address: "0x0000000000000000000000000000000000000000", type: "Address" }
                    ]])
            ]
        ]
        )
    ],
    ['Polygon',
        new Map([
            ['Tokens',
                new Map([
                    ['USDC',
                        { address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", type: "Token" }
                    ]])
            ],
            ['Tiers',
                new Map([
                    ['USDC BalanceTier',
                        { address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", type: "BalanceTier" }
                    ]])
            ],
            ['Utility',
                new Map([
                    ['Zero Address',
                        { address: "0x0000000000000000000000000000000000000000", type: "Address" }
                    ]])
            ]
        ])
    ],
    ['BSC - Testnet',
        new Map([
            ['Tokens',
                new Map([
                    ['DBUSD',
                        { address: "0x4bfe13fd065db627425068d203ba5237d6f185b1", type: "Token" }
                    ]])
            ],
            ['Tiers',
                new Map([
                    ['DBUSD BalanceTier',
                        { address: "0x37cb1b89bbf7769dd2dfbc631753f54c383b9798", type: "BalanceTier" }
                    ]])
            ],
            ['Utility',
                new Map([
                    ['Zero Address',
                        { address: "0x0000000000000000000000000000000000000000", type: "Address" }
                    ]])
            ]
        ])
    ],
    ['Goerli',
        new Map([
            ['Tokens',
                new Map([
                    ['USDT',
                        { address: "0xd4e71c4bb48850f5971ce40aa428b09f242d3e8a", type: "Token" }
                    ]])
            ],
            // ['Tiers',
            //     new Map([
            //         ['USDT BalanceTier',
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
    ['Ethereum',
        new Map([
            // ['Tokens',
            //     new Map([
            //         ['DBUSD',
            //             { address: "0x4bfe13fd065db627425068d203ba5237d6f185b1", type: "Token" }
            //         ]])
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
    ['BSC - Mainnet',
        new Map([
            // ['Tokens',
            //     new Map([
            //         ['DBUSD',
            //             { address: "0x4bfe13fd065db627425068d203ba5237d6f185b1", type: "Token" }
            //         ]])
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
    ['Avalanche - Mainnet',
        new Map([
            ['Tokens',
                new Map([
                    ['USDT',
                        { address: "0xd4e71c4bb48850f5971ce40aa428b09f242d3e8a", type: "Token" }
                    ]])
            ],
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
])

const createLocalLibrary = (selectedNetworkStore: typeof selectedNetwork) => {

    const stored = localStorage.getItem('rainAddresses')
    const parsed = stored ? JSON.parse(stored, reviver) : addressesDefault

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

