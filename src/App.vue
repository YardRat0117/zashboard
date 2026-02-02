<script setup lang="ts">
import { computed, onMounted, ref, type Ref, watch } from 'vue'
import { RouterView } from 'vue-router'
import { useKeyboard } from './composables/keyboard'
import { autoImportSettings, importSettingsFromUrl } from './helper/autoImportSettings'
import { backgroundImage } from './helper/indexeddb'
import { initNotification } from './helper/notification'
import { getBackendFromUrl, isPreferredDark } from './helper/utils'
import { blurIntensity, dashboardTransparent, disablePullToRefresh, theme } from './store/settings'
import { activeUuid, backendList } from './store/setup'
import type { Backend } from './types'

const app = ref<HTMLElement>()
const toast = ref<HTMLElement>()

initNotification(toast as Ref<HTMLElement>)

// Hard-encoded System Font
const fontClassName = 'font-SystemUI-NotoEmoji'

const setThemeColor = (): void => {
    const themeColor = getComputedStyle(app.value!).getPropertyValue('background-color').trim()
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', themeColor)
    }
}

watch(isPreferredDark, setThemeColor)

watch(
    disablePullToRefresh,
    () => {
        const body = document.body
        if (disablePullToRefresh.value) {
            body.style.overscrollBehavior = 'none'
            body.style.overflow = 'hidden'
        } else {
            body.style.overscrollBehavior = ''
            body.style.overflow = ''
        }
    },
    {
        immediate: true,
    },
)

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

onMounted(() => {
    if (autoImportSettings.value) {
        importSettingsFromUrl()
    }
    watch(
        theme,
        () => {
            document.body.setAttribute('data-theme', theme.value)
            setThemeColor()
        },
        {
            immediate: true,
        },
    )
})

const blurClass = computed(() => {
    if (!backgroundImage.value || blurIntensity.value === 0) {
        return ''
    }

    return `blur-intensity-${blurIntensity.value}`
})

useKeyboard()
</script>

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
