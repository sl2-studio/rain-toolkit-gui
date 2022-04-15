import { BigNumber, Contract, ethers, Signer } from "ethers";
import { SaleConfig, SaleRedeemableERC20Config, StateConfigStruct } from "../../types";
import { getNewChildFromReceipt, op, getERC20 } from "../../utils";
import SaleFactoryArtifact from "../../abis/SaleFactory.json";
import SaleArtifact from "../../abis/Sale.json";
import RedeemableERC20Artifact from "../../abis/RedeemableERC20.json";
import ReserveTokenArtifact from "../../abis/ReserveToken.json";
import { concat, parseUnits } from "ethers/lib/utils";
import { selectedNetwork } from "src/stores";
import { get } from "svelte/store";
import SaleProgress from "./SaleProgress.svelte";

export const enum Opcode {
  SKIP,
  VAL,
  DUP,
  ZIPMAP,
  BLOCK_NUMBER,
  BLOCK_TIMESTAMP,
  SENDER,
  IS_ZERO,
  EAGER_IF,
  EQUAL_TO,
  LESS_THAN,
  GREATER_THAN,
  EVERY,
  ANY,
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
  ERC20_BALANCE_OF,
  ERC20_TOTAL_SUPPLY,
  ERC721_BALANCE_OF,
  ERC721_OWNER_OF,
  ERC1155_BALANCE_OF,
  ERC1155_BALANCE_OF_BATCH,
  REMAINING_UNITS,
  TOTAL_RESERVE_IN,
  LAST_BUY_BLOCK,
  LAST_BUY_UNITS,
  LAST_BUY_PRICE,
  CURRENT_BUY_UNITS,
  TOKEN_ADDRESS,
  RESERVE_ADDRESS,
}

export type BuyConfig = {
  feeRecipient: string;
  fee: BigNumber;
  minimumUnits: BigNumber;
  desiredUnits: BigNumber;
  maximumPrice: BigNumber;
};

export interface SaleTokenData {
  id: string;
  token: {
    id: string,
    name: string,
    symbols: string,
    decimals: string,
  };
  reserve: {
    id: string,
    name: string,
    symbols: string,
    decimals: string,
  }
}

export const initSaleContracts = (saleData: SaleTokenData, signer: Signer) => {
  const sale = new ethers.Contract(saleData.id, SaleArtifact.abi, signer);
  const reserve = new ethers.Contract(saleData.reserve.id, ReserveTokenArtifact.abi, signer);
  const token = new ethers.Contract(saleData.token.id, ReserveTokenArtifact.abi, signer);
  return [sale, reserve, token];
};

export const saleDeploy = async (
  deployer: Signer,
  config: SaleConfig,
  saleRedeemableERC20Config: SaleRedeemableERC20Config,
  ...args
): Promise<Contract> => {

  const saleFactory = new ethers.Contract(
    get(selectedNetwork).addresses.SALE_FACTORY,
    SaleFactoryArtifact.abi,
    deployer
  );
  const txDeploy = await saleFactory.createChildTyped(
    config,
    saleRedeemableERC20Config,
    ...args
  );
  const receipt = await txDeploy.wait();

  return receipt;
};

export const afterBlockNumberConfig = (blockNumber) => {
  return {
    sources: [
      concat([
        op(Opcode.BLOCK_NUMBER),
        op(Opcode.VAL, 0),
        op(Opcode.GREATER_THAN),
      ]),
    ],
    constants: [blockNumber - 1],
    stackLength: 3,
    argumentsLength: 0,
  };
};

export const afterTimestampConfig = (timestamp) => {
  return {
    sources: [
      concat([
        op(Opcode.BLOCK_TIMESTAMP),
        op(Opcode.VAL, 0),
        op(Opcode.GREATER_THAN),
      ]),
    ],
    constants: [timestamp],
    stackLength: 3,
    argumentsLength: 0,
  };
};


export const afterExtraTimestampConfig = (endTimestamp, extraTimestamp, extraTimeAmount) => {
  return {
    sources: [
      concat([
        op(Opcode.BLOCK_TIMESTAMP),
        op(Opcode.VAL, 0),
        op(Opcode.GREATER_THAN),
        op(Opcode.TOTAL_RESERVE_IN),
        op(Opcode.VAL, 2),
        op(Opcode.LESS_THAN),
        op(Opcode.EVERY, 2),
        op(Opcode.BLOCK_TIMESTAMP),
        op(Opcode.VAL, 1),
        op(Opcode.GREATER_THAN),
        op(Opcode.ANY, 2),
      ]),
    ],
    constants: [endTimestamp, extraTimestamp, extraTimeAmount],
    stackLength: 15,
    argumentsLength: 0,
  };
};


