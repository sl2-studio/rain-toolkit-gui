import { BigNumber, Contract, ethers, Signer } from "ethers";
import { SaleConfig, SaleRedeemableERC20Config } from "../../types";
import { getERC20, getNewChildFromReceipt } from "../../utils";
import SaleFactoryArtifact from '../../abis/SaleFactory.json'
import SaleArtifact from '../../abis/Sale.json'
import { SALE_FACTORY } from "../../constants";
import RedeemableERC20Artifact from '../../abis/RedeemableERC20.json'
import ReserveTokenArtifact from '../../abis/ReserveToken.json'

export const enum Opcode {
  SKIP,
  VAL,
  ZIPMAP,
  BLOCK_NUMBER,
  SENDER,
  ADD,
  SUB,
  MUL,
  DIV,
  MOD,
  POW,
  MIN,
  MAX,
  REPORT,
  NEVER,
  ALWAYS,
  SATURATING_DIFF,
  UPDATE_BLOCKS_FOR_TIER_RANGE,
  SELECT_LTE,
  REMAINING_UNITS,
  TOTAL_RESERVE_IN,
  LAST_RESERVE_IN,
  LAST_BUY_BLOCK,
  LAST_BUY_UNITS,
  LAST_BUY_PRICE,
  CURRENT_BUY_UNITS
}

export type BuyConfig = {
  feeRecipient: string
  fee: BigNumber
  minimumUnits: BigNumber
  desiredUnits: BigNumber
  maximumPrice: BigNumber
}

export const initSaleContract = async (
  signer: Signer,
  address: string
) => {
  const sale = new ethers.Contract(address, SaleArtifact.abi, signer)
  const reserve = await getERC20(await sale.reserve(), signer)
  const token = await getERC20(await sale.token(), signer)
  return [sale, reserve, token]
}

export const saleDeploy = async (
  deployer: Signer,
  config: SaleConfig,
  saleRedeemableERC20Config: SaleRedeemableERC20Config,
  ...args
): Promise<[Contract, any]> => {
  console.log(config)
  console.log(saleRedeemableERC20Config)
  console.log(config.vmStateConfig.constants[0].toString())
  const saleFactory = new ethers.Contract(SALE_FACTORY, SaleFactoryArtifact.abi, deployer)
  const txDeploy = await saleFactory.createChildTyped(
    config,
    saleRedeemableERC20Config,
    ...args
  );
  const receipt = await txDeploy.wait()
  const saleContractAddress = getNewChildFromReceipt(receipt, saleFactory)
  const sale = new ethers.Contract(
    saleContractAddress,
    SaleArtifact.abi,
    deployer
  ) as Contract;

  if (!ethers.utils.isAddress(sale.address)) {
    throw new Error(
      `invalid sale address: ${sale.address} (${sale.address.length} chars)`
    );
  }

  await sale.deployed();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  sale.deployTransaction = txDeploy;

  const token = new ethers.Contract(await sale.token(), RedeemableERC20Artifact.abi, deployer) as Contract;

  return [sale, token];
};