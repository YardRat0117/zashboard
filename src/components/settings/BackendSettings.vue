<template>
  <!-- backend -->
  <div
    v-if="hasVisibleItems"
    class="flex flex-col gap-2 p-4 text-sm"
  >
    <div class="settings-title">
      <div class="indicator">
        <a
          class="flex cursor-pointer items-center gap-2"
          href="https://github.com/metacubex/mihomo"
          target="_blank"
        >
          {{ $t('backend') }}
          <BackendVersion class="text-sm font-normal" />
        </a>
      </div>
    </div>
    <BackendSwitch v-if="!hiddenSettingsItems[`${SETTINGS_MENU_KEY.backend}.backendSwitch`]" />

    <template v-if="configs && !hiddenSettingsItems[`${SETTINGS_MENU_KEY.backend}.ports`]">
      <div class="divider"></div>
      <div
        class="grid max-w-3xl gap-2 gap-x-6"
        :style="`grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));`"
      >
        <div
          class="setting-item"
          v-for="portConfig in portList"
          :key="portConfig.key"
        >
          <div class="setting-item-label">
            {{ $t(portConfig.label) }}
          </div>
        </div>
      </div>
      <div
        class="grid max-w-3xl gap-2 gap-x-6"
        :style="`grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));`"
      >
        <div
          v-if="configs?.tun && !hiddenSettingsItems[`${SETTINGS_MENU_KEY.backend}.tunMode`]"
          class="setting-item"
        >
          <div class="setting-item-label">
            {{ $t('tunMode') }}
          </div>
        </div>
        <div
          v-if="!hiddenSettingsItems[`${SETTINGS_MENU_KEY.backend}.allowLan`]"
          class="setting-item"
        >
          <div class="setting-item-label">
            {{ $t('allowLan') }}
          </div>
        </div>
      </div>
    </template>

    <div
      v-if="!hiddenSettingsItems[`${SETTINGS_MENU_KEY.backend}.actions`]"
      class="divider"
    ></div>

    <div
      v-if="!hiddenSettingsItems[`${SETTINGS_MENU_KEY.backend}.actions`]"
      class="grid max-w-6xl gap-2 gap-y-3"
      :style="`grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));`"
    >
      <template v-if="displayAllFeatures">
        <button
          class="btn btn-sm"
          @click="handlerClickRestartCore"
        >
          <span
            v-if="isCoreRestarting"
            class="loading loading-spinner loading-md"
          ></span>
          {{ $t('restartCore') }}
        </button>
        <button
          class="btn btn-sm"
          @click="handlerClickReloadConfigs"
        >
          <span
            v-if="isConfigReloading"
            class="loading loading-spinner loading-md"
          ></span>
          {{ $t('reloadConfigs') }}
        </button>
        <button
          class="btn btn-sm"
          @click="handlerClickUpdateGeo"
        >
          <span
            v-if="isGeoUpdating"
            class="loading loading-spinner loading-md"
          ></span>
          {{ $t('updateGeoDatabase') }}
        </button>
      </template>
      <button
        class="btn btn-sm"
        @click="handleFlushDNSCache"
      >
        {{ $t('flushDNSCache') }}
      </button>
      <button
        class="btn btn-sm"
        @click="handleFlushFakeIP"
      >
        {{ $t('flushFakeIP') }}
      </button>
    </div>
    <div
      v-if="!hiddenSettingsItems[`${SETTINGS_MENU_KEY.backend}.dnsQuery`]"
      class="divider"
    ></div>
    <DnsQuery v-if="!hiddenSettingsItems[`${SETTINGS_MENU_KEY.backend}.dnsQuery`]" />
  </div>
</template>

