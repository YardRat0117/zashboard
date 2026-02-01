import { NOT_CONNECTED } from '@/constant'
import { isProxyGroup } from '@/helper'
import { getLatencyByName } from '@/store/proxies'
import { hideUnavailableProxies } from '@/store/settings'
import { computed, type ComputedRef } from 'vue'

export function useRenderProxies(proxies: ComputedRef<string[]>, proxyGroup?: string) {
    const renderProxies = computed(() => {
        return getRenderProxies(proxies.value, proxyGroup)
    })
    const availableProxies = computed(() => {
        return renderProxies.value.filter((proxy) => getLatencyByName(proxy, proxyGroup) !== NOT_CONNECTED).length
    })

    const proxiesCount = computed(() => {
        const all = proxies.value.length

        return `${availableProxies.value}/${all}`
    })

    return {
        renderProxies,
        proxiesCount,
    }
}

const getRenderProxies = (proxies: string[], groupName?: string) => {
    const latencyMap = new Map<string, number>()

    proxies = [...proxies]
    proxies.forEach((name) => {
        latencyMap.set(name, getLatencyByName(name, groupName))
    })

    if (hideUnavailableProxies.value) {
        proxies = proxies.filter((name) => {
            return isProxyGroup(name) || latencyMap.get(name)! > NOT_CONNECTED
        })
    }

    return proxies
}
