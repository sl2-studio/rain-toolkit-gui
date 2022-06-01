import { operationStore } from "@urql/svelte";

let saleAddress, depositor, signerAddress

// export const myDepositQuery = operationStore(
//   `
//       query ($saleAddress: Bytes!, $depositor: Bytes!) {
//         redeemableEscrowSupplyTokenDeposits (where: {iSaleAddress: $saleAddress, depositorAddress: $depositor}, orderBy: totalDeposited, orderDirection: asc) {
//           id
//           escrowAddress
//           depositorAddress
//           iSale{
//             saleStatus
//           }
//           iSaleAddress
//           token {
//             id
//             name
//             symbol
//             decimals
//           }
//           deposits{
//             tokenAmount
//             depositorAddress
//           }
//           redeemableSupply
//           totalDeposited
//           totalRemaining
//         }
//       }
//     `,
//   {
//     saleAddress,
//     depositor,
//   },
//   {
//     requestPolicy: "network-only",
//   }
// );

// export const allDepositQuery = operationStore(
//   `
//       query ($saleAddress: Bytes!) {
//         redeemableEscrowSupplyTokenDeposits (where: {iSaleAddress: $saleAddress}, orderBy: totalDeposited, orderDirection: asc) {
//           id
//           escrowAddress
//           iSale{
//             saleStatus
//           }
//           iSaleAddress
//           token {
//             id
//             name
//             symbol
//             decimals
//           }
//           deposits{
//             tokenAmount
//             depositorAddress
//           }
//           redeemableSupply
//           totalDeposited
//           totalRemaining

//         }
//       }
//     `,
//   {
//     saleAddress
//   },
//   {
//     requestPolicy: "network-only",
//   }
// );

export const allDepositQuery = operationStore(
  `
      query ($saleAddress: Bytes!) {
        redeemableEscrowSupplyTokenWithdrawers (where: {iSaleAddress: $saleAddress}, orderBy: redeemableBalance, orderDirection: asc) {
          id
          withdrawerAddress
          totalWithdrawn
          totalWithdrawnAgainst
          redeemableBalance
          claimable
          deposit{
            redeemableSupply
            token {
              id
              name
              symbol
              decimals
            }
          }
        }
      }
    `,
  {
    saleAddress
  },
  {
    requestPolicy: "network-only",
  }
);

export const myDepositQuery = operationStore(
  `
      query ($saleAddress: Bytes!, $signerAddress: Bytes!) {
        redeemableEscrowSupplyTokenWithdrawers (where: {iSaleAddress: $saleAddress, withdrawerAddress: $signerAddress}, orderBy: redeemableBalance, orderDirection: asc) {
          id
          withdrawerAddress
          totalWithdrawn
          totalWithdrawnAgainst
          redeemableBalance
          claimable
          deposit{
            token {
              id
              name
              symbol
              decimals
            }
          }
        }
      }
    `,
  {
    saleAddress,
    signerAddress
  },
  {
    requestPolicy: "network-only",
  }
);

export const allPendingDepositQuery = operationStore(
  `
      query ($saleAddress: Bytes!) {
        redeemableEscrowPendingDepositorTokens (where: {iSaleAddress: $saleAddress}, orderBy: totalDeposited, orderDirection: asc) {
          id
          depositorAddress
          escrowAddress
          iSale{
            saleStatus
          }
          iSaleAddress
          token {
            id
            name
            symbol
            decimals
          }
          totalDeposited
          swept
        }
      }
    `,
  {
    saleAddress
  },
  {
    requestPolicy: "network-only",
  }
);

export const myPendingDepositQuery = operationStore(
  `
      query ($saleAddress: Bytes!, $depositor: Bytes!) {
        redeemableEscrowPendingDepositorTokens (where: {iSaleAddress: $saleAddress, depositorAddress: $depositor}, orderBy: totalDeposited, orderDirection: asc) {
          id
          depositorAddress
          escrowAddress
          iSale{
            saleStatus
          }
          iSaleAddress
          token {
            id
            name
            symbol
            decimals
          }
          totalDeposited
          swept
        }
      }
    `,
  {
    saleAddress,
    depositor,
  },
  {
    requestPolicy: "network-only",
  }
);

export const allUndepositQuery = operationStore(
  `
      query ($saleAddress: Bytes!) {
        redeemableEscrowSupplyTokenDepositors (where: {iSaleAddress: $saleAddress}, orderBy: totalDeposited, orderDirection: asc) {
          id
          iSaleAddress
          iSale{
            saleStatus
          }
          escrowAddress
          depositorAddress
          token {
            id
            name
            symbol
            decimals
          }
          redeemableSupply
          totalDeposited
          totalRemaining
        }
      }
    `,
  {
    saleAddress
  },
  {
    requestPolicy: "network-only",
  }
);

export const myUndepositQuery = operationStore(
  `
      query ($saleAddress: Bytes!, $depositor: Bytes!) {
        redeemableEscrowSupplyTokenDepositors (where: {iSaleAddress: $saleAddress, depositorAddress: $depositor}, orderBy: totalDeposited, orderDirection: asc) {
          id
          iSaleAddress
          iSale{
            saleStatus
          }
          escrowAddress
          depositorAddress
          token {
            id
            name
            symbol
            decimals
          }
          redeemableSupply
          totalDeposited
          totalRemaining
        }
      }
    `,
  {
    saleAddress,
    depositor,
  },
  {
    requestPolicy: "network-only",
  }
);