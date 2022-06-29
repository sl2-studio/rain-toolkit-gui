<script>
  import { getContext } from "svelte";
  import { signerAddress } from "svelte-ethers-store";
  import Connect from "../components/Connect.svelte";
  import User from "../components/User.svelte";
  import WalletConnect from "../components/wallet-connect/WalletConnect.svelte";

  const { open } = getContext("simple-modal");

  const handleConnect = () => {
    // open(Connect);
  };
</script>

<div
  class="sticky top-0 z-40 flex h-16 w-full flex-row items-center justify-between border-b border-gray-700 bg-gray-900 px-5"
>
  <div class="flex flex-row gap-x-3">
    <img src="/assets/logo.svg" alt="Rain Logo" class="w-7" />
    <span class="text-xl font-light text-gray-50">Rain UI Toolkit</span>
  </div>
  <div class="flex flex-row items-center gap-x-4">
    <WalletConnect />
    <span>
      <a
        href="https://github.com/beehive-innovation/rain-toolkit-gui"
        target="_blank"
      >
        <img src="/assets/github.svg" alt="Rain Logo" class="w-7" /></a
      >
    </span>
  </div>
</div>
