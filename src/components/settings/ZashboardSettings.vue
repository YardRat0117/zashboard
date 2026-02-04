<template>
    <!-- dashboard -->
    <div v-if="hasVisibleItems" class="max-full relative flex flex-col gap-2 p-4 text-sm">
        <div class="settings-title">
            <div class="indicator">
                <a href="https://github.com/YardRat0117/zashboard" target="_blank" title="访问 zashboard 仓库">
                    <span>zashboard</span>
                </a>
                <template v-if="zashboardVersion || commitId">
                    <span class="text-sm font-normal">
                        <a
                            v-if="zashboardVersion"
                            :href="`https://github.com/YardRat0117/zashboard/releases/tag/${zashboardVersion}`"
                            target="_blank"
                            :title="`查看版本 ${zashboardVersion}`">
                            {{ zashboardVersion }}
                        </a>
                    </span>
                    <span class="text-sm font-normal" v-if="zashboardVersion && commitId">&nbsp;@&nbsp;</span>
                    <span class="text-sm font-normal">
                        <a
                            v-if="commitId"
                            :href="`https://github.com/YardRat0117/zashboard/commit/${commitId}`"
                            target="_blank"
                            :title="`查看提交 ${commitId}`">
                            {{ commitId }}
                        </a>
                    </span>
                </template>
            </div>
        </div>
        <div class="settings-grid">
            <LanguageSelect v-if="!hiddenSettingsItems[`${SETTINGS_MENU_KEY.panel}.zashboardSettings.language`]" />
            <div v-if="!hiddenSettingsItems[`${SETTINGS_MENU_KEY.panel}.zashboardSettings.fonts`]" class="setting-item">
                <div class="setting-item-label">
                    {{ $t('fonts') }}
                </div>
                <select class="select select-sm w-48" v-model="font">
                    <option v-for="opt in fonts" :key="opt" :value="opt">
                        {{ opt }}
                    </option>
                </select>
            </div>
            <div
                v-if="!hiddenSettingsItems[`${SETTINGS_MENU_KEY.panel}.zashboardSettings.customBackgroundURL`]"
                class="setting-item">
                <div class="setting-item-label">
                    {{ $t('customBackgroundURL') }}
                </div>
                <div class="join">
                    <TextInput
                        class="join-item w-38"
                        v-model="customBackgroundURL"
                        :clearable="true"
                        @update:modelValue="handlerBackgroundURLChange" />
                    <button class="btn join-item btn-sm" @click="handlerClickUpload">
                        <ArrowUpTrayIcon class="h-4 w-4" />
                    </button>
                </div>
                <button
                    class="btn btn-circle join-item btn-sm"
                    v-if="customBackgroundURL"
                    @click="displayBgProperty = !displayBgProperty">
                    <AdjustmentsHorizontalIcon class="h-4 w-4" />
                </button>
                <input ref="inputFileRef" type="file" accept="image/*" class="hidden" @change="handlerFileChange" />
            </div>
            <template
                v-if="
                    customBackgroundURL &&
                    displayBgProperty &&
                    !hiddenSettingsItems[`${SETTINGS_MENU_KEY.panel}.zashboardSettings.transparent`]
                ">
                <div class="setting-item">
                    <div class="setting-item-label">
                        {{ $t('transparent') }}
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        v-model="dashboardTransparent"
                        class="range max-w-64"
                        @touchstart.passive.stop
                        @touchmove.passive.stop
                        @touchend.passive.stop />
                </div>
            </template>
            <template
                v-if="
                    customBackgroundURL &&
                    displayBgProperty &&
                    !hiddenSettingsItems[`${SETTINGS_MENU_KEY.panel}.zashboardSettings.blurIntensity`]
                ">
                <div class="setting-item">
                    <div class="setting-item-label">
                        {{ $t('blurIntensity') }}
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="40"
                        v-model="blurIntensity"
                        class="range max-w-64"
                        @touchstart.stop
                        @touchmove.stop
                        @touchend.stop />
                </div>
            </template>
            <div
                v-if="!hiddenSettingsItems[`${SETTINGS_MENU_KEY.panel}.zashboardSettings.defaultTheme`]"
                class="setting-item">
                <div class="setting-item-label">
                    {{ $t('theme') }}
                </div>
                <div class="join">
                    <ThemeSelector class="w-38!" v-model:value="theme" />
                    <button class="btn btn-sm join-item" @click="customThemeModal = !customThemeModal">
                        <PlusIcon class="h-4 w-4" />
                    </button>
                </div>
                <CustomTheme v-model:value="customThemeModal" />
            </div>
        </div>
        <div
            v-if="
                !hiddenSettingsItems[`${SETTINGS_MENU_KEY.panel}.zashboardSettings.exportSettings`] ||
                !hiddenSettingsItems[`${SETTINGS_MENU_KEY.panel}.zashboardSettings.importSettings`]
            "
            class="mt-4 grid max-w-3xl grid-cols-2 gap-2 gap-y-3 md:grid-cols-4">
            <button
                v-if="!hiddenSettingsItems[`${SETTINGS_MENU_KEY.panel}.zashboardSettings.exportSettings`]"
                class="btn btn-sm"
                @click="exportSettings">
                {{ $t('exportSettings') }}
            </button>
            <ImportSettings
                v-if="!hiddenSettingsItems[`${SETTINGS_MENU_KEY.panel}.zashboardSettings.importSettings`]" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { zashboardVersion } from '@/api'
