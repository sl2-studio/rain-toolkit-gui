<script>
import { ethers } from 'ethers'
import { signer } from 'svelte-ethers-store'
import { balanceTierFactory, GatedSingleEditionCreator } from '../stores';
import { BALANCE_TIER_FACTORY_ADDRESS, GATED_SINGLE_EDITION_CREATOR } from '../constants';

import ERC20BalanceTierFactoryArtifact from '../abis/ERC20BalanceTierFactory.json'
import GatedSingleEditionCreatorArtifact from '../abis/ApprovingSingleEditionMintableCreator.json'

$: if ($signer) { setContracts() }

const setContracts = () => {
    const _balanceTierFactory = new ethers.Contract(BALANCE_TIER_FACTORY_ADDRESS, ERC20BalanceTierFactoryArtifact.abi)
    balanceTierFactory.set(_balanceTierFactory.connect($signer))
    GatedSingleEditionCreator.set(new ethers.Contract(GATED_SINGLE_EDITION_CREATOR, GatedSingleEditionCreatorArtifact.abi))
}

</script>