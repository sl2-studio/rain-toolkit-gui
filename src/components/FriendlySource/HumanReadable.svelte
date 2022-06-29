<script lang="ts">
  import { calculatePriceConfig, canEndConfig } from "../../routes/sale/sale";
  import {
    HumanFriendlySource,
    CombineTierGenerator,
    SaleDurationInTimestamp,
    EmissionsConfig,
    StateConfig,
    LinearEmissions,
    SequentialEmissions,
  } from "rain-sdk";

  export let FriendlySource, signer, contractType;
  let startConfig,
    endConfig,
    priceConfig,
    combineTierSource,
    emissionsSource,
    emissionsType,
    errorMsg,
    err = false;

  $: {
    if (contractType.toLowerCase() === "emissions") {
      try {
        if (FriendlySource.emissionsType) {
          err = false;
          emissionsType = FriendlySource.emissionsType;

          let emissionsConfig: EmissionsConfig = emissionsType.value
            ? {
                tierAddress: FriendlySource.tierAddress,
                blockTime: FriendlySource.blockTime,
                period: FriendlySource.period,
                periodicRewards: {
                  tier1: FriendlySource.tier1,
                  tier2: FriendlySource.tier2,
                  tier3: FriendlySource.tier3,
                  tier4: FriendlySource.tier4,
                  tier5: FriendlySource.tier6,
                  tier6: FriendlySource.tier6,
                  tier7: FriendlySource.tier7,
                  tier8: FriendlySource.tier8,
                },
                maxPeriodicRewards: {
                  tier1: FriendlySource.maxTier1,
                  tier2: FriendlySource.maxTier2,
                  tier3: FriendlySource.maxTier3,
                  tier4: FriendlySource.maxTier4,
                  tier5: FriendlySource.maxTier6,
                  tier6: FriendlySource.maxTier6,
                  tier7: FriendlySource.maxTier7,
                  tier8: FriendlySource.maxTier8,
                },
                numberOfIncrements: FriendlySource.numberOfIncrements,
              }
            : {
                tierAddress: FriendlySource.tierAddress,
                blockTime: FriendlySource.blockTime,
                period: FriendlySource.period,
                periodicRewards: {
                  tier1: FriendlySource.tier1,
                  tier2: FriendlySource.tier2,
                  tier3: FriendlySource.tier3,
                  tier4: FriendlySource.tier4,
                  tier5: FriendlySource.tier6,
                  tier6: FriendlySource.tier6,
                  tier7: FriendlySource.tier7,
                  tier8: FriendlySource.tier8,
                },
              };
          let vmStateConfig: StateConfig;
          if (emissionsType.value) {
            vmStateConfig = new SequentialEmissions(emissionsConfig);
          }
          if (!emissionsType.value) {
            vmStateConfig = new LinearEmissions(emissionsConfig);
          }

          emissionsSource = HumanFriendlySource.get(vmStateConfig, {
            contract: "emissions",
            pretty: true,
          });
        } else {
          err = true;
          errorMsg = "Select Emission Type";
        }
      } catch (error) {
        console.log(error);

        errorMsg = error;
        err = true;
      }
    }
    if (contractType.toLowerCase() === "combinetier") {
      try {
        combineTierSource = HumanFriendlySource.get(
          new CombineTierGenerator(FriendlySource.tierContractOne).combineWith(
            FriendlySource.tierContractTwo,
            FriendlySource.logicValue,
            FriendlySource.modeValue
          ),
          { contract: "combineTier", pretty: true }
        );
      } catch (error) {
        errorMsg = error;
        err = true;
      }
    }
    if (contractType.toLowerCase() === "sale") {
      try {
        startConfig = HumanFriendlySource.get(
          FriendlySource.saleParam.creatorControlMode
            ? new SaleDurationInTimestamp(
                FriendlySource.saleParam.inputValues.startTimestamp
              ).applyOwnership(signer)
            : new SaleDurationInTimestamp(
                FriendlySource.saleParam.inputValues.startTimestamp
              ),
          { contract: "sale", pretty: true }
        );

        endConfig = HumanFriendlySource.get(
          canEndConfig(FriendlySource.saleParam, signer),
          {
            contract: "sale",
            pretty: true,
          }
        );

        priceConfig =
          FriendlySource.startTimestamp && FriendlySource.endTimestamp
            ? HumanFriendlySource.get(
                calculatePriceConfig(FriendlySource.saleParam),
                {
                  contract: "sale",
                  pretty: true,
                }
              )
            : "Select Start & End Time ";
      } catch (error) {
        console.log(error);
        errorMsg = error;
        err = true;
      }
    }
  }
</script>

<div class="flex w-full flex-col gap-y-4">
  <div class="flex flex-col justify-between">
    {#if contractType.toLowerCase() === "sale" && !err}
      <span class="break-words pt-2 pb-2 whitespace-pre text">
        {startConfig}
      </span>
      <span class="break-words pt-2 pb-2 whitespace-pre text">
        {endConfig}
      </span>
      <span class="break-words pt-2 pb-2 whitespace-pre text">
        {priceConfig}
      </span>
    {/if}
    {#if contractType.toLowerCase() === "combinetier" && !err}
      <span class="break-words pt-2 pb-2 whitespace-pre text">
        {combineTierSource}
      </span>
    {/if}
    {#if contractType.toLowerCase() === "emissions" && !err}
      <span class="break-words pt-2 pb-2 whitespace-pre text">
        {emissionsSource}
      </span>
    {/if}
    {#if err}
      {errorMsg}
    {/if}
  </div>
</div>

<style>
  .text {
    white-space: break-spaces;
  }
</style>
