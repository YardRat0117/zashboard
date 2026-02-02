import { ROUTE_NAME } from '@/constant'
import { i18n } from '@/i18n'
import { language } from '@/store/settings'
import { activeBackend } from '@/store/setup'
import ConnectionsPage from '@/views/ConnectionsPage.vue'
import HomePage from '@/views/HomePage.vue'
import LogsPage from '@/views/LogsPage.vue'
import OverviewPage from '@/views/OverviewPage.vue'
import ProxiesPage from '@/views/ProxiesPage.vue'
import SettingsPage from '@/views/SettingsPage.vue'
import SetupPage from '@/views/SetupPage.vue'
import { useTitle } from '@vueuse/core'
import { watch } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'

// Sub-router table for UI panels.
// The SetupPage is excluded since backend is available now.
const panelRouter = [
    {
        path: 'overview',
        name: ROUTE_NAME.overview,
        component: OverviewPage,
    },
    {
        path: 'proxies',
        name: ROUTE_NAME.proxies,
        component: ProxiesPage,
    },
    {
        path: 'connections',
        name: ROUTE_NAME.connections,
        component: ConnectionsPage,
    },
    {
        path: 'logs',
        name: ROUTE_NAME.logs,
        component: LogsPage,
    },
    {
        path: 'settings',
        name: ROUTE_NAME.settings,
        component: SettingsPage,
    },
]

// General router.
const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        // Normal routing
        {
            path: '/',
            redirect: ROUTE_NAME.setup,
            component: HomePage,
            children: panelRouter,
        },
        {
            path: '/setup',
            name: ROUTE_NAME.setup,
            component: SetupPage,
        },
        // Route to setupby default
        {
            path: '/:catchAll(.*)',
            redirect: ROUTE_NAME.setup,
        },
    ],
})

// Route to setup if backend unavailable.
router.beforeEach(() => {
    if (!activeBackend.value) {
        router.push({ name: ROUTE_NAME.setup })
    }
})

// Update title after routing
const title = useTitle('zashboard')
const setTitleByName = (name: string | symbol | undefined): void => {
    if (typeof name === 'string' && activeBackend.value) {
        title.value = `zashboard | ${i18n.global.t(name)}`
    }
}
router.afterEach((to) => {
    setTitleByName(to.name)
})
watch(language, () => {
    setTimeout(() => {
        setTitleByName(router.currentRoute.value.name)
    })
})

// Export as default router
export default router
