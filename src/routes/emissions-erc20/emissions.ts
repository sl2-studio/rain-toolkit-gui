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
  DEBUG,
  BLOCK_NUMBER,
  BLOCK_TIMESTAMP,
  SENDER,
  THIS_ADDRESS,
  SCALE18_MUL,
  SCALE18_DIV,
  SCALE18,
  SCALEN,
  SCALE_BY,
  SCALE18_ONE,
  SCALE18_DECIMALS,
  ADD,
  SATURATING_ADD,
  SUB,
  SATURATING_SUB,
  MUL,
  SATURATING_MUL,
  DIV,
  MOD,
  EXP,
  MIN,
  MAX,
  ISZERO,
  EAGER_IF,
  EQUAL_TO,
  LESS_THAN,
  GREATER_THAN,
  EVERY,
  ANY,
  REPORT,
  NEVER,
  ALWAYS,
  SATURATING_DIFF,
  UPDATE_BLOCKS_FOR_TIER_RANGE,
  SELECT_LTE,
  IERC20_BALANCE_OF,
  IERC20_TOTAL_SUPPLY,
  IERC721_BALANCE_OF,
  IERC721_OWNER_OF,
  IERC1155_BALANCE_OF,
  IERC1155_BALANCE_OF_BATCH,
  CLAIMANT_ACCOUNT,
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
  maxMonthlyRewards: {
    brnzReward: number;
    silvReward: number;
    goldReward: number;
    platReward: number;
  };
  tierAddress: string;
  incrementDuration: number;
  numberOfIncrements : number;
  blockTime: number;
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
  const BN_ONE = BigNumber.from("1" + eighteenZeros);

  // We're using uints, so we need to scale reward per block up to get out of the decimal places, but a precision of 18 zeros is too much to fit within a uint32 (since we store block rewards per tier in a report-like format). Six zeros should be enough.
  const BN_ONE_REWARD = BigNumber.from("1" + sixZeros);

  // 2 seconds per block
  const BLOCKS_PER_YEAR = (86400 / config.blockTime) * 365.25;

  const BLOCKS_PER_MONTH = Math.floor((BLOCKS_PER_YEAR / 12) / config.incrementDuration);

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


const MONTHLY_REWARD_PER_TIER = paddedUInt256(
  ethers.BigNumber.from(
    "0x" +
    paddedUInt32(0).repeat(4) +
    paddedUInt32(MONTHLY_REWARD_PLAT) +
    paddedUInt32(MONTHLY_REWARD_GOLD) +
    paddedUInt32(MONTHLY_REWARD_SILV) +
    paddedUInt32(MONTHLY_REWARD_BRNZ)
  )
);

const MONTHLY_MAX_BRNZ = BigNumber.from(
  config.maxMonthlyRewards.brnzReward - config.monthlyRewards.brnzReward
).mul(BN_ONE_REWARD);
const MONTHLY_MAX_SILV = BigNumber.from(
  config.maxMonthlyRewards.silvReward - config.monthlyRewards.silvReward 
).mul(BN_ONE_REWARD).sub(MONTHLY_MAX_BRNZ);
const MONTHLY_MAX_GOLD = BigNumber.from(
  config.maxMonthlyRewards.goldReward - config.monthlyRewards.goldReward 
).mul(BN_ONE_REWARD).sub(MONTHLY_MAX_SILV.add(MONTHLY_MAX_BRNZ));
const MONTHLY_MAX_PLAT = BigNumber.from(
  config.maxMonthlyRewards.platReward - config.monthlyRewards.platReward 
).mul(BN_ONE_REWARD).sub(MONTHLY_MAX_GOLD.add(MONTHLY_MAX_SILV).add(MONTHLY_MAX_BRNZ));

const MONTHLY_INC_BRNZ = MONTHLY_MAX_BRNZ.div(config.numberOfIncrements - 1);
const MONTHLY_INC_SILV = MONTHLY_MAX_SILV.div(config.numberOfIncrements - 1);
const MONTHLY_INC_GOLD = MONTHLY_MAX_GOLD.div(config.numberOfIncrements - 1);
const MONTHLY_INC_PLAT = MONTHLY_MAX_PLAT.div(config.numberOfIncrements - 1);

const MONTHLY_INC_PER_TIER = paddedUInt256(
  ethers.BigNumber.from(
    "0x" +
    paddedUInt32(0).repeat(4) +
    paddedUInt32(MONTHLY_INC_PLAT) +
    paddedUInt32(MONTHLY_INC_GOLD) +
    paddedUInt32(MONTHLY_INC_SILV) +
    paddedUInt32(MONTHLY_INC_BRNZ) 
  )
)

// const LAST_CLAIM_REPORT1 = () => // just for converting NEVER report to ALWAYS
//     concat([
//       op(Opcode.THIS_ADDRESS),
//       op(Opcode.CLAIMANT_ACCOUNT),
//       op(Opcode.REPORT),
//       op(Opcode.NEVER),
//       op(Opcode.EQUAL_TO),
//       op(Opcode.ALWAYS),
//       op(Opcode.THIS_ADDRESS),
//       op(Opcode.CLAIMANT_ACCOUNT),
//       op(Opcode.REPORT),
//       op(Opcode.EAGER_IF)
//     ]);

