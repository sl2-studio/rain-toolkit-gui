import { BigNumber, Contract, ethers, Signer } from "ethers";
import { SaleConfig, SaleRedeemableERC20Config } from "../../types";
import { getNewChildFromReceipt, op } from "../../utils";
import RedeemableEscrowArtifact from "../../abis/RedeemableERC20ClaimEscrow.json";
// import SaleArtifact from "../../abis/Sale.json";
import RedeemableERC20Artifact from "../../abis/RedeemableERC20.json";
import ReserveTokenArtifact from "../../abis/ReserveToken.json";
import { concat } from "ethers/lib/utils";
import { selectedNetwork } from "src/stores";
import { get } from "svelte/store";

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
// }

// export type BuyConfig = {
//   feeRecipient: string;
//   fee: BigNumber;
//   minimumUnits: BigNumber;
//   desiredUnits: BigNumber;
//   maximumPrice: BigNumber;
// };

export interface EscrowTokenData {
  id: string;
  pendingDeposits : {
    id: string;
    depositor: string;
    token : {
      id : string
      totalSupply: string,
      decimals: string,
      name : string
    }
    tokenAddress: string
    escrowAddress: string
  };
  deposits : {
    id: string;
    depositor: string;
    token : {
      id : string
      totalSupply: string,
      decimals: string,
      name : string
    }
    tokenAddress: string
    escrowAddress: string,
    tokenAmount: string
  };
}

export const initEscrowContracts = (escrowAddress, signer: Signer) => {
  const escrow = new ethers.Contract(escrowAddress, RedeemableEscrowArtifact.abi, signer);
  return escrow;
};

