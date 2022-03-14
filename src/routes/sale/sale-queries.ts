import { operationStore } from "@urql/svelte";

let saleContractAddress, sender

export const myTxQuery = operationStore(
    `
      query ($saleContractAddress: Bytes!, $sender: Bytes!) {
        saleTransactions (where: {saleContractAddress: $saleContractAddress, sender: $sender}, orderBy: timestamp, orderDirection: asc) {
          id
          __typename
          timestamp
          transactionHash
          saleContractAddress
          saleContract {
            cooldownDuration
            token {
              id
              name
              symbol
              decimals
            }
            reserve {
              id
              name
              symbol
              decimals
            }
          }
          receipt {
            id
            receiptId
            fee
            units
            price
            feeRecipient
          }
          ... on SaleBuy {
            refunded
            totalIn
          }
          ... on SaleRefund {
            totalOut
          }
        }
      }
    `,
    {
        saleContractAddress,
        sender,
    },
    {
        requestPolicy: "network-only",
    }
);

export const allTxQuery = operationStore(
    `
      query ($saleContractAddress: Bytes!) {
        saleTransactions (where: {saleContractAddress: $saleContractAddress}, orderBy: timestamp, orderDirection: asc) {
          id
          __typename
          timestamp
          transactionHash
          saleContractAddress
          saleContract {
            cooldownDuration
            token {
              id
              name
              symbol
              decimals
            }
            reserve {
              id
              name
              symbol
              decimals
            }
          }
          receipt {
            id
            receiptId
            fee
            units
            price
            feeRecipient
          }
          ... on SaleBuy {
            refunded
            totalIn
          }
          ... on SaleRefund {
            totalOut
          }
        }
      }
    `,
    {
        saleContractAddress
    },
    {
        requestPolicy: "network-only",
    }
);
