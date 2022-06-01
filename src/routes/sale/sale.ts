import { BigNumber, Contract, ethers, Signer } from "ethers";
import { Tier } from "../../types";
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
import { Sale, SaleDurationInTimestamp, vLBP, IncreasingPrice, FixedPrice } from 'rain-sdk'

// export const enum Opcode {
//   SKIP,
//   VAL,
//   DUP,
//   ZIPMAP,
//   BLOCK_NUMBER,
//   BLOCK_TIMESTAMP,
//   SENDER,
//   IS_ZERO,
//   EAGER_IF,
//   EQUAL_TO,
//   LESS_THAN,
//   GREATER_THAN,
//   EVERY,
//   ANY,
//   ADD,
//   SUB,
//   MUL,
//   DIV,
//   MOD,
//   POW,
//   MIN,
//   MAX,
//   REPORT,
//   NEVER,
//   ALWAYS,
//   SATURATING_DIFF,
//   UPDATE_BLOCKS_FOR_TIER_RANGE,
//   SELECT_LTE,
//   ERC20_BALANCE_OF,
//   ERC20_TOTAL_SUPPLY,
//   ERC721_BALANCE_OF,
//   ERC721_OWNER_OF,
//   ERC1155_BALANCE_OF,
//   ERC1155_BALANCE_OF_BATCH,
//   REMAINING_UNITS,
//   TOTAL_RESERVE_IN,
//   LAST_BUY_BLOCK,
//   LAST_BUY_UNITS,
//   LAST_BUY_PRICE,
//   CURRENT_BUY_UNITS,
//   TOKEN_ADDRESS,
//   RESERVE_ADDRESS,
// };

export enum selectSale {
  fixedPrice,
  vFLO,
  increasingPrice,
};


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

export const getAfterTimestampDate = (stateConfig, i) => {
  if (stateConfig.sources[0] ===
    "0x0100" ||
    "0x010107001d00060001001f0001021c00" ||
    "0x050001000b00" ||
    "0x050001000b000600010109000c02" ||
    "0x050001000b00230001020a000c02050001010b000d02" ||
    "0x050001000b00230001020a000c02050001010b000d020600010309000c02") {

    return new Date(parseInt(stateConfig.constants[i]) * 1000);
  }
};


export const getAfterTimestamp = (stateConfig, i) => {
  if (stateConfig.sources[0] ===
    "0x0100" ||
    "0x010107001d00060001001f0001021c00" ||
    "0x050001000b00" ||
    "0x050001000b000600010109000c02" ||
    "0x050001000b00230001020a000c02050001010b000d02" ||
    "0x050001000b00230001020a000c02050001010b000d020600010309000c02") {

    return parseInt(stateConfig.constants[i]);
  }
};

export const saleStatuses = ["Pending", "Active", "Success", "Fail"];

function canEndConfig(config: SaleParams, deployerAddress: string) {

  const saleTime = new SaleDurationInTimestamp(config.inputValues.endTimestamp)

  if (config.extraTimeDiscountType) {
    if (config.creatorControlType) {
      saleTime.applyExtraTime(config.inputValues.extraTime, config.inputValues.extraTimeAmount).applyOwnership(deployerAddress)
    }
    if (config.canEndType) {
      saleTime.applyExtraTime(config.inputValues.extraTime, config.inputValues.extraTimeAmount)
    }
  } else {
    if (config.creatorControlType) {
      saleTime.applyOwnership(deployerAddress)
    }
    if (config.canEndType) {
      saleTime.applyExtraTime(config.inputValues.extraTime, config.inputValues.extraTimeAmount)
    }
  }
  return saleTime;
}


