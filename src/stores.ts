
import { writable, get } from "svelte/store";
import { getClient } from "@urql/svelte";
import { networks } from "./constants";

export const selectedNetwork = writable(networks[1]);