<script setup lang="ts">
import { flushDNSCacheAPI, flushFakeIPAPI, reloadConfigsAPI, updateGeoDataAPI } from '@/api'
import BackendVersion from '@/components/common/BackendVersion.vue'
import BackendSwitch from '@/components/settings/BackendSwitch.vue'
import DnsQuery from '@/components/settings/DnsQuery.vue'
import { SETTINGS_MENU_KEY } from '@/constant'
import { showNotification } from '@/helper/notification'
import { configs, fetchConfigs } from '@/store/config'
import { fetchProxies } from '@/store/proxies'
import { checkUpgradeCore, displayAllFeatures, hiddenSettingsItems } from '@/store/settings'
import { activeBackend } from '@/store/setup'
import { computed, ref } from 'vue'

// 检查是否有可见的子项
const hasVisibleItems = computed(() => {
  return (
    !hiddenSettingsItems.value[`${SETTINGS_MENU_KEY.backend}.backendSwitch`] ||
    (configs.value && !hiddenSettingsItems.value[`${SETTINGS_MENU_KEY.backend}.ports`]) ||
    (configs.value &&
      configs.value?.tun &&
      !hiddenSettingsItems.value[`${SETTINGS_MENU_KEY.backend}.tunMode`]) ||
    (configs.value && !hiddenSettingsItems.value[`${SETTINGS_MENU_KEY.backend}.allowLan`]) ||
    (configs.value &&
      !activeBackend.value?.disableUpgradeCore &&
      !hiddenSettingsItems.value[`${SETTINGS_MENU_KEY.backend}.checkUpgrade`]) ||
    (configs.value &&
      !activeBackend.value?.disableUpgradeCore &&
      checkUpgradeCore.value &&
      !hiddenSettingsItems.value[`${SETTINGS_MENU_KEY.backend}.autoUpgrade`]) ||
    !hiddenSettingsItems.value[`${SETTINGS_MENU_KEY.backend}.actions`] ||
    !hiddenSettingsItems.value[`${SETTINGS_MENU_KEY.backend}.dnsQuery`]
  )
})

const portList = [
  {
    label: 'mixedPort',
    key: 'mixed-port',
  },
  {
    label: 'httpPort',
    key: 'port',
  },
  {
    label: 'socksPort',
    key: 'socks-port',
  },
  {
    label: 'redirPort',
    key: 'redir-port',
  },
  {
    label: 'tproxyPort',
    key: 'tproxy-port',
  },
]

const reloadAll = () => {
  fetchConfigs()
  fetchProxies()
}

const isCoreRestarting = ref(false)
const handlerClickRestartCore = async () => {
  if (isCoreRestarting.value) return
  isCoreRestarting.value = true
  try {
    setTimeout(() => {
      reloadAll()
    }, 500)
    isCoreRestarting.value = false
    showNotification({
      content: 'restartCoreSuccess',
      type: 'alert-success',
    })
  } catch {
    isCoreRestarting.value = false
  }
}

const isConfigReloading = ref(false)
const handlerClickReloadConfigs = async () => {
  if (isConfigReloading.value) return
  isConfigReloading.value = true
  try {
    await reloadConfigsAPI()
    reloadAll()
    isConfigReloading.value = false
    showNotification({
      content: 'reloadConfigsSuccess',
      type: 'alert-success',
    })
  } catch {
    isConfigReloading.value = false
  }
}

const isGeoUpdating = ref(false)
const handlerClickUpdateGeo = async () => {
  if (isGeoUpdating.value) return
  isGeoUpdating.value = true
  try {
    await updateGeoDataAPI()
    reloadAll()
    isGeoUpdating.value = false
    showNotification({
      content: 'updateGeoSuccess',
      type: 'alert-success',
    })
  } catch {
    isGeoUpdating.value = false
  }
}

const handleFlushDNSCache = async () => {
  await flushDNSCacheAPI()
  showNotification({
    content: 'flushDNSCacheSuccess',
    type: 'alert-success',
  })
}

const handleFlushFakeIP = async () => {
  await flushFakeIPAPI()
  showNotification({
    content: 'flushFakeIPSuccess',
    type: 'alert-success',
  })
}
</script>
