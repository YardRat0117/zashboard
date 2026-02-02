import { ROUTE_NAME } from '@/constant'
import { renderRoutes } from '@/helper'
import { activeBackend } from '@/store/setup'
import type { ComputedRef } from 'vue'
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export const useKeyboard = (): {
    routeShortcuts: ComputedRef<
        {
            key: string
            route:
                | ROUTE_NAME.overview
                | ROUTE_NAME.proxies
                | ROUTE_NAME.connections
                | ROUTE_NAME.logs
                | ROUTE_NAME.settings
        }[]
    >
} => {
    const router = useRouter()

    const routeShortcuts = computed(() => {
        return renderRoutes.value.map((route, index) => ({
            key: (index + 1).toString(),
            route,
        }))
    })

    const handleKeydown = (event: KeyboardEvent): void => {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
            return
        }

        if (!activeBackend.value || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
            return
        }

        const key = event.key
        const route = routeShortcuts.value.find((s) => s.key === key)
        if (route) {
            event.preventDefault()
            router.push({ name: route.route })
        }
    }

    onMounted(() => {
        document.addEventListener('keydown', handleKeydown)
    })

    onUnmounted(() => {
        document.removeEventListener('keydown', handleKeydown)
    })

    return {
        routeShortcuts,
    }
}
