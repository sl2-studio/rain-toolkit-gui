import { Contract, ethers } from "ethers";

export const getNewChildFromReceipt = (receipt, parentContract) => {
    return ethers.utils.hexZeroPad(
        ethers.utils.hexStripZeros(
          receipt.events?.filter(
            (x) => x.event == "NewChild" && x.address.toUpperCase() == parentContract.address.toUpperCase()
          )[0].topics[0]
        ),
        20 // address bytes length
      )
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