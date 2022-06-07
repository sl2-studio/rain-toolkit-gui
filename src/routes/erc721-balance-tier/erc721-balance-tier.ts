import { signer, signerAddress } from "svelte-ethers-store";
import { get } from "svelte/store";
import { ERC721BalanceTier } from "rain-sdk";

export const init721BalanceTier = async (address: string) => {
  let balanceTierContract,
    tierValues,
    errorMsg,
    erc721Contract,
    erc721Name,
    erc721Symbol,
    erc721Address;

  // @TODO remove the signerAddress for these calls once SDK updated
  // setting up the balance tier contract
  const _balanceTierContract = new ERC721BalanceTier(address, signerAddress, signer);

  balanceTierContract = _balanceTierContract.connect(get(signer));
  try {
    tierValues = await balanceTierContract.tierValues();
  } catch (error) {
    errorMsg = "Not a valid BalanceTier address";
    return;
  }
  // setting up the erc20 contract
  const _erc721address = await balanceTierContract.erc721();
  const _erc721contract = new ERC721BalanceTier(_erc721address, signerAddress, signer);
  erc721Contract = _erc721contract.connect(get(signer));
  erc721Name = await erc721Contract.name();
  erc721Address = erc721Contract.address;
  erc721Symbol = await erc721Contract.symbol();

  return {
    balanceTierContract,
    tierValues,
    errorMsg,
    erc721Contract,
    erc721Name,
    erc721Address,
    erc721Symbol,
  };
};
