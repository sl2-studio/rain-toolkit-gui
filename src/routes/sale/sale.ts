import { BigNumber, Contract, ethers, Signer } from "ethers";
import { SaleConfig, SaleRedeemableERC20Config, StateConfigStruct, Tier } from "../../types";
import SaleFactoryArtifact from "../../abis/SaleFactory.json";
import SaleArtifact from "../../abis/Sale.json";
import RedeemableERC20Artifact from "../../abis/RedeemableERC20.json";
import ReserveTokenArtifact from "../../abis/ReserveToken.json";
import { concat, parseUnits } from "ethers/lib/utils";
import { selectedNetwork } from "src/stores";
import { get } from "svelte/store";
import SaleProgress from "./SaleProgress.svelte";
import { 
  getNewChildFromReceipt,
  op,
  selectLte,
  selectLteLogic,
  selectLteMode,
  tierRange,
  callSize,
  arg,
  paddedUInt256,
  paddedUInt32,
 } from "../../utils";

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
};

export enum selectSale {
  fixedPrice,
  vFLO,
  increasingPrice,
};

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

export type SaleParams = {
  inputValues: any;
  saleType: number;
  maxCapType: 0 | 1;
  minCapType: 0 | 1;
  canEndType: 0 | 1;
  extraTimeDiscountType: 0 | 1;
  tierDiscountType: 0 | 1;
  tierDiscountActType: 0 | 1;
  tierCapMulType: 0 | 1;
  tierCapMulActType: 0 | 1;
  creatorControlType: 0 | 1;
};

export const initSaleContracts = (saleData: SaleTokenData, signer: Signer) => {
  const sale = new ethers.Contract(saleData.id, SaleArtifact.abi, signer);
  const reserve = new ethers.Contract(saleData.reserve.id, ReserveTokenArtifact.abi, signer);
  const token = new ethers.Contract(saleData.token.id, ReserveTokenArtifact.abi, signer);
  return [sale, reserve, token];
};

export const saleDeploy = async (
  deployer: Signer,
  deployerAddress: string,
  config: SaleParams,
  ...args
): Promise<Contract> => {

  const saleFactory = new ethers.Contract(
    get(selectedNetwork).addresses.SALE_FACTORY,
    SaleFactoryArtifact.abi,
    deployer
  );
  const txDeploy = await saleFactory.createChildTyped(
    saleStateConfigGenerator(config, deployerAddress),
    saleRedeemableErc20ConfigGenerator(config),
    ...args
  );
  const receipt = await txDeploy.wait();

  return receipt;
};


const saleStateConfigGenerator = (saleParams : SaleParams, deployerAddress: string) : SaleConfig => {   
  const constants = saleConstantsGenerator(saleParams);
  const sources = saleSourcesGenerator(saleParams, constants.length);
  return {
    canStartStateConfig: canStartEndConfigGenerator(
      saleParams.inputValues.startTimestamp,
      0,
      saleParams,
      deployerAddress
    ),
    canEndStateConfig: canStartEndConfigGenerator(
      saleParams.inputValues.endTimestamp,
      saleParams.canEndType,
      saleParams,
      deployerAddress
    ),
    calculatePriceStateConfig: {
      sources,
      constants,
      stackLength: ((sources[0].length +sources[1].length + sources[2].length) / 2) + 5,
      argumentsLength: 
        saleParams.tierDiscountType + saleParams.tierCapMulType + ((saleParams.tierDiscountActType + saleParams.tierCapMulActType) * 2)
    },
    recipient: saleParams.inputValues.recipient,
    reserve: saleParams.inputValues.reserve,
    cooldownDuration: parseInt(saleParams.inputValues.cooldownDuration),
    minimumRaise: parseUnits(
      saleParams.inputValues.minimumRaise.toString(),
      saleParams.inputValues.reserveErc20.erc20decimals
      ),
    dustSize: 0,
  }
};

