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