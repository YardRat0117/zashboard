import { ROUTE_NAME } from '@/constant'
import { showNotification } from '@/helper/notification'
import { getUrlFromBackend } from '@/helper/utils'
import router from '@/router'
import { activeBackend, activeUuid } from '@/store/setup'
import type { Backend, Config, DNSQuery, Proxy, ProxyProvider, Rule } from '@/types'
import type { AxiosResponse } from 'axios'
import axios, { AxiosError } from 'axios'
import { debounce } from 'lodash'
import ReconnectingWebSocket from 'reconnectingwebsocket'
import { nextTick, ref, watch } from 'vue'

axios.interceptors.request.use((config) => {
    config.baseURL = getUrlFromBackend(activeBackend.value!)
    config.headers['Authorization'] = 'Bearer ' + activeBackend.value?.password
    return config
})

const ignoreNotificationUrls = ['/delay', '/weights']

axios.interceptors.response.use(
    null,
    (
        error: AxiosError<{
            message: string
        }>,
    ) => {
        if (error.status === 401 && activeUuid.value) {
            const currentBackendUuid = activeUuid.value
            activeUuid.value = null
            router.push({
                name: ROUTE_NAME.setup,
                query: { editBackend: currentBackendUuid },
            })
            nextTick(() => {
                showNotification({
                    content: 'unauthorizedTip',
                })
            })
        } else if (!ignoreNotificationUrls.some((url) => error.config?.url?.endsWith(url))) {
            const errorMessage = error.response?.data?.message || error.message

            showNotification({
                key: errorMessage,
                content: `${error.config?.url} \n${errorMessage}`,
                type: 'alert-error',
            })
            return Promise.reject(error)
        }

        return error
    },
)

export const version = ref()
export const fetchVersionAPI = (): Promise<AxiosResponse<{ version: string }>> => {
    return axios.get<{ version: string }>('/version')
}
export const zashboardVersion = ref(__APP_VERSION__)

watch(
    activeBackend,
    async (val) => {
        if (val) {
            const { data } = await fetchVersionAPI()
            version.value = data?.version || ''
        }
    },
    { immediate: true },
)

export const fetchProxiesAPI = (): Promise<AxiosResponse<{ proxies: Record<string, Proxy> }>> => {
    return axios.get<{ proxies: Record<string, Proxy> }>('/proxies')
}

export const fetchProxyLatencyAPI = (
    proxyName: string,
    url: string,
    timeout: number,
): Promise<AxiosResponse<{ delay: number }>> => {
    return axios.get<{ delay: number }>(`/proxies/${encodeURIComponent(proxyName)}/delay`, {
        params: {
            url,
            timeout,
        },
    })
}

export const fetchProxyGroupLatencyAPI = (
    proxyName: string,
    url: string,
    timeout: number,
): Promise<AxiosResponse<Record<string, number>>> => {
    return axios.get<Record<string, number>>(`/group/${encodeURIComponent(proxyName)}/delay`, {
        params: {
            url,
            timeout,
        },
    })
}

export const fetchProxyProviderAPI = (): Promise<AxiosResponse<{ providers: Record<string, ProxyProvider> }>> => {
    return axios.get<{
        providers: Record<string, ProxyProvider>
    }>('/providers/proxies')
}

export const proxyProviderHealthCheckAPI = (name: string): Promise<AxiosResponse<Record<string, number>>> => {
    return axios.get<Record<string, number>>(`/providers/proxies/${encodeURIComponent(name)}/healthcheck`, {
        timeout: 15000,
    })
}

export const fetchRulesAPI = (): Promise<AxiosResponse<{ rules: Rule[] }>> => {
    return axios.get<{ rules: Rule[] }>('/rules')
}

export const updateRuleProviderAPI = (name: string): Promise<AxiosResponse<unknown>> => {
    return axios.put(`/providers/rules/${encodeURIComponent(name)}`)
}

// Reserved since they're connection-specific
export const disconnectByIdAPI = (id: string) => {
    return axios.delete(`/connections/${id}`)
}
export const disconnectAllAPI = () => {
    return axios.delete('/connections')
}

export const getConfigsAPI = () => {
    return axios.get<Config>('/configs')
}

// Reserved since they're cache-specific
export const flushFakeIPAPI = () => {
    return axios.post('/cache/fakeip/flush')
}
export const flushDNSCacheAPI = () => {
    return axios.post('/cache/dns/flush')
}
export const reloadConfigsAPI = () => {
    return axios.put('/configs?reload=true', {
        path: '',
        payload: '',
    })
}

// Reserved since it's geo-data specific
export const updateGeoDataAPI = () => {
    return axios.post('/configs/geo')
}

export const queryDNSAPI = (params: { name: string; type: string }) => {
    return axios.get<DNSQuery>('/dns/query', {
        params,
    })
}

const createWebSocket = <T>(url: string, searchParams?: Record<string, string>) => {
    const backend = activeBackend.value!
    const resurl = new URL(`${getUrlFromBackend(backend).replace('http', 'ws')}/${url}`)

    resurl.searchParams.append('token', backend?.password || '')

    if (searchParams) {
        Object.entries(searchParams).forEach(([key, value]) => {
            resurl.searchParams.append(key, value)
        })
    }

    const data = ref<T>()
    const websocket = new ReconnectingWebSocket(resurl.toString())

    const close = () => {
        websocket.close()
    }

    const messageHandler = ({ data: message }: { data: string }) => {
        data.value = JSON.parse(message)
    }

    websocket.onmessage = url === 'logs' ? messageHandler : debounce(messageHandler, 100)

    return {
        data,
        close,
    }
}

export const fetchConnectionsAPI = <T>() => {
    return createWebSocket<T>('connections')
}

export const fetchLogsAPI = <T>(params: Record<string, string> = {}) => {
    return createWebSocket<T>('logs', params)
}

export const fetchMemoryAPI = <T>() => {
    return createWebSocket<T>('memory')
}

export const fetchTrafficAPI = <T>() => {
    return createWebSocket<T>('traffic')
}

export const isBackendAvailable = async (backend: Backend, timeout: number = 10000) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
        const res = await fetch(`${getUrlFromBackend(backend)}/version`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${backend.password}`,
            },
            signal: controller.signal,
        })

        return res.ok
    } catch {
        return false
    } finally {
        clearTimeout(timeoutId)
    }
}
