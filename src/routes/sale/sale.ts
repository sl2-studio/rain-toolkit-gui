import { ethers, Signer } from "ethers";;
import { parseUnits } from "ethers/lib/utils";
import {
  Sale,
  PriceCurve,
  FixedPrice,
  vLBP,
  IncreasingPrice,
  SaleDurationInTimestamp
} from 'rain-sdk'
import { HumanFriendlySource } from 'rain-sdk'


export enum selectSale {
  fixedPrice,
  vLBP,
  increasingPrice,
};

export type SaleParams = {
  inputValues: any;
  saleType: number;
  maxCapMode: boolean;
  minCapMode: boolean;
  canEndMode: boolean;
  extraTimeDiscountMode: boolean;
  tierDiscountMode: boolean;
  tierDiscountActMode: boolean;
  tierCapMulMode: boolean;
  tierCapMulActMode: boolean;
  creatorControlMode: boolean;
};

export const getAfterTimestampDate = (stateConfig, i) => {
  if (stateConfig.sources[0] ===
    "0x0100" ||
    "0x060001001f00" ||
    "0x010107001d00060001001f0001021c00" ||
    "0x060001001f002f0001021e002002060001011f002102" ||
    "0x010307001d00060001001f002f0001021e002002060001011f00210201041c00") {

    return new Date(parseInt(stateConfig.constants[i]) * 1000);
  }
};


export const getAfterTimestamp = (stateConfig, i) => {
  if (stateConfig.sources[0] ===
    "0x0100" ||
    "0x060001001f00" ||
    "0x010107001d00060001001f0001021c00" ||
    "0x060001001f002f0001021e002002060001011f002102" ||
    "0x010307001d00060001001f002f0001021e002002060001011f00210201041c00") {

    return parseInt(stateConfig.constants[i]);
  }
};

export const saleStatuses = ["Pending", "Active", "Success", "Fail"];


export function canEndConfig(config: SaleParams, deployerAddress: string) {

  const _saleTime_ = new SaleDurationInTimestamp(config.inputValues.endTimestamp)

  if (config.extraTimeDiscountMode) {
    _saleTime_.applyExtraTime(
      config.inputValues.extraTime,
      config.inputValues.extraTimeAmount
    )
    if (config.creatorControlMode) {
      _saleTime_.applyOwnership(deployerAddress)
    }
  }
  else {
    if (config.creatorControlMode && config.canEndMode) {
      _saleTime_.applyExtraTime(
        config.inputValues.extraTime,
        config.inputValues.extraTimeAmount
      )
        .applyOwnership(deployerAddress)
    }
    if (!config.creatorControlMode && config.canEndMode) {
      _saleTime_.applyExtraTime(
        config.inputValues.extraTime,
        config.inputValues.extraTimeAmount
      )
    }
  }
  return _saleTime_;
}


