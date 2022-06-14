<script>
  import DisplayAddress from "./DisplayAddress.svelte";
  import Jazzicon from "./Jazzicon.svelte";

  export let address;
  export let label = null;

  export let name;
  export let avatar;
  export let network;
</script>

<div class="flex flex-col space-y-2">
  {#if label}
    <span class="text-2xs font-medium uppercase leading-none text-gray-400"
      >{label}</span
    >
  {/if}
  <div class="flex flex-row items-center space-x-2 font-light">
    {#if !name && !avatar}
      <Jazzicon {address} width="24" />
      <span class="space-x-2">{network.toUpperCase()}</span>
      - <DisplayAddress {address} />
    {/if}
    {#if avatar}
      <img alt="user avatar" src={avatar} class="mr-2" style="width:24px" />
    {/if}
    {#if name}
      {name}
    {/if}
  </div>
</div>
