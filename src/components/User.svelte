<script>
    import DisplayAddress from './DisplayAddress.svelte'
    import Jazzicon from './Jazzicon.svelte'
    
    export let address
    export let label = null
    
    export let name
    export let avatar
    
    </script>
    
    <div class="flex flex-col space-y-2">
        {#if label}
        <span class="text-2xs font-medium uppercase text-gray-400 leading-none">{label}</span>
        {/if}
        <div class="flex flex-row space-x-2 items-center font-light">
            {#if !name && !avatar}
            <Jazzicon address={address} width=24/>
            <DisplayAddress address={address}/>
            {/if}
            {#if avatar}
                <img alt="user avatar" src={avatar} class="mr-2" style="width:24px" />
            {/if}
            {#if name}
                {name}
            {/if}
        </div>
    </div>