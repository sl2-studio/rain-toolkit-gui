<script>
  import { link } from "svelte-spa-router";
  import active from "svelte-spa-router/active";

  export let url = "";
</script>

<div>
  <a class="font-light text-gray-400" use:link={url} use:active><slot /></a>
</div>

<style global lang="postcss">
  a.active {
    @apply text-white;
  }
</style>
