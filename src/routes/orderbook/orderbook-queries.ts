import { queryStore } from "@urql/svelte";
import { OperationResultStore } from "@urql/svelte/dist/types/common";
import { client } from "src/stores";
import { tick } from "svelte";
import { derived, writable } from "svelte/store";

interface OperationResultStoreReexecutable extends OperationResultStore {
    reexecute?: Function
}

const getAllVaults = (client) => {
    const query = queryStore({
        client,
        query: `
        query {
            tokenVaults {
                owner
                token {
                    id
                    symbol
                    name
                    decimals
                }
                balance
            }
        }`,
        requestPolicy: "network-only",
        pause: false,
    }
    ) as OperationResultStoreReexecutable

    return query
}

const getOwnedVaults = (client, owner) => {
    const query = queryStore({
        client,
        query: `
        query ($owner: String) {
            tokenVaults (where: {owner : $owner}) {
                owner
                token {
                    id
                    symbol
                    name
                    decimals
                }
                balance
            }
        }`,
        variables: { owner },
        requestPolicy: "network-only",
        pause: false,
    }
    ) as OperationResultStoreReexecutable

    return query
}

const getUniqueTokens = (vaultsQueryStore) => {
    return derived(vaultsQueryStore, ($vaultsQueryStore: any) => {
        let addresses = new Set()
        const tokenVaults = $vaultsQueryStore.data?.tokenVaults
        console.log({ tokenVaults }, { $vaultsQueryStore })
        if (tokenVaults) {
            tokenVaults.forEach(tokenVault => {
                addresses.add(tokenVault.token.id)
            });
            return [...addresses].map(address =>
                tokenVaults.find(tokenVault => address == tokenVault.token.id)
            )
        }
    })
}

const getVaultData = (vaultsQueryStore) => {
    return derived(vaultsQueryStore, ($vaultsQueryStore: any) => {
        return $vaultsQueryStore.data?.tokenVaults
    })
}

const reexecute = async (store) => {
    store.pause = true;
    await tick()
    store.pause = false;
}

// linking it all up
const onlyOwned = writable(true)
const owner = writable('')

const vaultsQueryStore = {
    ...derived([client, owner, onlyOwned], ([$client, $owner, $onlyOwned], set) => {
        const vaults = $onlyOwned ? getOwnedVaults($client, $owner) : getAllVaults($client)
        vaults.subscribe((value) => {
            set(value)
        })
    }),
    reexecute: () => { reexecute(vaults) }
}

const tokens = getUniqueTokens(vaultsQueryStore)
const vaults = getVaultData(vaultsQueryStore)

export const getVaults = () => {
    return { onlyOwned, owner, vaults, tokens, vaultsQueryStore }
}