export const getAfterTimestampDate = (stateConfig, i) => {
  if (stateConfig.sources[0] === "0x050001000b00" || 
      stateConfig.sources[0] === "0x050001000b00230001020a000c02050001010b000d02") {

    return new Date(parseInt(stateConfig.constants[i]) * 1000);
  }
};


export const getAfterTimestamp = (stateConfig, i) => {
  if (stateConfig.sources[0] === "0x050001000b00" || 
      stateConfig.sources[0] === "0x050001000b00230001020a000c02050001010b000d02") {

    return parseInt(stateConfig.constants[i]);
  }
};

export const saleStatuses = ["Pending", "Active", "Success", "Fail"];

export enum selectSale {
  fixedPrice,
  vFLO,
  increasingPrice,
};

export enum selectWalletCap {
  none,
  max,
  min,
  both,
};

const FIXED_PRICE_SOURCES = () => 
  concat([
    op(Opcode.VAL, 0),
  ]);

const vFLO_SOURCES = () => 
  concat([
    op(Opcode.TOTAL_RESERVE_IN),
    op(Opcode.VAL, 0),
    op(Opcode.ADD, 2),
    op(Opcode.VAL, 1),
    op(Opcode.BLOCK_TIMESTAMP),
    op(Opcode.VAL, 3),
    op(Opcode.SUB, 2),
    op(Opcode.VAL, 2),
    op(Opcode.MUL, 2),
    op(Opcode.SUB, 2),
    op(Opcode.VAL, 4),
    op(Opcode.MAX, 2),
    op(Opcode.MUL, 2),
    op(Opcode.REMAINING_UNITS),
    op(Opcode.DIV, 2),
  ]);

const INC_PRICE_SOURCES = () => 
  concat([
    op(Opcode.BLOCK_TIMESTAMP),
    op(Opcode.VAL, 4),
    op(Opcode.GREATER_THAN),
    op(Opcode.TOKEN_ADDRESS),
    op(Opcode.SENDER),
    op(Opcode.ERC20_BALANCE_OF),
    op(Opcode.VAL, 5),
    op(Opcode.GREATER_THAN),
    op(Opcode.VAL, 6),
    op(Opcode.VAL, 1),
    op(Opcode.EAGER_IF),
    op(Opcode.BLOCK_TIMESTAMP),
    op(Opcode.VAL, 3),
    op(Opcode.SUB, 2),
    op(Opcode.VAL, 2),
    op(Opcode.MUL, 2),
    op(Opcode.VAL, 0),
    op(Opcode.ADD, 2),
    op(Opcode.EAGER_IF),
  ]);

const MIN_CAP_SOURCES = (i) => 
  concat([
    op(Opcode.VAL, i),
    op(Opcode.CURRENT_BUY_UNITS),
    op(Opcode.TOKEN_ADDRESS),
    op(Opcode.SENDER),
    op(Opcode.ERC20_BALANCE_OF),
    op(Opcode.ADD, 2),
    op(Opcode.LESS_THAN),
  ]);

const MAX_CAP_SOURCES = (i) =>
  concat([
    op(Opcode.VAL, i),      
    op(Opcode.CURRENT_BUY_UNITS),
    op(Opcode.TOKEN_ADDRESS),
    op(Opcode.SENDER),
    op(Opcode.ERC20_BALANCE_OF),
    op(Opcode.ADD, 2),
    op(Opcode.GREATER_THAN),
  ]);

function saleSourcesSelector(saleType: number) {
 if ( saleType == 0 ) {
    return FIXED_PRICE_SOURCES();
 }
 else if ( saleType == 1 ) {
    return vFLO_SOURCES();
 }
 else if ( saleType == 2 ) {
    return INC_PRICE_SOURCES();
 };
};


function saleSourcesGenerator(saleType: number, walletCapType: number, i: number) {
  const CAP_CONDITION_SOURCES = (i) =>
   concat([
    op(Opcode.VAL, i),
    op(Opcode.EAGER_IF),
   ]);

  if ( walletCapType == 1 ) {
    const maxCapGeneratedSources = (i) => 
      concat([
        MAX_CAP_SOURCES(i),
        saleSourcesSelector(saleType),
        CAP_CONDITION_SOURCES(i+1)
      ]);
    return maxCapGeneratedSources(i);
  }
  else if ( walletCapType == 2 ) {
   const minCapGeneratedSources = (i) => 
      concat([
        MIN_CAP_SOURCES(i),
        saleSourcesSelector(saleType),
        CAP_CONDITION_SOURCES(i+1),
      ]);
    return minCapGeneratedSources(i);
  }
  else if ( walletCapType == 3 ) {
    const maxminCapGeneratedSources = (i) => 
      concat([
        MAX_CAP_SOURCES(i-1),
        MIN_CAP_SOURCES(i),
        op(Opcode.EVERY, 2),
        saleSourcesSelector(saleType),
        CAP_CONDITION_SOURCES(i+1)
      ]);
    return maxminCapGeneratedSources(i);
  }
  else {
    return saleSourcesSelector(saleType);
  }
};


