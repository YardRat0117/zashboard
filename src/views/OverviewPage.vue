<template>
    <div class="h-full overflow-x-hidden overflow-y-auto">
        <OverviewCtrl />
        <div class="flex flex-col gap-1 p-2">
            <component v-for="item in visibleCards" :key="item" :is="cardComponents[item.card]" />
        </div>
    </div>
</template>

<script setup lang="ts">
import ChartsCard from '@/components/overview/ChartsCard.vue'
import ConnectionHistory from '@/components/overview/ConnectionHistory.vue'
import NetworkCard from '@/components/overview/NetworkCard.vue'
import ProviderTrafficOverview from '@/components/overview/ProviderTrafficOverview.vue'
import RuleHitCountCard from '@/components/overview/RuleHitCountCard.vue'
import TopologyCharts from '@/components/overview/TopologyCharts.vue'
import OverviewCtrl from '@/components/sidebar/OverviewCtrl.vue'
import { overviewCardOrder } from '@/store/settings'
import type { Component } from 'vue'
import { computed } from 'vue'

const visibleCards = computed(() => {
    return overviewCardOrder.value.filter((card) => card.visible)
})

const cardComponents: Record<string, Component> = {
    ChartsCard,
    NetworkCard,
    ProviderTrafficOverview,
    TopologyCharts,
    ConnectionHistory,
    RuleHitCountCard,
}
</script>