function calculatePriceConfig(config: SaleParams) {

  if (config.saleType == selectSale.fixedPrice) {
    const newFixedPrice = new FixedPrice(config.inputValues.startPrice)

    //if extra time discount is enabled
    if (config.extraTimeDiscountType) {
      newFixedPrice.applyExtraTimeDiscount(config.inputValues.endTimestamp, config.inputValues.extraTimeDiscountThreshold, config.inputValues.extraTimeDiscount)
    }

    //if tier Discount is enabled
    if (config.tierDiscountType) {

      //if tierActivation is enabled
      if (config.tierDiscountActType) {
        newFixedPrice.applyTierDiscount(config.inputValues.tierDiscountAddress,
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

          ])
      } else {
        newFixedPrice.applyTierDiscount(config.inputValues.tierDiscountAddress,
          [
            config.inputValues.discountTier1,
            config.inputValues.discountTier2,
            config.inputValues.discountTier3,
            config.inputValues.discountTier4,
            config.inputValues.discountTier5,
            config.inputValues.discountTier6,
            config.inputValues.discountTier7,
            config.inputValues.discountTier8
          ])
      }
    }

    //if Max Cap Per Wallet conditions
    if (config.maxCapType) {
      //if both Max Cap Per Wallet and Min Cap Per Wallet is enabled
      if (config.minCapType && config.maxCapType) {
        //if both Max Cap Per Wallet and Min Cap Per Wallet and Tier Max Cap Per Wallet Multiplier is enabled
        if (config.minCapType && config.maxCapType && config.tierCapMulType) {
          //if tierActivation is enabled
          if (config.tierCapMulActType) {
            newFixedPrice.applyWalletCap(2, {
              maxWalletCap: config.inputValues.maxWalletCap, minWalletCap: config.inputValues.minWalletCap, tierMultiplierMode: true, tierAddress: config.inputValues.tierCapMulAddress,
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
            })
          } else {
            newFixedPrice.applyWalletCap(2, {
              maxWalletCap: config.inputValues.maxWalletCap, minWalletCap: config.inputValues.minWalletCap, tierMultiplierMode: true, tierAddress: config.inputValues.tierCapMulAddress,
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
            })
          }
        } else {
          newFixedPrice.applyWalletCap(2, { maxWalletCap: config.inputValues.maxWalletCap, minWalletCap: config.inputValues.minWalletCap })
        }
      }
      //if both Max Cap Per Wallet and Tier Max Cap Per Wallet Multiplier is enabled
      else if (config.maxCapType && config.tierCapMulType) {

        //if tierActivation is enabled
        if (config.tierCapMulActType) {
          newFixedPrice.applyWalletCap(config.maxCapType, {
            maxWalletCap: config.inputValues.maxWalletCap, tierMultiplierMode: true, tierAddress: config.inputValues.tierCapMulAddress,
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
          })
        } else {
          newFixedPrice.applyWalletCap(config.maxCapType, {
            maxWalletCap: config.inputValues.maxWalletCap, tierMultiplierMode: true, tierAddress: config.inputValues.tierCapMulAddress,
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
          })
        }
      }
      //if only Max Cap Per Wallet is enabled
      else {
        newFixedPrice.applyWalletCap(config.maxCapType, { maxWalletCap: config.inputValues.maxWalletCap })
      }
    }
    //if Min Cap Per Wallet is enabled
    else if (config.minCapType) {
      newFixedPrice.applyWalletCap(config.minCapType, { minWalletCap: config.inputValues.minWalletCap })
    }

    return newFixedPrice;

  }

  else if (config.saleType == selectSale.increasingPrice) {
    const newIncreasingPrice = new IncreasingPrice(config.inputValues.startPrice, config.inputValues.endPrice, config.inputValues.startTimestamp, config.inputValues.endTimestamp)

    //if extra time discount is enabled
    if (config.extraTimeDiscountType) {
      newIncreasingPrice.applyExtraTimeDiscount(config.inputValues.endTimestamp, config.inputValues.extraTimeDiscountThreshold, config.inputValues.extraTimeDiscount)
    }

    //if tier Discount is enabled
    if (config.tierDiscountType) {

      //if tierActivation is enabled
      if (config.tierDiscountActType) {
        newIncreasingPrice.applyTierDiscount(config.inputValues.tierDiscountAddress,
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

          ])
      } else {
        newIncreasingPrice.applyTierDiscount(config.inputValues.tierDiscountAddress,
          [
            config.inputValues.discountTier1,
            config.inputValues.discountTier2,
            config.inputValues.discountTier3,
            config.inputValues.discountTier4,
            config.inputValues.discountTier5,
            config.inputValues.discountTier6,
            config.inputValues.discountTier7,
            config.inputValues.discountTier8
          ])
      }
    }

    //if Max Cap Per Wallet conditions
    if (config.maxCapType) {
      //if both Max Cap Per Wallet and Min Cap Per Wallet is enabled
      if (config.minCapType && config.maxCapType) {
        //if both Max Cap Per Wallet and Min Cap Per Wallet and Tier Max Cap Per Wallet Multiplier is enabled
        if (config.minCapType && config.maxCapType && config.tierCapMulType) {
          //if tierActivation is enabled
          if (config.tierCapMulActType) {
            newIncreasingPrice.applyWalletCap(2, {
              maxWalletCap: config.inputValues.maxWalletCap, minWalletCap: config.inputValues.minWalletCap, tierMultiplierMode: true, tierAddress: config.inputValues.tierCapMulAddress,
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
            })
          } else {
            newIncreasingPrice.applyWalletCap(2, {
              maxWalletCap: config.inputValues.maxWalletCap, minWalletCap: config.inputValues.minWalletCap, tierMultiplierMode: true, tierAddress: config.inputValues.tierCapMulAddress,
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
            })
          }
        } else {
          newIncreasingPrice.applyWalletCap(2, { maxWalletCap: config.inputValues.maxWalletCap, minWalletCap: config.inputValues.minWalletCap })
        }
      }
      //if both Max Cap Per Wallet and Tier Max Cap Per Wallet Multiplier is enabled
      else if (config.maxCapType && config.tierCapMulType) {

        //if tierActivation is enabled
        if (config.tierCapMulActType) {
          newIncreasingPrice.applyWalletCap(config.maxCapType, {
            maxWalletCap: config.inputValues.maxWalletCap, tierMultiplierMode: true, tierAddress: config.inputValues.tierCapMulAddress,
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
          })
        } else {
          newIncreasingPrice.applyWalletCap(config.maxCapType, {
            maxWalletCap: config.inputValues.maxWalletCap, tierMultiplierMode: true, tierAddress: config.inputValues.tierCapMulAddress,
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
          })
        }
      }
      //if only Max Cap Per Wallet is enabled
      else {
        newIncreasingPrice.applyWalletCap(config.maxCapType, { maxWalletCap: config.inputValues.maxWalletCap })
      }
    }
    //if Min Cap Per Wallet is enabled
    else if (config.minCapType) {
      newIncreasingPrice.applyWalletCap(config.minCapType, { minWalletCap: config.inputValues.minWalletCap })
    }

    return newIncreasingPrice

  }

  else if (config.saleType == selectSale.vFLO) {
    const newVLBP = new vLBP(config.inputValues.startPrice, config.inputValues.startTimestamp, config.inputValues.endTimestamp, config.inputValues.minimumRaise, config.inputValues.initialSupply)

    //if extra time discount is enabled
    if (config.extraTimeDiscountType) {
      newVLBP.applyExtraTimeDiscount(config.inputValues.endTimestamp, config.inputValues.extraTimeDiscountThreshold, config.inputValues.extraTimeDiscount)
    }

    //if tier Discount is enabled
    if (config.tierDiscountType) {

      //if tierActivation is enabled
      if (config.tierDiscountActType) {
        newVLBP.applyTierDiscount(config.inputValues.tierDiscountAddress,
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

          ])
      } else {
        newVLBP.applyTierDiscount(config.inputValues.tierDiscountAddress,
          [
            config.inputValues.discountTier1,
            config.inputValues.discountTier2,
            config.inputValues.discountTier3,
            config.inputValues.discountTier4,
            config.inputValues.discountTier5,
            config.inputValues.discountTier6,
            config.inputValues.discountTier7,
            config.inputValues.discountTier8
          ])
      }
    }

    //if Max Cap Per Wallet conditions
    if (config.maxCapType) {
      //if both Max Cap Per Wallet and Min Cap Per Wallet is enabled
      if (config.minCapType && config.maxCapType) {
        //if both Max Cap Per Wallet and Min Cap Per Wallet and Tier Max Cap Per Wallet Multiplier is enabled
        if (config.minCapType && config.maxCapType && config.tierCapMulType) {
          //if tierActivation is enabled
          if (config.tierCapMulActType) {
            newVLBP.applyWalletCap(2, {
              maxWalletCap: config.inputValues.maxWalletCap, minWalletCap: config.inputValues.minWalletCap, tierMultiplierMode: true, tierAddress: config.inputValues.tierCapMulAddress,
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
            })
          } else {
            newVLBP.applyWalletCap(2, {
              maxWalletCap: config.inputValues.maxWalletCap, minWalletCap: config.inputValues.minWalletCap, tierMultiplierMode: true, tierAddress: config.inputValues.tierCapMulAddress,
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
            })
          }
        } else {
          newVLBP.applyWalletCap(2, { maxWalletCap: config.inputValues.maxWalletCap, minWalletCap: config.inputValues.minWalletCap })
        }
      }
      //if both Max Cap Per Wallet and Tier Max Cap Per Wallet Multiplier is enabled
      else if (config.maxCapType && config.tierCapMulType) {

        //if tierActivation is enabled
        if (config.tierCapMulActType) {
          newVLBP.applyWalletCap(config.maxCapType, {
            maxWalletCap: config.inputValues.maxWalletCap, tierMultiplierMode: true, tierAddress: config.inputValues.tierCapMulAddress,
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
          })
        } else {
          newVLBP.applyWalletCap(config.maxCapType, {
            maxWalletCap: config.inputValues.maxWalletCap, tierMultiplierMode: true, tierAddress: config.inputValues.tierCapMulAddress,
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
          })
        }
      }
      //if only Max Cap Per Wallet is enabled
      else {
        newVLBP.applyWalletCap(config.maxCapType, { maxWalletCap: config.inputValues.maxWalletCap })
      }
    }
    //if Min Cap Per Wallet is enabled
    else if (config.minCapType) {
      newVLBP.applyWalletCap(config.minCapType, { minWalletCap: config.inputValues.minWalletCap })
    }

    return newVLBP
  }
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
      canStartStateConfig: config.creatorControlType ? new SaleDurationInTimestamp(config.inputValues.startTimestamp).applyOwnership(deployerAddress) : new SaleDurationInTimestamp(config.inputValues.startTimestamp),
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