const saleRedeemableErc20ConfigGenerator = (saleParams: SaleParams): SaleRedeemableERC20Config => {
  return {
    erc20Config: {
      name: saleParams.inputValues.name,
      symbol: saleParams.inputValues.symbol,
      distributor: ethers.constants.AddressZero,
      initialSupply: parseUnits(saleParams.inputValues.initialSupply.toString()),
    },
    tier: saleParams.inputValues.tier,
    minimumTier: saleParams.inputValues.minimumStatus,
    distributionEndForwardingAddress:
    saleParams.inputValues.distributionEndForwardingAddress,
  }
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

const AFTER_TIMESTAMP = () =>
  concat([
    op(Opcode.BLOCK_TIMESTAMP),
    op(Opcode.VAL, 0),
    op(Opcode.GREATER_THAN),
  ]);

const EXTRA_TIME = () =>
  concat([
    op(Opcode.TOTAL_RESERVE_IN),
    op(Opcode.VAL, 2),
    op(Opcode.LESS_THAN),
    op(Opcode.EVERY, 2),
    op(Opcode.BLOCK_TIMESTAMP),
    op(Opcode.VAL, 1),
    op(Opcode.GREATER_THAN),
    op(Opcode.ANY, 2),
  ]);

const CREATOR_CONTROL = (i) =>
  concat([
    op(Opcode.SENDER),
    op(Opcode.VAL, i),
    op(Opcode.EQUAL_TO),
    op(Opcode.EVERY, 2),
  ])    

function canStartEndConfigGenerator(
  timestamp: number,
  canEndType: number,
  saleParams: SaleParams,
  deployerAddress: string) : StateConfigStruct {
    const ExtraTimeAmount = parseUnits(saleParams.inputValues.extraTimeAmount.toString());
    const ExtraTime = (saleParams.inputValues.extraTime * 60) + timestamp;
    let constants;
    let sources;
    if( canEndType && saleParams.creatorControlType) {
      constants = [timestamp, ExtraTime, ExtraTimeAmount, deployerAddress];
      sources = [concat([AFTER_TIMESTAMP(), EXTRA_TIME(), CREATOR_CONTROL(3)])];
    }
    else if (canEndType && !saleParams.creatorControlType) {
      constants = [timestamp, ExtraTime, ExtraTimeAmount];
      sources = [concat([AFTER_TIMESTAMP(), EXTRA_TIME()])];
    }
    else if (!canEndType && saleParams.creatorControlType) {
      constants = [timestamp, deployerAddress];
      sources = [concat([AFTER_TIMESTAMP(), CREATOR_CONTROL(1)])];
    }
    else if (!canEndType && !saleParams.creatorControlType) {
      constants = [timestamp];
      sources = [AFTER_TIMESTAMP()];
    }
  return {
    constants,
    sources,
    stackLength: (sources[0].length / 2) + 5,
    argumentsLength: 0
  }  
};


export const getAfterTimestampDate = (stateConfig, i) => {
  if (stateConfig.sources[0] === 
      "0x050001000b00" ||
      "0x050001000b000600010109000c02" ||
      "0x050001000b00230001020a000c02050001010b000d02" ||
      "0x050001000b00230001020a000c02050001010b000d020600010309000c02") {

    return new Date(parseInt(stateConfig.constants[i]) * 1000);
  }
};


export const getAfterTimestamp = (stateConfig, i) => {
  if (stateConfig.sources[0] === 
      "0x050001000b00" ||
      "0x050001000b000600010109000c02" || 
      "0x050001000b00230001020a000c02050001010b000d02" ||
      "0x050001000b00230001020a000c02050001010b000d020600010309000c02") {

    return parseInt(stateConfig.constants[i]);
  }
};

export const saleStatuses = ["Pending", "Active", "Success", "Fail"];


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
    op(Opcode.VAL, 3),
    op(Opcode.SUB, 2),
    op(Opcode.VAL, 2),
    op(Opcode.MUL, 2),
    op(Opcode.VAL, 0),
    op(Opcode.ADD, 2),
    op(Opcode.VAL, 1),
    op(Opcode.MIN, 2),
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

const MAX_CAP_SOURCES = () =>
  concat([     
    op(Opcode.CURRENT_BUY_UNITS),
    op(Opcode.TOKEN_ADDRESS),
    op(Opcode.SENDER),
    op(Opcode.ERC20_BALANCE_OF),
    op(Opcode.ADD, 2),
    op(Opcode.GREATER_THAN),
  ]);

const EXTRA_TIME_DISCOUNT = (i) =>
  concat([
    op(Opcode.VAL, i-4),
    op(Opcode.BLOCK_TIMESTAMP),
    op(Opcode.GREATER_THAN),
    op(Opcode.VAL, i-3),
    op(Opcode.TOKEN_ADDRESS),
    op(Opcode.SENDER),
    op(Opcode.ERC20_BALANCE_OF),
    op(Opcode.GREATER_THAN),
    op(Opcode.ANY, 2),
  ]);

const TIER_DISCOUNTS = (i, valSize) => [
  op(Opcode.NEVER),
  op(Opcode.VAL, i-1),
  op(Opcode.UPDATE_BLOCKS_FOR_TIER_RANGE,tierRange(Tier.ZERO, Tier.EIGHT)),
  op(Opcode.VAL, i-2),
  op(Opcode.VAL, i-3),
  op(Opcode.SENDER),
  op(Opcode.REPORT),
  op(Opcode.BLOCK_NUMBER),
  op(Opcode.SELECT_LTE, selectLte(selectLteLogic.every, selectLteMode.first, 2)),
  op(Opcode.SATURATING_DIFF),
  op(Opcode.ZIPMAP, callSize(1, 3, valSize)),
  op(Opcode.MIN, 8),
  op(Opcode.MUL, 2),
  op(Opcode.VAL, i-1),
  op(Opcode.DIV, 2)
];

const TIER_CAP_MULTIPLIER = (i, valSize) => [
    op(Opcode.VAL, i-2),
    op(Opcode.VAL, i-6),
    op(Opcode.VAL, i-7),
    op(Opcode.SENDER),
    op(Opcode.REPORT),
    op(Opcode.BLOCK_NUMBER),
    op(Opcode.SELECT_LTE, selectLte(selectLteLogic.every, selectLteMode.first, 2)),
    op(Opcode.ZIPMAP, callSize(2, 3, valSize)),
    op(Opcode.MAX, 8),
    op(Opcode.MUL, 2),
    op(Opcode.VAL, i-5),
    op(Opcode.DIV, 2),
    op(Opcode.VAL, i-4),
    op(Opcode.ADD, 2),
  ];

const TIER_DISCOUNTS_FN = (i) =>
  concat([
    op(Opcode.VAL, i-1),
    op(Opcode.VAL, arg(0)),
    op(Opcode.SUB, 2),
  ]);  

const TIER_CAP_MULTIPLIER_FN = (i) =>
  concat([
    op(Opcode.VAL, arg(0)),
    op(Opcode.VAL, i-3),
    op(Opcode.LESS_THAN),
    op(Opcode.VAL, arg(0)),
    op(Opcode.VAL, i-5),
    op(Opcode.EAGER_IF),
  ]);

  const TIER_PERK_ACTIVATION = (i) =>
  concat([
    op(Opcode.NEVER),
    op(Opcode.BLOCK_NUMBER),
    op(Opcode.UPDATE_BLOCKS_FOR_TIER_RANGE,tierRange(Tier.ZERO, Tier.EIGHT)),
    op(Opcode.VAL, i-3),
    op(Opcode.SENDER),
    op(Opcode.REPORT),
    op(Opcode.SATURATING_DIFF),
    op(Opcode.VAL, i-4),
  ]);

const TIER_PERK_ACTIVATION_FN = (i) =>
  concat([
    op(Opcode.VAL, arg(1)),
    op(Opcode.VAL, arg(2)),
    op(Opcode.LESS_THAN),
    op(Opcode.VAL, i-1),
  ]);


function saleSourcesSelector(saleType: number) {
  if (saleType == 0) {
    return FIXED_PRICE_SOURCES();
  }
  else if (saleType == 1) {
    return vFLO_SOURCES();
  }
  else if (saleType == 2) {
    return INC_PRICE_SOURCES();
  };
};

function exTimeDiscountSources(saleParams: SaleParams, i: number) { 
  const DISCOUNT_CONDITION_SOURCES = (i) =>
    concat([
      op(Opcode.VAL, i-2),
      op(Opcode.MUL, 2),
      op(Opcode.VAL, i-1),
      op(Opcode.DIV, 2),
      op(Opcode.EAGER_IF),
    ]); 
  if (saleParams.canEndType && saleParams.extraTimeDiscountType) {
    let j = saleParams.maxCapType || saleParams.minCapType ? 2 : 1;
    return concat([
      EXTRA_TIME_DISCOUNT(i),
      saleSourcesSelector(saleParams.saleType),
      op(Opcode.DUP, j),
      DISCOUNT_CONDITION_SOURCES(i),
    ]);
  }
  else return saleSourcesSelector(saleParams.saleType);
};


function tierDiscountSources(saleParams: SaleParams, i: number) {
  if (saleParams.tierDiscountType) {
    if (saleParams.tierDiscountActType) {
      const _withActivation = TIER_DISCOUNTS(i, 2);
      _withActivation.splice(10, 0, TIER_PERK_ACTIVATION(i));
      return [
        concat([
          exTimeDiscountSources(saleParams, i-4),
          concat(_withActivation),
        ]),
        concat([
          TIER_PERK_ACTIVATION_FN(i),
          TIER_DISCOUNTS_FN(i),
          op(Opcode.EAGER_IF),
        ])
      ]; 
    }
    else return [
      concat([
        exTimeDiscountSources(saleParams, i-3),
        concat(TIER_DISCOUNTS(i, 0)),
      ]),
      TIER_DISCOUNTS_FN(i),
    ];
  }
  else return [exTimeDiscountSources(saleParams, i), concat([])];
};


function tierCapMulSources(saleParams: SaleParams, i: number) {
  if(saleParams.tierCapMulType) {
    if(saleParams.tierCapMulActType) {
      const _withActivation = TIER_CAP_MULTIPLIER(i, 2);
      _withActivation.splice(7, 0, TIER_PERK_ACTIVATION(i-4))
      return [
        concat([
          concat(_withActivation),
          MAX_CAP_SOURCES(),
        ]),
        concat([
          TIER_PERK_ACTIVATION_FN(i-4),
          TIER_CAP_MULTIPLIER_FN(i),
          op(Opcode.EAGER_IF)
        ])
      ]; 
    }   
    else return [
      concat([
        concat(TIER_CAP_MULTIPLIER(i, 0)),
        MAX_CAP_SOURCES(),
      ]),
      TIER_CAP_MULTIPLIER_FN(i),
    ];
  }
  else return [
    concat([
      op(Opcode.VAL, i-2),
      MAX_CAP_SOURCES()
    ]),
    concat([])
  ];
};


function saleSourcesGenerator(saleParams: SaleParams, i: number) {
  let j = i - 2 - ((saleParams.tierCapMulType * 5) + saleParams.tierCapMulActType);
  const CAP_CONDITION_SOURCES = (i) =>
    concat([
      op(Opcode.VAL, i),
      op(Opcode.EAGER_IF),
    ]);
  if (saleParams.maxCapType && !saleParams.minCapType) { 
    return [
      concat([
        tierCapMulSources(saleParams, i)[0],
        tierDiscountSources(saleParams, j)[0],  
        CAP_CONDITION_SOURCES(i-1)
      ]),
      tierDiscountSources(saleParams, j)[1],
      tierCapMulSources(saleParams, i)[1],
    ];
  }
  else if (!saleParams.maxCapType&& saleParams.minCapType) {
    return [
      concat([
        MIN_CAP_SOURCES(i-2),
        tierDiscountSources(saleParams, i-2)[0],
        CAP_CONDITION_SOURCES(i-1),
      ]),
      tierDiscountSources(saleParams, i-2)[1]
    ];
  }
  else if (saleParams.maxCapType && saleParams.minCapType) {
    return [
      concat([
        tierCapMulSources(saleParams, i-1)[0],
        MIN_CAP_SOURCES(i-1),
        op(Opcode.EVERY, 2),
        tierDiscountSources(saleParams, j-1)[0],
        CAP_CONDITION_SOURCES(i-2)
      ]),
      tierDiscountSources(saleParams, j-1)[1],
      tierCapMulSources(saleParams, i-1)[1],
    ];  
  }
  else return tierDiscountSources(saleParams, i);
};


function saleConstantsSelector (inputValues, saleType) {
  if (saleType == 0) {
    return [
      parseUnits(inputValues.startPrice.toString(),inputValues.reserveErc20.erc20decimals)
    ];
  }
  else if (saleType == 1) {
    let raiseDuration = inputValues.endTimestamp - inputValues.startTimestamp;
    let balanceReserve = inputValues.minimumRaise * 5;
    let initWeight = ( inputValues.initialSupply * inputValues.startPrice ) / balanceReserve;
    let weightChange = ((initWeight - 1) / raiseDuration);
    return [
      parseUnits(balanceReserve.toString(),inputValues.reserveErc20.erc20decimals),
      parseUnits(initWeight.toString()),
      parseUnits(weightChange.toFixed(5).toString()),
      inputValues.startTimestamp,
      parseUnits(Number('1').toString())
    ];
  }
  else if (saleType == 2) {
    let raiseDuration =  inputValues.endTimestamp - inputValues.startTimestamp;
    let priceChange = ( inputValues.endPrice - inputValues.startPrice ) / raiseDuration;
    return [
      parseUnits(inputValues.startPrice.toString(),inputValues.reserveErc20.erc20decimals),
      parseUnits(inputValues.endPrice.toString(),inputValues.reserveErc20.erc20decimals),
      parseUnits(priceChange.toFixed(5).toString()),
      inputValues.startTimestamp,
    ];
  }
};


function exTimeDiscountConstants(saleParams: SaleParams) {
  if (saleParams.canEndType && saleParams.extraTimeDiscountType) {
    return [
      ...saleConstantsSelector(saleParams.inputValues, saleParams.saleType),
      saleParams.inputValues.endTimestamp,
      parseUnits(saleParams.inputValues.extraTimeDiscountThreshold.toString()),
      100 - saleParams.inputValues.extraTimeDiscount,
      100
    ];
  }
  else return saleConstantsSelector(saleParams.inputValues, saleParams.saleType);
};


function tierDiscountConstants(saleParams: SaleParams) {
  if (saleParams.tierDiscountType) {
    const TierDiscount = paddedUInt256(
      ethers.BigNumber.from(
        "0x" +
        paddedUInt32(100 - saleParams.inputValues.discountTier8) +
        paddedUInt32(100 - saleParams.inputValues.discountTier7) +
        paddedUInt32(100 - saleParams.inputValues.discountTier6) +
        paddedUInt32(100 - saleParams.inputValues.discountTier5) +
        paddedUInt32(100 - saleParams.inputValues.discountTier5) +
        paddedUInt32(100 - saleParams.inputValues.discountTier3) +
        paddedUInt32(100 - saleParams.inputValues.discountTier2) +
        paddedUInt32(100 - saleParams.inputValues.discountTier1)
      )
    );
    if (saleParams.tierDiscountActType) {
      return [
        ...exTimeDiscountConstants(saleParams),
        paddedUInt256(
          ethers.BigNumber.from(
            "0x" + 
            paddedUInt32(saleParams.inputValues.discountActTier8 * 43200) +
            paddedUInt32(saleParams.inputValues.discountActTier7 * 43200) +
            paddedUInt32(saleParams.inputValues.discountActTier6 * 43200) +
            paddedUInt32(saleParams.inputValues.discountActTier5 * 43200) +
            paddedUInt32(saleParams.inputValues.discountActTier4 * 43200) +
            paddedUInt32(saleParams.inputValues.discountActTier3 * 43200) +
            paddedUInt32(saleParams.inputValues.discountActTier2 * 43200) +
            paddedUInt32(saleParams.inputValues.discountActTier1 * 43200)
          )
        ),
        saleParams.inputValues.tierDiscountAddress,
        TierDiscount,
        "100",
      ];
    }  
    else return [
      ...exTimeDiscountConstants(saleParams),
      saleParams.inputValues.tierDiscountAddress,
      TierDiscount,
      "100",
    ];
  }
  else return exTimeDiscountConstants(saleParams); 
};


function capMulConstants(saleParams: SaleParams) {
  if (saleParams.tierCapMulType) {
    const TierCapMultiplier = paddedUInt256(
      ethers.BigNumber.from(
        "0x" + 
        paddedUInt32(saleParams.inputValues.capMulTier8 * 100) +
        paddedUInt32(saleParams.inputValues.capMulTier7 * 100) +
        paddedUInt32(saleParams.inputValues.capMulTier6 * 100) +
        paddedUInt32(saleParams.inputValues.capMulTier5 * 100) +
        paddedUInt32(saleParams.inputValues.capMulTier4 * 100) +
        paddedUInt32(saleParams.inputValues.capMulTier3 * 100) +
        paddedUInt32(saleParams.inputValues.capMulTier2 * 100) +
        paddedUInt32(saleParams.inputValues.capMulTier1 * 100)
      )
    )
    if (saleParams.tierCapMulActType) {
      return [ 
        ...tierDiscountConstants(saleParams),
        paddedUInt256(
          ethers.BigNumber.from(
            "0x" + 
            paddedUInt32(saleParams.inputValues.capMulActTier8 * 43200) +
            paddedUInt32(saleParams.inputValues.capMulActTier7 * 43200) +
            paddedUInt32(saleParams.inputValues.capMulActTier6 * 43200) +
            paddedUInt32(saleParams.inputValues.capMulActTier5 * 43200) +
            paddedUInt32(saleParams.inputValues.capMulActTier4 * 43200) +
            paddedUInt32(saleParams.inputValues.capMulActTier3 * 43200) +
            paddedUInt32(saleParams.inputValues.capMulActTier2 * 43200) +
            paddedUInt32(saleParams.inputValues.capMulActTier1 * 43200)
          )
        ),
        saleParams.inputValues.tierCapMulAddress,
        TierCapMultiplier,
        "100",
        "1",
        "0xffffffff",
        parseUnits(saleParams.inputValues.maxWalletCap.toString()),
        ethers.constants.MaxUint256
      ];
    }
    else return [ 
      ...tierDiscountConstants(saleParams),
      saleParams.inputValues.tierCapMulAddress,
      TierCapMultiplier,
      "100",
      "1",
      "0xffffffff",
      parseUnits(saleParams.inputValues.maxWalletCap.toString()),
      ethers.constants.MaxUint256
    ];  
  }
  else return [
    ...tierDiscountConstants(saleParams),
    parseUnits(saleParams.inputValues.maxWalletCap.toString()).add(1),
    ethers.constants.MaxUint256
  ];
};


function saleConstantsGenerator(saleParams: SaleParams) {
  if (saleParams.maxCapType && !saleParams.minCapType) {
    return capMulConstants(saleParams);  
  }
  else if (!saleParams.maxCapType && saleParams.minCapType) { 
    return [
      ...tierDiscountConstants(saleParams),
      parseUnits(saleParams.inputValues.minWalletCap.toString()).sub(1),
      ethers.constants.MaxUint256
    ];
  }
  else if (saleParams.maxCapType && saleParams.minCapType) { 
    return [
      ...capMulConstants(saleParams),
      parseUnits(saleParams.inputValues.minWalletCap.toString()).sub(1),
    ]; 
  }
  else return tierDiscountConstants(saleParams);
};
