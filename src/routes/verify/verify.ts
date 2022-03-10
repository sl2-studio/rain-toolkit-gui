import { operationStore } from "@urql/svelte";
import { Contract, ethers } from "ethers";

export const roles = [
    {
        label: "Approver Admin",
        value: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("APPROVER_ADMIN")),
    },
    {
        label: "Approver",
        value: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("APPROVER")),
    },
    {
        label: "Remover Admin",
        value: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("REMOVER_ADMIN")),
    },
    {
        label: "Remover",
        value: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("REMOVER")),
    },
    {
        label: "Banner Admin",
        value: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BANNER_ADMIN")),
    },
    {
        label: "Banner",
        value: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BANNER")),
    },
];

let verifyAddress, verifyContractAddress

export const verifyAddresses = operationStore(`
query ($verifyAddress: Bytes!) {
    verify (id: $verifyAddress ) {
        id
        verifyAddresses {
          address
          requestStatus
          status
          roles
        }
      }
}`,
    {
        verifyAddress,
    },
    {
        requestPolicy: "network-only",
    })

export const verifyAddressQuery = operationStore(`
query ($verifyAddress:Bytes!, $verifyContractAddress:Bytes!) 
{
    verifyEvents
    (
        where:
        {
            account:$verifyAddress,
            verifyContract:$verifyContractAddress
        },
        orderBy: timestamp,
        orderDirection:asc
        )
    {
        id
        timestamp
        transactionHash
        __typename
        sender
        account
        data
    }
}`,
    { verifyAddress, verifyContractAddress },
    {
        requestPolicy: "network-only",
    }
)

export const verifyStatusNames = [
    "None",
    "Approved",
    "Banned",
    "Removed"
]

export const verifyRequestStatusNames = [
    "None",
    "Approve",
    "Ban",
    "Remove"
]

export enum VerifyStatuses {
    NONE,
    APPROVE,
    BAN,
    REMOVE
}