import LanguageSelect from '@/components/settings/LanguageSelect.vue'
import { FONTS, SETTINGS_MENU_KEY } from '@/constant'
import { deleteBase64FromIndexedDB, LOCAL_IMAGE, saveBase64ToIndexedDB } from '@/helper/indexeddb'
import { exportSettings } from '@/helper/utils'
import {
    blurIntensity,
    customBackgroundURL,
    dashboardTransparent,
    font,
    hiddenSettingsItems,
    theme,
} from '@/store/settings'
import { AdjustmentsHorizontalIcon, ArrowUpTrayIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { computed, ref, watch } from 'vue'
import ImportSettings from '../common/ImportSettings.vue'
import TextInput from '../common/TextInput.vue'
import CustomTheme from './CustomTheme.vue'
import ThemeSelector from './ThemeSelector.vue'

const customThemeModal = ref(false)

// 检查是否有可见的子项
const hasVisibleItems = computed(() => {
    return (
        !hiddenSettingsItems.value[`${SETTINGS_MENU_KEY.panel}.zashboardSettings.language`] ||
        !hiddenSettingsItems.value[`${SETTINGS_MENU_KEY.panel}.zashboardSettings.fonts`] ||
        !hiddenSettingsItems.value[`${SETTINGS_MENU_KEY.panel}.zashboardSettings.customBackgroundURL`] ||
        (customBackgroundURL.value &&
            displayBgProperty.value &&
            !hiddenSettingsItems.value[`${SETTINGS_MENU_KEY.panel}.zashboardSettings.transparent`]) ||
        (customBackgroundURL.value &&
            displayBgProperty.value &&
            !hiddenSettingsItems.value[`${SETTINGS_MENU_KEY.panel}.zashboardSettings.blurIntensity`]) ||
        !hiddenSettingsItems.value[`${SETTINGS_MENU_KEY.panel}.zashboardSettings.defaultTheme`] ||
        !hiddenSettingsItems.value[`${SETTINGS_MENU_KEY.panel}.zashboardSettings.darkTheme`] ||
        !hiddenSettingsItems.value[`${SETTINGS_MENU_KEY.panel}.zashboardSettings.autoSwitchTheme`] ||
        !hiddenSettingsItems.value[`${SETTINGS_MENU_KEY.panel}.zashboardSettings.autoUpgrade`] ||
        !hiddenSettingsItems.value[`${SETTINGS_MENU_KEY.panel}.zashboardSettings.upgradeUI`] ||
        !hiddenSettingsItems.value[`${SETTINGS_MENU_KEY.panel}.zashboardSettings.exportSettings`] ||
        !hiddenSettingsItems.value[`${SETTINGS_MENU_KEY.panel}.zashboardSettings.importSettings`]
    )
})
const displayBgProperty = ref(false)
const commitId = __COMMIT_ID__

watch(customBackgroundURL, (value) => {
    if (value) {
        displayBgProperty.value = true
    }
})

const inputFileRef = ref()
const handlerClickUpload = (): void => {
    inputFileRef.value?.click()
}
const handlerBackgroundURLChange = (): void => {
    if (!customBackgroundURL.value.includes(LOCAL_IMAGE)) {
        deleteBase64FromIndexedDB()
    }
}

const handlerFileChange = (e: Event): void => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (): void => {
        customBackgroundURL.value = LOCAL_IMAGE + '-' + Date.now()
        saveBase64ToIndexedDB(reader.result as string)
    }
    reader.readAsDataURL(file)
}

const fonts = computed(() => {
    const mode = import.meta.env.MODE

    if (Object.values(FONTS).includes(mode as FONTS)) {
        return [mode]
    }

    return Object.values(FONTS)
})
</script>
