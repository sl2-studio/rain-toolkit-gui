import { isAddress } from "ethers/lib/utils"

export const addressValidate = (value) : true | {error: string} => {
    if (value == "") {
        return { error: "Can't be blank" }
    }
    if (!isAddress(value)) {
        return { error: "Not a valid Ethereum address" }
    }
    return true
}