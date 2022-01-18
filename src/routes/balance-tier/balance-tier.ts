import { ethers } from "ethers"
import BalanceTierAbi from '../../abis/ERC721BalanceTier.json'
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
        BalanceTierAbi.abi,
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
        BalanceTierAbi.abi,
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