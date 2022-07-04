import { ethers } from "ethers";

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

export const verifyStatusNames = [
    "None",
    "Added",
    "Approved",
    "Banned"
]

export const verifyRequestStatusNames = [
    "None",
    "Added",
    "Approved",
    "Banned"
]

export enum VerifyStatuses {
    NONE,
    ADDED,
    APPROVED,
    BANNED
}