export function calculatePriceConfig(config: SaleParams) {

  const saleSelector = (): PriceCurve => {

    //if sale is a Fixed Price
    if (config.saleType == selectSale.fixedPrice) {
      return new FixedPrice(
        config.inputValues.startPrice
      )
    }

    //if sale is a vLBP
    if (config.saleType == selectSale.vLBP) {
      return new vLBP(
        config.inputValues.startPrice,
        config.inputValues.startTimestamp,
        config.inputValues.endTimestamp,
        config.inputValues.minimumRaise,
        config.inputValues.initialSupply
      )
    }

    //if sale is a Linear Increasing Price
    if (config.saleType == selectSale.increasingPrice) {
      return new IncreasingPrice(
        config.inputValues.startPrice,
        config.inputValues.endPrice,
        config.inputValues.startTimestamp,
        config.inputValues.endTimestamp
      )
    }
  }

  //creating the sale PriceCurve instance
  const _sale_: PriceCurve = saleSelector();
  console.log("saleSelector", _sale_);

  //if extra time discount is enabled
  if (config.extraTimeDiscountMode) {
    _sale_.applyExtraTimeDiscount(
      config.inputValues.endTimestamp,
      config.inputValues.extraTimeDiscountThreshold,
      config.inputValues.extraTimeDiscount
    )
  }
  console.log("after extra time dis", _sale_);

  //if tier Discount is enabled
  if (config.tierDiscountMode) {
    //if tierActivation is enabled
    if (config.tierDiscountActMode) {
      _sale_.applyTierDiscount(
        config.inputValues.tierDiscountAddress,
        [
          config.inputValues.discountTier1,
          config.inputValues.discountTier2,
          config.inputValues.discountTier3,
          config.inputValues.discountTier4,
          config.inputValues.discountTier5,
          config.inputValues.discountTier6,
          config.inputValues.discountTier7,
          config.inputValues.discountTier8
        ],
        [
          config.inputValues.discountActTier1,
          config.inputValues.discountActTier2,
          config.inputValues.discountActTier3,
          config.inputValues.discountActTier4,
          config.inputValues.discountActTier5,
          config.inputValues.discountActTier6,
          config.inputValues.discountActTier7,
          config.inputValues.discountActTier8
        ]
      )
    }
    else {
      _sale_.applyTierDiscount(
        config.inputValues.tierDiscountAddress,
        [
          config.inputValues.discountTier1,
          config.inputValues.discountTier2,
          config.inputValues.discountTier3,
          config.inputValues.discountTier4,
          config.inputValues.discountTier5,
          config.inputValues.discountTier6,
          config.inputValues.discountTier7,
          config.inputValues.discountTier8
        ]
      )
    }
  }
  console.log("hii before max & min cap", _sale_);
  //if both Min and Max Cap Per Wallet are enabled
  if (config.maxCapMode && config.minCapMode) {
    //if Max cap tier Multiplier is enabled
    if (config.tierCapMulMode) {
      //if tierActivation is enabled
      if (config.tierCapMulActMode) {
        _sale_.applyWalletCap(
          2,
          {
            maxWalletCap: config.inputValues.maxWalletCap,
            minWalletCap: config.inputValues.minWalletCap,
            tierMultiplierMode: true,
            tierAddress: config.inputValues.tierCapMulAddress,
            tierMultiplier: [
              config.inputValues.capMulTier1,
              config.inputValues.capMulTier2,
              config.inputValues.capMulTier3,
              config.inputValues.capMulTier4,
              config.inputValues.capMulTier5,
              config.inputValues.capMulTier6,
              config.inputValues.capMulTier7,
              config.inputValues.capMulTier8
            ],
            tierActivation: [
              config.inputValues.capMulActTier1,
              config.inputValues.capMulActTier2,
              config.inputValues.capMulActTier3,
              config.inputValues.capMulActTier4,
              config.inputValues.capMulActTier5,
              config.inputValues.capMulActTier6,
              config.inputValues.capMulActTier7,
              config.inputValues.capMulActTier8
            ]
          }
        )
      }
      else {
        _sale_.applyWalletCap(
          2,
          {
            maxWalletCap: config.inputValues.maxWalletCap,
            minWalletCap: config.inputValues.minWalletCap,
            tierMultiplierMode: true,
            tierAddress: config.inputValues.tierCapMulAddress,
            tierMultiplier: [
              config.inputValues.capMulTier1,
              config.inputValues.capMulTier2,
              config.inputValues.capMulTier3,
              config.inputValues.capMulTier4,
              config.inputValues.capMulTier5,
              config.inputValues.capMulTier6,
              config.inputValues.capMulTier7,
              config.inputValues.capMulTier8
            ]
          }
        )
      }
    }
    else {
      _sale_.applyWalletCap(
        2,
        {
          maxWalletCap: config.inputValues.maxWalletCap,
          minWalletCap: config.inputValues.minWalletCap,
        }
      )
    }
  }

  console.log("hii before max cap", _sale_);
  //if only Max cap per wallet is enabled
  if (config.maxCapMode && !config.minCapMode) {
    //if tier Multiplier is enabled
    if (config.tierCapMulMode) {
      //if tierActivation is enabled
      if (config.tierCapMulActMode) {
        _sale_.applyWalletCap(
          1,
          {
            maxWalletCap: config.inputValues.maxWalletCap,
            tierMultiplierMode: true,
            tierAddress: config.inputValues.tierCapMulAddress,
            tierMultiplier: [
              config.inputValues.capMulTier1,
              config.inputValues.capMulTier2,
              config.inputValues.capMulTier3,
              config.inputValues.capMulTier4,
              config.inputValues.capMulTier5,
              config.inputValues.capMulTier6,
              config.inputValues.capMulTier7,
              config.inputValues.capMulTier8
            ],
            tierActivation: [
              config.inputValues.capMulActTier1,
              config.inputValues.capMulActTier2,
              config.inputValues.capMulActTier3,
              config.inputValues.capMulActTier4,
              config.inputValues.capMulActTier5,
              config.inputValues.capMulActTier6,
              config.inputValues.capMulActTier7,
              config.inputValues.capMulActTier8
            ]
          }
        )
      }
      else {
        _sale_.applyWalletCap(
          1,
          {
            maxWalletCap: config.inputValues.maxWalletCap,
            tierMultiplierMode: true,
            tierAddress: config.inputValues.tierCapMulAddress,
            tierMultiplier: [
              config.inputValues.capMulTier1,
              config.inputValues.capMulTier2,
              config.inputValues.capMulTier3,
              config.inputValues.capMulTier4,
              config.inputValues.capMulTier5,
              config.inputValues.capMulTier6,
              config.inputValues.capMulTier7,
              config.inputValues.capMulTier8
            ]
          }
        )
      }
    }
    else {
      _sale_.applyWalletCap(
        1,
        { maxWalletCap: config.inputValues.maxWalletCap }
      )
    }
  }

  console.log("hii after max cap", _sale_);

  //if only Min Cap Per Wallet is enabled
  if (!config.maxCapMode && config.minCapMode) {
    _sale_.applyWalletCap(
      0,
      { minWalletCap: config.inputValues.minWalletCap }
    )
  }

  return _sale_;

}

