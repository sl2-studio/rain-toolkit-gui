<script>
import SidebarLink from "../components/SidebarLink.svelte";
import SidebarLinkGroup from "../components/SidebarLinkGroup.svelte";
</script>
<div class="border-r border-gray-700 w-80 min-h-screen">
<div class="flex flex-col gap-y-3 p-5  sticky top-16 self-start">
    <SidebarLinkGroup label="BalanceTier" url="/balancetier/*">
        <SidebarLink url="/balancetier/deploy">
            Deploy a BalanceTier
        </SidebarLink>

        <SidebarLink url="/balancetier/report/">
            Check a BalanceTier Report
        </SidebarLink>

        <SidebarLink url="/balancetier/list">
            Browse deployed BalanceTiers
        </SidebarLink>
    </SidebarLinkGroup>

    <SidebarLinkGroup label="Gated Editions" url="/gatededition/*">
        <SidebarLink url="/gatededition/deploy/">
            Deploy a Gated Edition
        </SidebarLink>

        <SidebarLink url="/gatededition/mint/">
            Mint an NFT for a Gated Edition
        </SidebarLink>
    </SidebarLinkGroup>
</div>
</div>
