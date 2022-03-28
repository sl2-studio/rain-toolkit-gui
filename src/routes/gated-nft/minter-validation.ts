import { isAddress } from "ethers/lib/utils";

export const defaultValidator = () => {
  return true;
};

export const tierValidate = (value) => {
  if (value == "") {
    return { error: "Can't be blank" };
  }
  if (!isAddress(value)) {
    return { error: "Not a valid Ethereum address" };
  }
  return true;
};

export const nameValidate = (value) => {
  if (value == "") {
    return { error: "Can't be blank" };
  }
  return true;
};

export const symbolValidate = (value) => {
  if (value == "") {
    return { error: "Can't be blank" };
  }
  return true;
};

export const descriptionValidate = (value) => {
  if (value == "") {
    return { error: "Can't be blank" };
  }
  return true;
};

export const animationUrlValidate = (value) => {
  if (value !== "") {
    let url;
    try {
      url = new URL(value);
      if (
        !(
          url.protocol === "http:" ||
          url.protocol === "https:" ||
          url.protocol === "ipfs:"
        )
      ) {
        throw "not a valid url";
      }
    } catch (_) {
      return { error: "Not a valid URL" };
    }
  }
  return true;
};

export const imageUrlValidate = (value) => {
  if (value == "") {
    return { error: "Can't be blank" };
  }
  let url;
  try {
    url = new URL(value);
    if (
      !(
        url.protocol === "http:" ||
        url.protocol === "https:" ||
        url.protocol === "ipfs:"
      )
    ) {
      throw "not a valid url";
    }
  } catch (_) {
    return { error: "Not a valid URL" };
  }
  return true;
};

export const royaltyPercentValidate = (value) => {
  if (value === "") {
    return { error: "Can't be blank" };
  }
  if (isNaN(value)) {
    return { error: "Must be a number" };
  }
  return true;
};

export const minimumStatusValidate = (value) => {
  if (value == "") {
    return { error: "Can't be blank" };
  }
  if (isNaN(value)) {
    return { error: "Must be a number" };
  }
  if (!Number.isInteger(parseFloat(value))) {
    return { error: "Must be a whole number between 1 and 8" };
  }
  if (
    Number.isInteger(parseFloat(value)) &&
    (parseInt(value) > 8 || parseInt(value) < 1)
  ) {
    return { error: "Must be a number between 1 and 8" };
  }
  return true;
};