function walletCapConstantsSelector(saleParams: any, walletCapType: number) {
  let _selectedWalletCapConstants;
  if ( walletCapType == 1) { 
    _selectedWalletCapConstants = [    
      parseUnits(saleParams.maxWalletCap.toString()).add(1),
      ethers.constants.MaxUint256
    ];
  }
  else if (walletCapType == 2) { 
    _selectedWalletCapConstants = [
      parseUnits(saleParams.minWalletCap.toString()).sub(1),
      ethers.constants.MaxUint256
    ];
  }
  else if (walletCapType == 3) { 
    _selectedWalletCapConstants = [
      parseUnits(saleParams.maxWalletCap.toString()).add(1),
      parseUnits(saleParams.minWalletCap.toString()).sub(1),
      ethers.constants.MaxUint256
    ];
  }
  return _selectedWalletCapConstants;
};


function saleConstantsGenerator(saleParams: any, saleType: number, walletCapType: number) {
  let _selectedSaleConstantsArr;

  if (saleType == 0) {
    _selectedSaleConstantsArr = [
      parseUnits(saleParams.startPrice.toString(),saleParams.reserveErc20.erc20decimals)
    ];
  }
  else if (saleType == 1) {
    let raiseDuration = saleParams.endTimestamp - saleParams.startTimestamp;
    let balanceReserve = saleParams.minimumRaise * 5;
    let initWeight = ( saleParams.initialSupply * saleParams.startPrice ) / balanceReserve;
    let weightChange = ((initWeight - 1) / raiseDuration);

    _selectedSaleConstantsArr = [
      parseUnits(balanceReserve.toString(),saleParams.reserveErc20.erc20decimals),
      parseUnits(initWeight.toString()),
      parseUnits(weightChange.toFixed(5).toString()),
      saleParams.startTimestamp,
      parseUnits(Number('1').toString())
    ];
  }
  else if (saleType == 2) {
    let raiseDuration =  saleParams.endTimestamp - saleParams.startTimestamp;
    let priceChange = ( saleParams.endPrice - saleParams.startPrice ) / raiseDuration;
    let discountedPrice = saleParams.endPrice * ((100 - saleParams.discount) / 100);

    _selectedSaleConstantsArr = [
      parseUnits(saleParams.startPrice.toString(),saleParams.reserveErc20.erc20decimals),
      parseUnits(saleParams.endPrice.toString(),saleParams.reserveErc20.erc20decimals),
      parseUnits(priceChange.toFixed(5).toString()),
      saleParams.startTimestamp,
      saleParams.endTimestamp,
      parseUnits(saleParams.discountThreshold.toString()),
      parseUnits(discountedPrice.toString(),saleParams.reserveErc20.erc20decimals)
    ];
  }
  const GeneratedSaleConstants = walletCapType == 0 ? 
    _selectedSaleConstantsArr :
    [..._selectedSaleConstantsArr,
     ...walletCapConstantsSelector(saleParams, walletCapType)];

  return GeneratedSaleConstants;
};


export const saleStateConfigGenerator = (
    saleParams: any,
    saleType: number,
    walletCapType: number,
    canEndType: boolean
  ):SaleConfig => {
    const ExtraTimeAmount = parseUnits(saleParams.extraTimeAmount.toString());   
    const constants = saleConstantsGenerator(saleParams, saleType, walletCapType);
    const sources = [saleSourcesGenerator(saleType, walletCapType, constants.length - 2)];
  return {
    canStartStateConfig: afterTimestampConfig(saleParams.startTimestamp),
      canEndStateConfig: canEndType ?
        afterExtraTimestampConfig(
          saleParams.endTimestamp, (saleParams.extraTime * 60) + saleParams.endTimestamp, ExtraTimeAmount) :
        afterTimestampConfig(saleParams.endTimestamp),
      calculatePriceStateConfig: {
        sources,
        constants,
        stackLength: (sources[0].length / 2) +5,
        argumentsLength: 0
      },
      recipient: saleParams.recipient,
      reserve: saleParams.reserve,
      cooldownDuration: parseInt(saleParams.cooldownDuration),
      minimumRaise: parseUnits(
        saleParams.minimumRaise.toString(),
        saleParams.reserveErc20.erc20decimals
        ),
      dustSize: 0,
  }  
};


export const saleRedeemableErc20ConfigGenerator = (saleParams: any): SaleRedeemableERC20Config => {
  return {
    erc20Config: {
      name: saleParams.name,
      symbol: saleParams.symbol,
      distributor: ethers.constants.AddressZero,
      initialSupply: parseUnits(saleParams.initialSupply.toString()),
    },
    tier: saleParams.tier,
    minimumTier: saleParams.minimumStatus,
    distributionEndForwardingAddress:
    saleParams.distributionEndForwardingAddress,
  }
};

