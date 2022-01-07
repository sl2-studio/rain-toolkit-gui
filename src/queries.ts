import { CHAIN_ID, COVALENT_KEY } from "./constants"
import { provider } from 'svelte-ethers-store'
import { get } from 'svelte/store'
import { ethers } from "ethers"

export const getLogs = async (address, startingBlock, endingBlock) => {
    startingBlock ??= await get(provider).getBlockNumber() - 999000
    endingBlock ??= 'latest'
    const response = fetch(
        `https://api.covalenthq.com/v1/${CHAIN_ID}/events/address/${address}/?format=JSON&starting-block=${startingBlock}&ending-block=${endingBlock}&key=${COVALENT_KEY}`
    )
    const data = await (await response).json()
    return data.data.items
}

export const decodeLogs = async (logs, topicHash, signature) => {
    logs = logs.filter(log => {
        return log.raw_log_topics[0] == topicHash
    })
    return await Promise.all(logs.map(async log => {
        console.log(log)
        const tx = await get(provider).getTransaction(log.tx_hash)
        console.log(tx)
        return {
            event: ethers.utils.defaultAbiCoder.decode(signature, log.raw_log_data),
            from: tx.from,
            time: log.block_signed_at
        }
    }))
}