const constants1 = [
  config.tierAddress,
  MONTHLY_REWARD_PER_TIER,
  MONTHLY_INC_PER_TIER,
  BLOCKS_PER_MONTH,
  BN_ONE,
  BN_ONE_REWARD,
  config.numberOfIncrements,
  1,
  10,
  2
];

const sources1 = [
  concat([
    op(Opcode.NEVER),
    op(Opcode.BLOCK_NUMBER),
    op(Opcode.UPDATE_BLOCKS_FOR_TIER_RANGE, tierRange(Tier.ZERO, Tier.EIGHT)),
    op(Opcode.VAL, 0),
    op(Opcode.CLAIMANT_ACCOUNT),
    op(Opcode.REPORT),
    op(Opcode.SATURATING_DIFF),
    op(Opcode.THIS_ADDRESS),
    op(Opcode.CLAIMANT_ACCOUNT),
    op(Opcode.REPORT),
    op(Opcode.NEVER),
    op(Opcode.EQUAL_TO),
    op(Opcode.ALWAYS),
    op(Opcode.THIS_ADDRESS),
    op(Opcode.CLAIMANT_ACCOUNT),
    op(Opcode.REPORT),
    op(Opcode.EAGER_IF),
    op(Opcode.VAL, 0),
    op(Opcode.CLAIMANT_ACCOUNT),
    op(Opcode.REPORT),
    op(Opcode.SATURATING_DIFF),
    op(Opcode.VAL, 1),
    op(Opcode.VAL, 2),
    op(Opcode.ZIPMAP, callSize(1, 3, 3)),
    op(Opcode.ADD, 8),
    op(Opcode.VAL, 4),
    op(Opcode.MUL, 2),
    op(Opcode.VAL, 5),
    op(Opcode.DIV, 2),
  ]),
  concat([
    op(Opcode.VAL, arg(0)),
    op(Opcode.VAL, 3),
    op(Opcode.DIV, 2),
    op(Opcode.VAL, 6),
    op(Opcode.GREATER_THAN),
    op(Opcode.VAL, 6),
    op(Opcode.VAL, arg(1)),
    op(Opcode.VAL, 3),
    op(Opcode.DIV, 2),
    op(Opcode.SATURATING_SUB, 2),
    op(Opcode.VAL, arg(1)),
    op(Opcode.VAL, 3),
    op(Opcode.DIV, 2),
    op(Opcode.VAL, 6),
    op(Opcode.VAL, 7),
    op(Opcode.SATURATING_SUB, 2),
    op(Opcode.ADD, 2),
    op(Opcode.VAL, 8),
    op(Opcode.MUL, 2),
    op(Opcode.VAL, 9),
    op(Opcode.DIV, 2),
    op(Opcode.MUL, 2),
    op(Opcode.VAL, 8),
    op(Opcode.DIV, 2),
    op(Opcode.VAL, arg(0)),
    op(Opcode.VAL, 3),
    op(Opcode.DIV, 2),
    op(Opcode.VAL, arg(1)),
    op(Opcode.VAL, 3),
    op(Opcode.DIV, 2),
    op(Opcode.SATURATING_SUB, 2),
    op(Opcode.VAL, 6),
    op(Opcode.VAL, arg(1)),
    op(Opcode.VAL, 3),
    op(Opcode.DIV, 2),
    op(Opcode.SATURATING_SUB, 2),
    op(Opcode.SATURATING_SUB, 2),
    op(Opcode.VAL, 6),
    op(Opcode.VAL, 7),
    op(Opcode.SATURATING_SUB, 2),
    op(Opcode.MUL, 2),
    op(Opcode.ADD, 2),
    op(Opcode.VAL, arg(3)),
    op(Opcode.MUL, 2),
    op(Opcode.VAL, arg(0)),
    op(Opcode.VAL, 3),
    op(Opcode.DIV, 2),
    op(Opcode.VAL, arg(1)),
    op(Opcode.VAL, 3),
    op(Opcode.DIV, 2),
    op(Opcode.SATURATING_SUB, 2),
    op(Opcode.VAL, arg(0)),
    op(Opcode.VAL, 3),
    op(Opcode.DIV, 2),
    op(Opcode.VAL, 7),
    op(Opcode.SATURATING_SUB, 0),
    op(Opcode.VAL, arg(1)),
    op(Opcode.VAL, 3),
    op(Opcode.DIV, 2),
    op(Opcode.ADD, 2),
    op(Opcode.VAL, 8),
    op(Opcode.MUL, 2),
    op(Opcode.VAL, 9),
    op(Opcode.DIV, 2),
    op(Opcode.MUL, 2),
    op(Opcode.VAL, 8),
    op(Opcode.DIV, 2),
    op(Opcode.VAL, arg(3)),
    op(Opcode.MUL, 2),
    op(Opcode.EAGER_IF),
    op(Opcode.VAL, arg(2)),
    op(Opcode.VAL, arg(0)),
    op(Opcode.VAL, 3),
    op(Opcode.DIV, 2),
    op(Opcode.VAL, arg(1)),
    op(Opcode.VAL, 3),
    op(Opcode.DIV, 2),
    op(Opcode.SATURATING_SUB, 2),
    op(Opcode.MUL, 2),
    op(Opcode.ADD, 2),
  ])
];

  return {
    sources: sources1,
    constants: constants1,
    argumentsLength: 4,
    stackLength: ((sources1[0].length + sources1[1].length) / 2) + 20,
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
