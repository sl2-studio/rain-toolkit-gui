<script lang="ts">
  import {
    calculatePriceConfig,
    getSaleDuration,
    getBuyWalletCap,
  } from "../../routes/sale/sale";
  import {
    HumanFriendlySource,
    CombineTierGenerator,
    EmissionsConfig,
    StateConfig,
    LinearEmissions,
    SequentialEmissions,
  } from "rain-sdk";

  export let FriendlySource, signer, contractType;
  let saleConfig,
    saleDurationConfig,
    buyCapConfig,
    priceConfig,
    combineTierSource,
    emissionsSource,
    emissionsType,
    errorMsg,
    err = false;

  $: {
    // if (contractType.toLowerCase() === "emissions") {
    //   try {
    //     emissionsType = FriendlySource.emissionsType;

    //     let emissionsConfig: EmissionsConfig = emissionsType.value
    //       ? {
    //           tierAddress: FriendlySource.tierAddress,
    //           blockTime: FriendlySource.blockTime,
    //           period: FriendlySource.period,
    //           periodicRewards: {
    //             tier1: FriendlySource.tier1,
    //             tier2: FriendlySource.tier2,
    //             tier3: FriendlySource.tier3,
    //             tier4: FriendlySource.tier4,
    //             tier5: FriendlySource.tier6,
    //             tier6: FriendlySource.tier6,
    //             tier7: FriendlySource.tier7,
    //             tier8: FriendlySource.tier8,
    //           },
    //           maxPeriodicRewards: {
    //             tier1: FriendlySource.maxTier1,
    //             tier2: FriendlySource.maxTier2,
    //             tier3: FriendlySource.maxTier3,
    //             tier4: FriendlySource.maxTier4,
    //             tier5: FriendlySource.maxTier6,
    //             tier6: FriendlySource.maxTier6,
    //             tier7: FriendlySource.maxTier7,
    //             tier8: FriendlySource.maxTier8,
    //           },
    //           numberOfIncrements: FriendlySource.numberOfIncrements,
    //         }
    //       : {
    //           tierAddress: FriendlySource.tierAddress,
    //           blockTime: FriendlySource.blockTime,
    //           period: FriendlySource.period,
    //           periodicRewards: {
    //             tier1: FriendlySource.tier1,
    //             tier2: FriendlySource.tier2,
    //             tier3: FriendlySource.tier3,
    //             tier4: FriendlySource.tier4,
    //             tier5: FriendlySource.tier6,
    //             tier6: FriendlySource.tier6,
    //             tier7: FriendlySource.tier7,
    //             tier8: FriendlySource.tier8,
    //           },
    //         };
    //     let vmStateConfig: StateConfig;
    //     if (emissionsType.value) {
    //       vmStateConfig = new SequentialEmissions(emissionsConfig);
    //     }
    //     if (!emissionsType.value) {
    //       vmStateConfig = new LinearEmissions(emissionsConfig);
    //     }

    //     emissionsSource = HumanFriendlySource.get(vmStateConfig, {
    //       contract: "emissions",
    //       pretty: true,
    //     });
    //   } catch (error) {
    //     console.log(error);

    //     errorMsg = error;
    //     err = true;
    //   }
    // }
    if (contractType.toLowerCase() === "combinetier") {
      try {
        combineTierSource = HumanFriendlySource.prettify(
          HumanFriendlySource.get(
            new CombineTierGenerator(
              FriendlySource.tierContractOne
            ).combineWith(
              FriendlySource.tierContractTwo,
              FriendlySource.logicValue,
              FriendlySource.modeValue
            )
          )
        );
      } catch (error) {
        errorMsg = error;
        err = true;
      }
    }
    if (contractType.toLowerCase() === "sale") {
      saleConfig = async () => {
        try {
          saleDurationConfig = HumanFriendlySource.prettify(
            HumanFriendlySource.get(
              await getSaleDuration(FriendlySource.saleParam, signer)
            )
          );
        } catch (error) {
          console.log(error);
          saleDurationConfig = error;
        }

        try {
          buyCapConfig = HumanFriendlySource.prettify(
            HumanFriendlySource.get(
              await getBuyWalletCap(FriendlySource.saleParam)
            )
          );
        } catch (error) {
          buyCapConfig = error;
        }

        try {
          priceConfig =
            FriendlySource.startTimestamp && FriendlySource.endTimestamp
              ? HumanFriendlySource.prettify(
                  HumanFriendlySource.get(
                    await calculatePriceConfig(FriendlySource.saleParam)
                  )
                )
              : "Select Sale's Start & End Date/Time To Show Price Script";
        } catch (error) {
          priceConfig = error;
        }
      };
      saleConfig();
    }
  }
</script>

<div class="flex w-full flex-col gap-y-4">
  <div class="flex flex-col justify-between">
    {#if contractType.toLowerCase() === "sale" && !err}
      <span class="break-words pt-2 pb-2 whitespace-pre text">
        <span class="text-gray-400">Can Live Script:</span><br />
        {saleDurationConfig}
      </span>
      <span class="break-words pt-2 pb-2 whitespace-pre text">
        <span class="text-gray-400">Buy Wallet Script:</span><br />
        {buyCapConfig}
      </span>
      <span class="break-words pt-2 pb-2 whitespace-pre text">
        <span class="text-gray-400">Price Script:</span><br />
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
