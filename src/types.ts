import { BigNumber, BigNumberish, BytesLike } from "ethers";

export type ERC20Config = {
  /// Name as defined by Open Zeppelin ERC20.
  name: string;
  /// Symbol as defined by Open Zeppelin ERC20.
  symbol: string;
  /// Distributor address of the initial supply.
  /// MAY be zero.
  distributor: string;
  /// Initial supply to mint.
  /// MAY be zero.
  initialSupply: BigNumber;
};

export type StateConfigStruct = {
  sources: BytesLike[];
  constants: BigNumberish[];
  stackLength: BigNumberish;
  argumentsLength: BigNumberish;
};

export type SaleConfig = {
  canStartStateConfig: StateConfigStruct;
  canEndStateConfig: StateConfigStruct;
  calculatePriceStateConfig: StateConfigStruct;
  recipient: string;
  reserve: string;
  cooldownDuration: BigNumberish;
  minimumRaise: BigNumberish;
  dustSize: BigNumberish;
};

export type SaleRedeemableERC20Config = {
  erc20Config: ERC20Config;
  tier: string;
  minimumTier: Tier;
  distributionEndForwardingAddress: string;
};

export enum Tier {
  ZERO,
  ONE,
  TWO,
  THREE,
  FOUR,
  FIVE,
  SIX,
  SEVEN,
  EIGHT,
}

export enum TxStatus {
  None,
  AwaitingSignature,
  AwaitingConfirmation,
  Error,
  Confirmed
}
