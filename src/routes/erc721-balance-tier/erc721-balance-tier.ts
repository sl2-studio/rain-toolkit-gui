import { ethers } from "ethers"
import ERC721BalanceTierAbi from '../../abis/ERC721BalanceTier.json'
import ERC20BalanceTierAbi from '../../abis/ERC20BalanceTier.json'
import ERC721Abi from '../../abis/ERC721.json'
import ERC20Abi from '../../abis/ReserveToken.json'
import { signer } from 'svelte-ethers-store'
import { get } from 'svelte/store'

export const init721BalanceTier = async (address : string) => {
    let balanceTierContract,
        tierValues,
        errorMsg,
        erc721Contract,
        erc721Name,
        erc721Symbol,
        erc721Address

    // setting up the balance tier contract
    const _balanceTierContract = new ethers.Contract(
        address,
        ERC721BalanceTierAbi.abi,
    )
    balanceTierContract = _balanceTierContract.connect(get(signer))
    try {
        tierValues = await balanceTierContract.tierValues()
    } catch (error) {
        errorMsg = "Not a valid BalanceTier address"
        return
    }
    // setting up the erc20 contract
    const _erc721address = await balanceTierContract.erc721()
    const _erc721contract = new ethers.Contract(_erc721address, ERC721Abi.abi)
    erc721Contract = _erc721contract.connect(get(signer))
    erc721Name = await erc721Contract.name()
    erc721Address = erc721Contract.address
    erc721Symbol = await erc721Contract.symbol()

    return {
        balanceTierContract,
        tierValues,
        errorMsg,
        erc721Contract,
        erc721Name,
        erc721Address,
        erc721Symbol
    }
}