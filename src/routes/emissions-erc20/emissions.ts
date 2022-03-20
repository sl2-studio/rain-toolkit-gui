import { BigNumber, BigNumberish, ethers, BytesLike, Signer } from "ethers";
import { concat } from "ethers/lib/utils";
import {
  arg,
  callSize,
  getERC20,
  op,
  paddedUInt256,
  paddedUInt32,
  selectLte,
  selectLteLogic,
  selectLteMode,
  tierRange,
} from "../../utils";
import EmissionsERC20Artifact from "../../abis/EmissionsERC20.json";

export const eighteenZeros = "000000000000000000";
export const sixZeros = "000000";

const enum Opcode {
  SKIP,
  VAL,
  DUP,
  ZIPMAP,
  BLOCK_NUMBER,
  BLOCK_TIMESTAMP,
  THIS_ADDRESS,
  ADD,
  SUB,
  MUL,
  DIV,
  MOD,
  EXP,
  MIN,
  MAX,
  REPORT,
  NEVER,
  ALWAYS,
  SATURATING_DIFF,
  UPDATE_BLOCKS_FOR_TIER_RANGE,
  SELECT_LTE,
  CLAIMANT_ACCOUNT,
  CONSTRUCTION_BLOCK_NUMBER,
}

enum Tier {
  ZERO,
  ONE, // bronze
  TWO, // silver
  THREE, // gold
  FOUR, // platinum
  FIVE,
  SIX,
  SEVEN,
  EIGHT,
}

type EmissionsConfig = {
  monthlyRewards: {
    brnzReward: number;
    silvReward: number;
    goldReward: number;
    platReward: number;
  };
  tierAddress: string;
};

export type ERC20ConfigStruct = {
  name: string;
  symbol: string;
  distributor: string;
  initialSupply: BigNumberish;
};

export type StateConfigStruct = {
  sources: BytesLike[];
  constants: BigNumberish[];
  stackLength: BigNumberish;
  argumentsLength: BigNumberish;
};

export type EmissionsERC20ConfigStruct = {
  allowDelegatedClaims: boolean;
  erc20Config: ERC20ConfigStruct;
  vmStateConfig: StateConfigStruct;
};

