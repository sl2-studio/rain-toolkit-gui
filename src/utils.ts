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