export const canStartConfig = (deployerAddress: string, config) => {
  const canStartStateConfig = config.creatorControlMode
    ? new SaleDurationInTimestamp(config.inputValues.startTimestamp).applyOwnership(deployerAddress)
    : new SaleDurationInTimestamp(config.inputValues.startTimestamp);

  return HumanFriendlySource.get(canStartStateConfig)
  // const canEndStateConfig = canEndConfig(config, deployerAddress);
  // const calculatePriceStateConfig = calculatePriceConfig(config);
}

export const saleDeploy = async (
  deployer: Signer,
  deployerAddress: string,
  config: SaleParams,
  ...args
): Promise<Sale> => {

  const newSale = Sale.deploy(
    deployer,
    {
      canStartStateConfig: config.creatorControlMode
        ? new SaleDurationInTimestamp(config.inputValues.startTimestamp).applyOwnership(deployerAddress)
        : new SaleDurationInTimestamp(config.inputValues.startTimestamp),
      canEndStateConfig: canEndConfig(config, deployerAddress),
      calculatePriceStateConfig: calculatePriceConfig(config),
      recipient: config.inputValues.recipient,
      reserve: config.inputValues.reserve,
      saleTimeout: 10,
      cooldownDuration: parseInt(config.inputValues.cooldownDuration),
      minimumRaise: parseUnits(
        config.inputValues.minimumRaise.toString(),
        config.inputValues.reserveErc20.erc20decimals
      ),
      dustSize: 0,
    },
    {
      erc20Config: {
        name: config.inputValues.name,
        symbol: config.inputValues.symbol,
        distributor: ethers.constants.AddressZero,
        initialSupply: parseUnits(config.inputValues.initialSupply.toString()),
      },
      tier: config.inputValues.tier,
      minimumTier: config.inputValues.minimumStatus,
      distributionEndForwardingAddress: config.inputValues.distributionEndForwardingAddress,
    }
  )
  return newSale
}