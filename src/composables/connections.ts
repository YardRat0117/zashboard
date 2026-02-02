import type { Connection } from '@/types'
import type { Ref } from 'vue'
import { nextTick, ref } from 'vue'

const infoConn = ref<Connection | null>(null)
const connectionDetailModalShow = ref(false)

export const useConnections = (): {
    infoConn: Ref<Connection | null>
    connectionDetailModalShow: Ref<boolean>
    handlerInfo: (conn: Connection) => Promise<void>
} => {
    const handlerInfo = async (conn: Connection): Promise<void> => {
        infoConn.value = null
        await nextTick()
        infoConn.value = conn
        connectionDetailModalShow.value = true
    }

    return {
        infoConn,
        connectionDetailModalShow,
        handlerInfo,
    }
}
