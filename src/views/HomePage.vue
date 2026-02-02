<template>
    <div
        class="bg-base-200/50 home-page flex size-full"
        :class="isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'">
        <SideBar />

        <RouterView v-slot="{ Component }">
            <div class="relative flex-1 overflow-auto">
                <Component :is="Component" />
            </div>
        </RouterView>

        <DialogWrapper v-model="autoSwitchBackendDialog">
            <div class="mb-2">
                {{ $t('currentBackendUnavailable') }}
            </div>
            <div class="flex justify-end gap-2">
                <button class="btn btn-sm" @click="autoSwitchBackendDialog = false">
                    {{ $t('cancel') }}
                </button>
                <button class="btn btn-primary btn-sm" @click="autoSwitchBackend">
                    {{ $t('confirm') }}
                </button>
            </div>
        </DialogWrapper>
    </div>
</template>

<script setup lang="ts">
import { isBackendAvailable } from '@/api'
import DialogWrapper from '@/components/common/DialogWrapper.vue'
import SideBar from '@/components/sidebar/SideBar.vue'
import { PROXY_TAB_TYPE } from '@/constant'
import { showNotification } from '@/helper/notification'
import { getLabelFromBackend } from '@/helper/utils'
import { fetchConfigs } from '@/store/config'
import { initConnections } from '@/store/connections'
import { initLogs } from '@/store/logs'
import { initSatistic } from '@/store/overview'
import { fetchProxies, proxiesTabShow } from '@/store/proxies'
import { fetchRules } from '@/store/rules'
import { isSidebarCollapsed } from '@/store/settings'
import { activeBackend, activeUuid, backendList } from '@/store/setup'
import type { Backend } from '@/types'
import { useDocumentVisibility } from '@vueuse/core'
import { ref, watch } from 'vue'
import { RouterView } from 'vue-router'

watch(
    activeUuid,
    () => {
        if (!activeUuid.value) return
        proxiesTabShow.value = PROXY_TAB_TYPE.PROXIES
        fetchConfigs()
        fetchProxies()
        fetchRules()
        initConnections()
        initLogs()
        initSatistic()
    },
    {
        immediate: true,
    },
)

const autoSwitchBackendDialog = ref(false)

const autoSwitchBackend = async (): Promise<void> => {
    const otherEnds = backendList.value.filter((end) => end.uuid !== activeUuid.value)

    autoSwitchBackendDialog.value = false
    const avaliable = await Promise.race<Backend>(
        otherEnds.map((end) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject()
                }, 10000)
                isBackendAvailable(end).then((res) => {
                    if (res) {
                        resolve(end)
                    }
                })
            })
        }),
    )

    if (avaliable) {
        activeUuid.value = avaliable.uuid
        showNotification({
            content: 'backendSwitchTo',
            params: {
                backend: getLabelFromBackend(avaliable),
            },
        })
    }
}

const documentVisible = useDocumentVisibility()

watch(
    documentVisible,
    async () => {
        if (!activeBackend.value || backendList.value.length < 2 || documentVisible.value !== 'visible') {
            return
        }
        try {
            const activeBackendUuid = activeBackend.value.uuid
            const isAvailable = await isBackendAvailable(activeBackend.value)

            if (activeBackendUuid !== activeUuid.value) {
                return
            }

            if (!isAvailable) {
                autoSwitchBackendDialog.value = true
            }
        } catch {
            autoSwitchBackendDialog.value = true
        }
    },
    {
        immediate: true,
    },
)

watch(documentVisible, () => {
    if (documentVisible.value !== 'visible') return
    fetchProxies()
})
</script>
