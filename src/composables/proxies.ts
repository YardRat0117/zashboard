import { GLOBAL, PROXY_TAB_TYPE } from '@/constant'
import { isHiddenGroup } from '@/helper'
import { configs } from '@/store/config'
import { proxiesTabShow, proxyGroupList, proxyMap, proxyProviderList } from '@/store/proxies'
import { customGlobalNode, displayGlobalByMode, manageHiddenGroup } from '@/store/settings'
import { isEmpty } from 'lodash'
import { computed, ref } from 'vue'

const filterGroups = (all: string[]): string[] => {
    if (manageHiddenGroup.value) {
        return all
    }

    return all.filter((name) => !isHiddenGroup(name))
}

const getRenderGroups = (): string[] => {
    if (isEmpty(proxyMap.value)) {
        return []
    }

    if (proxiesTabShow.value === PROXY_TAB_TYPE.PROVIDER) {
        return proxyProviderList.value.map((group) => group.name)
    }

    if (displayGlobalByMode.value) {
        if (configs.value?.mode.toUpperCase() === GLOBAL) {
            return [proxyMap.value[customGlobalNode.value] ? customGlobalNode.value : GLOBAL]
        }

        return filterGroups(proxyGroupList.value)
    }

    return filterGroups([...proxyGroupList.value, GLOBAL])
}

export const disableProxiesPageScroll = ref(false)
export const isProxiesPageMounted = ref(false)
export const renderGroups = computed(() => {
    const groups = getRenderGroups()

    if (isProxiesPageMounted.value) {
        return groups
    }

    return groups.slice(0, 16)
})
