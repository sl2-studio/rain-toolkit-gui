import { ethers } from "ethers"
import ERC721BalanceTierAbi from '../../abis/ERC721BalanceTier.json'
import ERC20BalanceTierAbi from '../../abis/ERC20BalanceTier.json'
import ERC721Abi from '../../abis/ERC721.json'
import ERC20Abi from '../../abis/ReserveToken.json'
import { signer } from 'svelte-ethers-store'
import { get } from 'svelte/store'

export const initBalanceTier = async (address: string) => {
    let balanceTierContract,
        tierValues,
        errorMsg,
        erc20Contract,
        erc20Name,
        erc20Decimals,
        erc20Address,
        erc20Symbol

    // setting up the balance tier contract
    const _balanceTierContract = new ethers.Contract(
        address,
        ERC20BalanceTierAbi.abi,
    )
    balanceTierContract = _balanceTierContract.connect(get(signer))
    try {
        tierValues = await balanceTierContract.tierValues()
    } catch (error) {
        errorMsg = "Not a valid BalanceTier address"
        return
    }
    // setting up the erc20 contract
    const _erc20address = await balanceTierContract.erc20()
    const _erc20contract = new ethers.Contract(_erc20address, ERC20Abi.abi)
    erc20Contract = _erc20contract.connect(get(signer))
    erc20Name = await erc20Contract.name()
    erc20Decimals = await erc20Contract.decimals()
    erc20Address = erc20Contract.address
    erc20Symbol = await erc20Contract.symbol()

    return {
        balanceTierContract,
        tierValues,
        errorMsg,
        erc20Contract,
        erc20Name,
        erc20Decimals,
        erc20Address,
        erc20Symbol
    }
}