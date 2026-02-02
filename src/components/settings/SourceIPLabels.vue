<template>
    <div class="flex items-center gap-2">
        {{ $t('sourceIPLabels') }}
        <template v-if="sourceIPLabelList.length">({{ sourceIPLabelList.length }})</template>
        <button v-if="sourceIPLabelList.length" class="btn btn-sm btn-circle" @click="dialogVisible = !dialogVisible">
            <ChevronUpIcon v-if="dialogVisible" class="h-4 w-4" />
            <ChevronDownIcon v-else class="h-4 w-4" />
        </button>
    </div>
    <SourceIPInput v-model="newLabelForIP" @keydown.enter="handlerLabelAdd">
        <template #prefix>
            <TagIcon class="h-4 w-4 shrink-0" />
        </template>
        <template #default>
            <button class="btn btn-circle btn-sm" @click="handlerLabelAdd">
                <PlusIcon class="h-4 w-4" />
            </button>
        </template>
    </SourceIPInput>
</template>

<script setup lang="ts">
import { sourceIPLabelList } from '@/store/settings'
import type { SourceIPLabel } from '@/types'
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, TagIcon } from '@heroicons/vue/24/outline'
import { useSessionStorage } from '@vueuse/core'
import { v4 as uuid } from 'uuid'
import { ref } from 'vue'
import SourceIPInput from './SourceIPInput.vue'

const dialogVisible = useSessionStorage('cache/sourceip-label-dialog-visible', false)
const newLabelForIP = ref<Omit<SourceIPLabel, 'id'>>({
    key: '',
    label: '',
})

const handlerLabelAdd = (): void => {
    if (!newLabelForIP.value.key || !newLabelForIP.value.label) {
        return
    }

    dialogVisible.value = true
    sourceIPLabelList.value.push({
        ...newLabelForIP.value,
        id: uuid(),
    })

    newLabelForIP.value = {
        key: '',
        label: '',
    }
}
</script>
