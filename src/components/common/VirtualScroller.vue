<template>
    <div ref="parentRef" class="flex h-full w-full flex-col overflow-y-auto">
        <slot name="before" />
        <div
            :style="{
                height: `${totalSize}px`,
            }"
            class="relative w-full"
            v-if="data.length > 0">
            <div
                class="absolute top-0 left-0 w-full p-2"
                :style="{
                    transform: `translateY(${virtualRows[0]?.start ?? 0}px)`,
                }">
                <div
                    v-for="row in virtualRows"
                    :key="row.key.toString()"
                    :data-index="row.index"
                    :ref="(ref) => measureElement(ref as Element | null)">
                    <slot :item="data[row.index]" :index="row.index" />
                </div>
            </div>
        </div>
        <div v-else class="card m-2 flex-row p-2 text-sm">
            {{ $t('noContent') }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual'
import { computed, nextTick, ref } from 'vue'

const parentRef = ref<HTMLElement | null>(null)

const props = withDefaults(
    defineProps<{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: any[]
        size?: number
        overscan?: number
    }>(),
    {
        data: () => [],
        size: 64,
        overscan: 24,
    },
)
const virtualOptions = computed(() => ({
    count: props.data.length,
    getScrollElement: (): HTMLElement | null => parentRef.value,
    estimateSize: (): number => props.size,
    overscan: props.overscan,
}))

const rowVirtualizer = useVirtualizer(virtualOptions)
const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems())
const totalSize = computed(() => rowVirtualizer.value.getTotalSize())

const measureElement = (el: Element | null): void => {
    if (!el) {
        return
    }

    nextTick(() => {
        rowVirtualizer.value.measureElement(el)
    })

    return undefined
}
</script>
