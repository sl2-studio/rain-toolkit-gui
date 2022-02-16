import { BigNumber, Contract, ethers } from "ethers";
import type { BytesLike } from "ethers";
import { concat, Hexable, hexlify, zeroPad } from "ethers/lib/utils";
import ReserveTokenArtifact from './abis/ReserveToken.json'

export const getNewChildFromReceipt = (receipt, parentContract) => {
  return ethers.utils.defaultAbiCoder.decode(
    ['address', 'address'],
    receipt.events.filter(event => 
      event.event == 'NewChild' && event.address.toUpperCase() == parentContract.address.toUpperCase())
      [0].data,
  )[1]
}

/**
 * Utility function that transforms a hexadecimal number from the output of the ITier contract report
 * @param report String with Hexadecimal containing the array data
 * @returns number[] Block array of the reports
 */
export function tierReport(report: string): number[] {
  const parsedReport: number[] = [];
  const arrStatus = [0, 1, 2, 3, 4, 5, 6, 7]
    .map((i) =>
      BigInt(report)
        .toString(16)
        .padStart(64, "0")
        .slice(i * 8, i * 8 + 8)
    )
    .reverse();
  //arrStatus = arrStatus.reverse();

  for (const i in arrStatus) {
    parsedReport.push(parseInt("0x" + arrStatus[i]));
  }

  return parsedReport;
}

export function formatAddress(address) {
  let formatted = address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length)
  return formatted
}

/**
 * Converts an opcode and operand to bytes, and returns their concatenation.
 * @param code - the opcode
 * @param erand - the operand, currently limited to 1 byte (defaults to 0)
 */
export function op(code: number, erand = 0): Uint8Array {
  return concat([bytify(code), bytify(erand)]);
}

/**
 * Converts a value to raw bytes representation. Assumes `value` is less than or equal to 1 byte, unless a desired `bytesLength` is specified.
 *
 * @param value - value to convert to raw bytes format
 * @param bytesLength - (defaults to 1) number of bytes to left pad if `value` doesn't completely fill the desired amount of memory. Will throw `InvalidArgument` error if value already exceeds bytes length.
 * @returns {Uint8Array} - raw bytes representation
 */
export function bytify(
  value: number | BytesLike | Hexable,
  bytesLength = 1
): BytesLike {
  return zeroPad(hexlify(value), bytesLength);
}

export const paddedUInt256 = (report: BigNumber): string => {
  if (report.gt(ethers.constants.MaxUint256)) {
    throw new Error(`${report} exceeds max uint256`);
  }
  return "0x" + report.toHexString().substring(2).padStart(64, "0");
};

export const paddedUInt32 = (number: number | BytesLike | Hexable): string => {
  if (ethers.BigNumber.from(number).gt(ethers.constants.MaxUint256)) {
    throw new Error(`${number} exceeds max uint32`);
  }
  return hexlify(number).substring(2).padStart(8, "0");
};

export function arg(valIndex: number): number {
  let arg = 1;
  arg <<= 7;
  arg += valIndex;
  return arg;
}

export function tierRange(startTier: number, endTier: number): number {
  //   op_.val & 0x0f, //     00001111
  //   op_.val & 0xf0, //     11110000

  if (startTier < 0 || startTier > 8) {
    throw new Error(`Invalid startTier ${startTier}`);
  } else if (endTier < 0 || endTier > 8) {
    throw new Error(`Invalid endTier ${endTier}`);
  }
  let range = endTier;
  range <<= 4;
  range += startTier;
  return range;
}