export const createEmissionsSource = (
  config: EmissionsConfig
): StateConfigStruct => {
  // console.log(config)
  const BN_ONE = BigNumber.from("1" + eighteenZeros);

  // We're using uints, so we need to scale reward per block up to get out of the decimal places, but a precision of 18 zeros is too much to fit within a uint32 (since we store block rewards per tier in a report-like format). Six zeros should be enough.
  const BN_ONE_REWARD = BigNumber.from("1" + sixZeros);

  // 2 seconds per block
  const BLOCKS_PER_YEAR = 43200 * 365.25;

  const BLOCKS_PER_MONTH = Math.floor(BLOCKS_PER_YEAR / 12);

  const MONTHLY_REWARD_BRNZ = BigNumber.from(
    config.monthlyRewards.brnzReward
  ).mul(BN_ONE_REWARD);

  const MONTHLY_REWARD_SILV = BigNumber.from(config.monthlyRewards.silvReward)
    .mul(BN_ONE_REWARD)
    .sub(MONTHLY_REWARD_BRNZ);

  const MONTHLY_REWARD_GOLD = BigNumber.from(config.monthlyRewards.goldReward)
    .mul(BN_ONE_REWARD)
    .sub(MONTHLY_REWARD_SILV.add(MONTHLY_REWARD_BRNZ));

  const MONTHLY_REWARD_PLAT = BigNumber.from(config.monthlyRewards.platReward)
    .mul(BN_ONE_REWARD)
    .sub(MONTHLY_REWARD_GOLD.add(MONTHLY_REWARD_SILV).add(MONTHLY_REWARD_BRNZ));

  const REWARD_PER_BLOCK_BRNZ = MONTHLY_REWARD_BRNZ.div(BLOCKS_PER_MONTH);
  const REWARD_PER_BLOCK_SILV = MONTHLY_REWARD_SILV.div(BLOCKS_PER_MONTH);
  const REWARD_PER_BLOCK_GOLD = MONTHLY_REWARD_GOLD.div(BLOCKS_PER_MONTH);
  const REWARD_PER_BLOCK_PLAT = MONTHLY_REWARD_PLAT.div(BLOCKS_PER_MONTH);

  const BASE_REWARD_PER_TIER = paddedUInt256(
    ethers.BigNumber.from(
      "0x" +
      paddedUInt32(0).repeat(4) +
      paddedUInt32(REWARD_PER_BLOCK_PLAT) +
      paddedUInt32(REWARD_PER_BLOCK_GOLD) +
      paddedUInt32(REWARD_PER_BLOCK_SILV) +
      paddedUInt32(REWARD_PER_BLOCK_BRNZ)
    )
  );

  // BEGIN global constants

  const valTierAddress = op(Opcode.VAL, 0);
  const valBaseRewardPerTier = op(Opcode.VAL, 1);
  const valBlocksPerYear = op(Opcode.VAL, 2);
  const valBNOne = op(Opcode.VAL, 3);
  const valBNOneReward = op(Opcode.VAL, 4);

  // END global constants

  // BEGIN zipmap args

  const valDuration = op(Opcode.VAL, arg(0));
  const valBaseReward = op(Opcode.VAL, arg(1));

  // END zipmap args

  // BEGIN SOURCE SNIPPETS
  // prettier-ignore
  const REWARD = () =>
    concat([
      valDuration,
      valBaseReward,
      op(Opcode.MUL, 2),
    ]);

  // prettier-ignore
  const PROGRESS = () =>
    concat([
      valBNOne,
      valDuration,
      valBNOne,
      op(Opcode.MUL, 2),
      valBlocksPerYear,
      op(Opcode.DIV, 2),
      op(Opcode.MIN, 2),
    ]);

  // prettier-ignore
  const MULTIPLIER = () =>
    concat([
      PROGRESS(),
      valBNOne,
      op(Opcode.ADD, 2),
    ]);

  // prettier-ignore
  const FN = () =>
    concat([
      REWARD(),
      MULTIPLIER(),
      op(Opcode.MUL, 2),
      valBNOneReward, // scale EACH tier result down by reward per block scaler
      op(Opcode.DIV, 2),
    ]);

  // prettier-ignore
  const CURRENT_BLOCK_AS_REPORT = () =>
    concat([
      op(Opcode.NEVER),
      op(Opcode.BLOCK_NUMBER),
      op(
        Opcode.UPDATE_BLOCKS_FOR_TIER_RANGE,
        tierRange(Tier.ZERO, Tier.EIGHT)
      ),
    ]);

  // prettier-ignore
  const LAST_CLAIM_REPORT = () =>
    concat([
      op(Opcode.THIS_ADDRESS),
      op(Opcode.CLAIMANT_ACCOUNT),
      op(Opcode.REPORT),
    ]);

  // prettier-ignore
  const TIER_REPORT = () =>
    concat([
      valTierAddress,
      op(Opcode.CLAIMANT_ACCOUNT),
      op(Opcode.REPORT),
    ]);

  // prettier-ignore
  const TIERWISE_DIFF = () =>
    concat([
      CURRENT_BLOCK_AS_REPORT(),
      TIER_REPORT(),
      LAST_CLAIM_REPORT(),
      op(Opcode.BLOCK_NUMBER),
      op(Opcode.SELECT_LTE, selectLte(selectLteLogic.any, selectLteMode.max, 2)),
      op(Opcode.SATURATING_DIFF),
    ]);

  // prettier-ignore
  const SOURCE = () =>
    concat([
      TIERWISE_DIFF(),
      valBaseRewardPerTier,
      op(Opcode.ZIPMAP, callSize(1, 3, 1)),
      op(Opcode.ADD, 8),
    ]);

  // END Source snippets

  const constants = [
    config.tierAddress,
    BASE_REWARD_PER_TIER,
    BLOCKS_PER_YEAR,
    BN_ONE,
    BN_ONE_REWARD,
  ];

  // console.log("source", SOURCE());
  // console.log("constants", constants);
  // console.log("source length", SOURCE().length);

  return {
    sources: [SOURCE(), FN()],
    constants,
    argumentsLength: 2,
    stackLength: SOURCE().length / 2,
  };
};

export const initEmissions = async (signer: Signer, address: string, signerAddress: string) => {
  const emissionsContract = new ethers.Contract(
    address,
    EmissionsERC20Artifact.abi,
    signer
  );
  const token = await getERC20(address, signer, signerAddress);
  return [emissionsContract, token];
};
