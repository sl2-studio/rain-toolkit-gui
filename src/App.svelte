<script lang="ts" type="module">
  import ListGatedNFTs from "./routes/gated-nft/ListGatedNFTs.svelte";
  import ERC721BalanceTierReport from "./routes/erc721-balance-tier/ERC721BalanceTierReport.svelte";
  import { connected } from "svelte-ethers-store";
  import Router from "svelte-spa-router";
  import DeployBalanceTier from "./routes/erc20-balance-tier/DeployBalanceTier.svelte";
  import BalanceTierReport from "./routes/erc20-balance-tier/BalanceTierReport.svelte";
  import Home from "./routes/Home.svelte";
  import DeployGatedNFT from "./routes/gated-nft/DeployGatedNFT.svelte";
  import MintNft from "./routes/gated-nft/MintNFT.svelte";
  import Header from "./layout/Header.svelte";
  import Sidebar from "./layout/Sidebar.svelte";
  import ListBalanceTier from "./routes/erc20-balance-tier/ListBalanceTier.svelte";
  import DeployCombineTier from "./routes/combine-tier/DeployCombineTier.svelte";
  import CombineTierReport from "./routes/combine-tier/CombineTierReport.svelte";
  import Deploy721BalanceTier from "./routes/erc721-balance-tier/Deploy721BalanceTier.svelte";
  import DeploySale from "./routes/sale/DeploySale.svelte";
  import PurchaseSale from "./routes/sale/PurchaseSale.svelte";
  import DeployEmissions from "./routes/emissions-erc20/DeployEmissions.svelte";
  import ClaimEmissions from "./routes/emissions-erc20/ClaimEmissions.svelte";
  import { initClient } from "@urql/svelte";
  import Modal from "svelte-simple-modal";
  import { fly } from "svelte/transition";
  import DeployVerify from "./routes/verify/DeployVerify.svelte";
  import AdministerVerify from "./routes/verify/AdministerVerify.svelte";

  const client = initClient({
    url: "https://api.thegraph.com/subgraphs/name/beehive-innovation/rain-protocol-v2_1-mumbai",
  });

  let routes = {};

  routes = {
    // Using named parameters, with last being optional
    "/balancetier/deploy": DeployBalanceTier,
    "/balancetier/report/*": BalanceTierReport,
    "/balancetier/list": ListBalanceTier,

    "/721balancetier/deploy": Deploy721BalanceTier,
    "/721balancetier/report/*": ERC721BalanceTierReport,
    "/721balancetier/list": ListBalanceTier,

    "/combinetier/deploy": DeployCombineTier,
    "/combinetier/report/*": CombineTierReport,

    "/gatednft/deploy/*": DeployGatedNFT,
    "/gatednft/list": ListGatedNFTs,
    "/gatednft/mint/*": MintNft,

    "/sale/deploy": DeploySale,
    "/sale/purchase/*": PurchaseSale,

    "/emissions/deploy": DeployEmissions,
    "/emissions/claim/*": ClaimEmissions,

    "/verify/deploy": DeployVerify,
    "/verify/administer/*": AdministerVerify,

    "/": Home,

    // Catch-all
    // This is optional, but if present it must be the last
    // '*': NotFound,
  };
</script>

<Modal
  unstyled={true}
  closeButton={false}
  classWindow="relative max-w-full max-h-full my-2 mx-auto text-white rounded-xl shadow-md bg-gray-800"
  classBg="fixed top-0 left-0 w-screen h-screen flex flex-col justify-center bg-gray-900 bg-opacity-75 z-50 backdrop-blur"
  classWindowWrap="relative m-2 max-h-full flex flex-col"
  classContent="p-6"
>
  <Header />
  <main class="relative flex text-gray-50">
    <Sidebar />
    <div class="w-full py-5 px-8">
      {#if $connected}
        <Router {routes} />
      {:else}
        Connect your wallet to get started.
      {/if}
    </div>
  </main>
</Modal>

<style global lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
