import { writable } from "svelte/store";
import { networks } from "./constants";

export const selectedNetwork = writable(networks[1])


