import { ethers, Signer } from "ethers";
import RedeemableEscrowArtifact from "../../../abis/RedeemableERC20ClaimEscrow.json";

export interface EscrowTokenData {
  id: string;
  pendingDeposits: {
    id: string;
    depositor: string;
    token: {
      id: string
      totalSupply: string,
      decimals: string,
      name: string
    }
    tokenAddress: string
    escrowAddress: string
  };
  deposits: {
    id: string;
    depositor: string;
    token: {
      id: string
      totalSupply: string,
      decimals: string,
      name: string
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

