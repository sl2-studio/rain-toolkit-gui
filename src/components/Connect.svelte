<script>
import { ethers } from 'ethers'
import { connected, provider, signer, signerAddress, defaultEvmStores, chainId} from 'svelte-ethers-store'

</script>

<button class="bg-gray-700 border-none px-4 py-2 rounded-md text-gray-200" on:click={()=>{defaultEvmStores.setProvider()}}>Connect</button>