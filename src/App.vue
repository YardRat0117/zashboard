<template>
    <div
        ref="app"
        id="app-content"
        :class="[
            'bg-base-100 flex h-dvh w-screen overflow-hidden',
            fontClassName,
            backgroundImage && `custom-background-${dashboardTransparent} custom-background bg-cover bg-center`,
            blurClass,
        ]"
        :style="backgroundImage">
        <RouterView />
        <div
            ref="toast"
            class="toast-sm toast toast-end toast-top z-9999 max-w-80 text-sm md:max-w-96 md:translate-y-8" />
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type Ref, watch } from 'vue'
import { RouterView } from 'vue-router'
import { autoImportSettings, importSettingsFromUrl } from './helper/autoImportSettings'
import { backgroundImage } from './helper/indexeddb'
import { initNotification } from './helper/notification'
import { getBackendFromUrl } from './helper/utils'
import { blurIntensity, dashboardTransparent, theme } from './store/settings'
import { activeUuid, backendList } from './store/setup'
import type { Backend } from './types'

// Init notification
const toast = ref<HTMLElement>()
initNotification(toast as Ref<HTMLElement>)

// Hard-encoded System Font
const fontClassName = 'font-SystemUI-NotoEmoji'

// Switch to existing backend
const isSameBackend = (b1: Omit<Backend, 'uuid'>, b2: Omit<Backend, 'uuid'>): boolean => {
    return (
        b1.host === b2.host &&
        b1.port === b2.port &&
        b1.password === b2.password &&
        b1.protocol === b2.protocol &&
        b1.secondaryPath === b2.secondaryPath
    )
}
const autoSwitchToURLBackendIfExists = (): void => {
    const backend = getBackendFromUrl()

    if (backend) {
        for (const b of backendList.value) {
            if (isSameBackend(b, backend)) {
                activeUuid.value = b.uuid
                return
            }
        }
    }
}
autoSwitchToURLBackendIfExists()

// Semi-transparency when background image is loaded
const blurClass = computed(() => {
    if (!backgroundImage.value || blurIntensity.value === 0) {
        return ''
    }

    return `blur-intensity-${blurIntensity.value}`
})

// Synchronize settings
onMounted(() => {
    if (autoImportSettings.value) {
        importSettingsFromUrl()
    }
})

// Apply theme
onMounted(() => {
    watch(
        theme,
        () => {
            document.body.setAttribute('data-theme', theme.value)
        },
        {
            immediate: true,
        },
    )
})
</script>