/**
 * Constructs the operand for RainVM's `call` opcode by packing 3 numbers into a single byte. All parameters use zero-based counting i.e. an `fnSize` of 0 means to allocate one element (32 bytes) on the stack to define your functions, while an `fnSize` of 3 means to allocate all four elements (4 * 32 bytes) on the stack.
 *
 * @param sourceIndex - index of function source in `immutableSourceConfig.sources`
 * @param loopSize - number of times to subdivide vals, reduces uint size but allows for more vals (range 0-7)
 * @param valSize - number of vals in outer stack (range 0-7)
 */
 export function callSize(
  sourceIndex: number,
  loopSize: number,
  valSize: number
): number {
  // CallSize(
  //   op_.val & 0x07,      // 00000111
  //   op_.val >> 3 & 0x03, // 00011000
  //   op_.val >> 5 & 0x07  // 11100000
  // )

  if (sourceIndex < 0 || sourceIndex > 7) {
    throw new Error("Invalid fnSize");
  } else if (loopSize < 0 || loopSize > 3) {
    throw new Error("Invalid loopSize");
  } else if (valSize < 0 || valSize > 7) {
    throw new Error("Invalid valSize");
  }
  let callSize = valSize;
  callSize <<= 2;
  callSize += loopSize;
  callSize <<= 3;
  callSize += sourceIndex;
  return callSize;
}

export function selectLte(logic: number, mode: number, length: number): number {
  let lte = logic;
  lte <<= 2;
  lte += mode;
  lte <<= 5;
  lte += length;
  return lte;
}

export enum selectLteLogic {
  every,
  any,
}

export enum selectLteMode {
  min,
  max,
  first,
}

export const getERC20 = async (erc20Address, signer) => {
  let erc20AddressError, erc20Contract, erc20name, erc20symbol, erc20balance, erc20decimals, erc20totalSupply

  if (ethers.utils.isAddress(erc20Address)) {
    erc20AddressError = null
    erc20Contract = new ethers.Contract(erc20Address, ReserveTokenArtifact.abi)
    erc20Contract = erc20Contract.connect(signer)
    try {
      console.log(signer)
      erc20name = await erc20Contract.name()
      erc20symbol = await erc20Contract.symbol()
      erc20balance = await erc20Contract.balanceOf(signer._address)
      erc20decimals = await erc20Contract.decimals()
      erc20totalSupply = await erc20Contract.totalSupply()
      return {
        erc20Contract,
        erc20name,
        erc20symbol,
        erc20balance,
        erc20decimals,
        erc20AddressError,
        erc20totalSupply
      }
    } catch (error) {
      console.log(error)
      erc20AddressError = 'not a valid ERC20 token address'
    }
  } else {
    erc20AddressError = 'not a valid address'
  }
}

export const validateFields = (fields: any[]) => {
  let fieldValues: any = {}
  const validations = Object.keys(fields).map(key => {
    const validationResult = fields[key].validate()
    fieldValues[key] = validationResult.value
    return validationResult
  })
  return {
    validationResult: validations.every(validation => validation.ok),
    fieldValues
  }
}

// to split a timestamp into the separate components
export function splitTime(timestamp) {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerWeek = msPerDay * 7;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  let weeks = Math.floor(timestamp/msPerWeek)
  let lessWeeks = timestamp % msPerWeek
  let days = Math.floor(lessWeeks/msPerDay)
  let lessDays = lessWeeks % msPerDay
  let hours = Math.floor(lessDays/msPerHour)
  let lessHours = lessDays % msPerHour
  let minutes = Math.floor(lessHours/msPerMinute)
  let lessMinutes = lessHours % msPerMinute
  let seconds = Math.floor(lessMinutes/1000)

  return [weeks, days, hours, minutes, seconds]
}

export function timeString(timestamp, options?) {
  const timeArray = splitTime(Math.abs(timestamp))
  const weeks = timeArray[0] ? timeArray[0] + 'w ' : ''
  const days = timeArray[1] ? timeArray[1] + 'd ' : ''
  const hours = timeArray[2] ? timeArray[2] + 'h ' : ''
  const minutes = timeArray[3] ? timeArray[3] + 'm ' : ''
  const seconds = timeArray[4] ? timeArray[4] + 's' : ''

  const strings = new Map([
      ['wdhms', weeks + days + hours + minutes + seconds],
      ['wdhm', weeks + days + hours + minutes],
      ['wdh', weeks + days + hours],
      ['wd', weeks + days],
      ['w', weeks],
  ])

  return strings.get(options) || weeks + days + hours + minutes + seconds
}