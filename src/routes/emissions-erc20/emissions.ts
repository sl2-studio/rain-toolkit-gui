import { BigNumber, BigNumberish, ethers, BytesLike } from "ethers";
import { concat } from "ethers/lib/utils";
import { EmissionsERC20, Tier, StateConfig } from "rain-sdk";
import {
  arg,
  callSize,
  op,
  paddedUInt256,
  paddedUInt32,
  selectLte,
  selectLteLogic,
  selectLteMode,
  tierRange,
} from "../../utils";

export const eighteenZeros = "000000000000000000";
export const sixZeros = "000000";


type EmissionsConfig = {
  monthlyRewards: {
    brnzReward: number;
    silvReward: number;
    goldReward: number;
    platReward: number;
  };
  tierAddress: string;
};

export const createEmissionsSource = (
  config: EmissionsConfig
): StateConfig => {
  const BN_ONE = BigNumber.from("1" + eighteenZeros);

  // We're using uints, so we need to scale reward per block up to get out of the decimal places, 
  // but a precision of 18 zeros is too much to fit within a uint32 (since we store block rewards 
  // per tier in a report-like format). Six zeros should be enough.
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

  const valTierAddress = op(EmissionsERC20.Opcodes.VAL, 0);
  const valBaseRewardPerTier = op(EmissionsERC20.Opcodes.VAL, 1);
  const valBlocksPerYear = op(EmissionsERC20.Opcodes.VAL, 2);
  const valBNOne = op(EmissionsERC20.Opcodes.VAL, 3);
  const valBNOneReward = op(EmissionsERC20.Opcodes.VAL, 4);

  // END global constants

  // BEGIN zipmap args

  const valDuration = op(EmissionsERC20.Opcodes.VAL, arg(0));
  const valBaseReward = op(EmissionsERC20.Opcodes.VAL, arg(1));

  // END zipmap args

  // BEGIN SOURCE SNIPPETS
  // prettier-ignore
  const REWARD = () =>
    concat([
      valDuration,
      valBaseReward,
      op(EmissionsERC20.Opcodes.MUL, 2),
    ]);

  // prettier-ignore
  const PROGRESS = () =>
    concat([
      valBNOne,
      valDuration,
      valBNOne,
      op(EmissionsERC20.Opcodes.MUL, 2),
      valBlocksPerYear,
      op(EmissionsERC20.Opcodes.DIV, 2),
      op(EmissionsERC20.Opcodes.MIN, 2),
    ]);

  // prettier-ignore
  const MULTIPLIER = () =>
    concat([
      PROGRESS(),
      valBNOne,
      op(EmissionsERC20.Opcodes.ADD, 2),
    ]);

  // prettier-ignore
  const FN = () =>
    concat([
      REWARD(),
      MULTIPLIER(),
      op(EmissionsERC20.Opcodes.MUL, 2),
      valBNOneReward, // scale EACH tier result down by reward per block scaler
      op(EmissionsERC20.Opcodes.DIV, 2),
    ]);

  // prettier-ignore
  const CURRENT_BLOCK_AS_REPORT = () =>
    concat([
      op(EmissionsERC20.Opcodes.NEVER),
      op(EmissionsERC20.Opcodes.BLOCK_NUMBER),
      op(
        EmissionsERC20.Opcodes.UPDATE_BLOCKS_FOR_TIER_RANGE,
        tierRange(Tier.ZERO, Tier.EIGHT)
      ),
    ]);

  // prettier-ignore
  const LAST_CLAIM_REPORT = () =>
    concat([
      op(EmissionsERC20.Opcodes.THIS_ADDRESS),
      op(EmissionsERC20.Opcodes.CLAIMANT_ACCOUNT),
      op(EmissionsERC20.Opcodes.REPORT),
    ]);

  // prettier-ignore
  const TIER_REPORT = () =>
    concat([
      valTierAddress,
      op(EmissionsERC20.Opcodes.CLAIMANT_ACCOUNT),
      op(EmissionsERC20.Opcodes.REPORT),
    ]);

  // prettier-ignore
  const TIERWISE_DIFF = () =>
    concat([
      CURRENT_BLOCK_AS_REPORT(),
      TIER_REPORT(),
      LAST_CLAIM_REPORT(),
      op(EmissionsERC20.Opcodes.BLOCK_NUMBER),
      op(EmissionsERC20.Opcodes.SELECT_LTE, selectLte(selectLteLogic.any, selectLteMode.max, 2)),
      op(EmissionsERC20.Opcodes.SATURATING_DIFF),
    ]);

  // prettier-ignore
  const SOURCE = () =>
    concat([
      TIERWISE_DIFF(),
      valBaseRewardPerTier,
      op(EmissionsERC20.Opcodes.ZIPMAP, callSize(1, 3, 1)),
      op(EmissionsERC20.Opcodes.ADD, 8),
    ]);

  // END Source snippets

  const constants = [
    config.tierAddress,
    BASE_REWARD_PER_TIER,
    BLOCKS_PER_YEAR,
    BN_ONE,
    BN_ONE_REWARD,
  ];

  return {
    sources: [SOURCE(), FN()],
    constants,
    argumentsLength: 2,
    stackLength: SOURCE().length / 2,
  };
};
