import { ROUTE_NAME } from '@/constant'
// import { renderRoutes } from '@/helper'
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
      redirect: ROUTE_NAME.overview,
      component: HomePage,
      children: panelRouter,
    },
    // If backend unavailable, route to the SetupPage
    {
      path: '/setup',
      name: ROUTE_NAME.setup,
      component: SetupPage,
    },
    // Route to overview by default
    {
      path: '/:catchAll(.*)',
      redirect: ROUTE_NAME.overview,
    },
  ],
})

// IDK what this is for.
// router.beforeEach((to, from) => {
//   const toIndex = renderRoutes.value.findIndex((item) => item === to.name)
//   const fromIndex = renderRoutes.value.findIndex((item) => item === from.name)

//   if (toIndex === 0 && fromIndex === renderRoutes.value.length - 1) {
//     to.meta.transition = 'slide-left'
//   } else if (toIndex === renderRoutes.value.length - 1 && fromIndex === 0) {
//     to.meta.transition = 'slide-right'
//   } else if (toIndex !== fromIndex) {
//     to.meta.transition = toIndex < fromIndex ? 'slide-right' : 'slide-left'
//   }

//   if (!activeBackend.value && to.name !== ROUTE_NAME.setup) {
//     router.push({ name: ROUTE_NAME.setup })
//   }
// })

router.afterEach((to) => {
  setTitleByName(to.name)
})

const title = useTitle('zashboard')
const setTitleByName = (name: string | symbol | undefined) => {
  if (typeof name === 'string' && activeBackend.value) {
    title.value = `${title.value} | ${i18n.global.t(name)}`
  }
}

watch(language, () => {
  setTimeout(() => {
    setTitleByName(router.currentRoute.value.name)
  })
})

export default router
