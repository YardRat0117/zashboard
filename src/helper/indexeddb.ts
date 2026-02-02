import { customBackgroundURL } from '@/store/settings'
import dayjs from 'dayjs'
import { computed, ref, watch } from 'vue'

const useIndexedDB = (
    dbKey: string,
): {
    put: (key: string, value: string) => Promise<IDBValidKey>
    get: (key: string) => Promise<string | undefined>
    del: (key: string) => Promise<void>
    getAllKeys: () => Promise<string[]>
    isExists: (key: string) => Promise<boolean>
    clear: () => Promise<void>
} => {
    const cacheMap = new Map<string, string>()
    const openDatabase = (): Promise<IDBDatabase> =>
        new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open(dbKey, 1)
            request.onupgradeneeded = (): void => {
                const db = request.result
                if (!db.objectStoreNames.contains(dbKey)) {
                    db.createObjectStore(dbKey, {
                        keyPath: 'key',
                    })
                }
            }
            request.onsuccess = (): void => {
                const db = request.result
                const store = db.transaction(dbKey, 'readonly').objectStore(dbKey)
                const cursorRequest = store.openCursor()

                cursorRequest.onsuccess = (event): void => {
                    const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result

                    if (cursor) {
                        cacheMap.set(cursor.key as string, cursor.value.value)
                        cursor.continue()
                    } else {
                        resolve(request.result)
                    }
                }
                cursorRequest.onerror = (): void => reject(cursorRequest.error)
            }
            request.onerror = (): void => reject(request.error)
        })

    const dbPromise = openDatabase()

    const executeTransaction = async <T>(
        mode: IDBTransactionMode,
        operation: (store: IDBObjectStore) => IDBRequest<T>,
    ): Promise<T> => {
        const db = await dbPromise
        return new Promise<T>((resolve, reject): void => {
            const transaction = db.transaction(dbKey, mode)
            const store = transaction.objectStore(dbKey)
            const request = operation(store)

            request.onsuccess = (): void => resolve(request.result)
            request.onerror = (): void => reject(request.error)
        })
    }

    const put = async (key: string, value: string): Promise<IDBValidKey> => {
        await dbPromise
        cacheMap.set(key, value)
        return executeTransaction('readwrite', (store) =>
            store.put({
                key,
                value,
            }),
        )
    }

    const get = async (key: string): Promise<string | undefined> => {
        await dbPromise
        return cacheMap.get(key)
    }

    const clear = async (): Promise<void> => {
        await dbPromise
        cacheMap.clear()
        return executeTransaction('readwrite', (store) => store.clear())
    }

    const isExists = async (key: string): Promise<boolean> => {
        await dbPromise
        return cacheMap.has(key)
    }

    const del = async (key: string): Promise<void> => {
        await dbPromise
        cacheMap.delete(key)
        return executeTransaction('readwrite', (store) => store.delete(key))
    }

    const getAllKeys = async (): Promise<string[]> => {
        await dbPromise
        return Array.from(cacheMap.keys())
    }

    return {
        put,
        get,
        del,
        getAllKeys,
        isExists,
        clear,
    }
}

const backgroundDB = useIndexedDB('base64')
const backgroundImageKey = 'background-image'

export const saveBase64ToIndexedDB = (val: string): Promise<IDBValidKey> => backgroundDB.put(backgroundImageKey, val)
export const getBase64FromIndexedDB = (): Promise<string | undefined> => backgroundDB.get(backgroundImageKey)
export const deleteBase64FromIndexedDB = (): Promise<void> => backgroundDB.clear()
export const LOCAL_IMAGE = 'local-image'

const date = dayjs().format('YYYY-MM-DD')
const backgroundInDB = ref('')
const getBackgroundInDB = async (): Promise<void> => {
    backgroundInDB.value = (await getBase64FromIndexedDB()) || ''
}

watch(
    () => customBackgroundURL.value,
    () => {
        if (customBackgroundURL.value.includes(LOCAL_IMAGE)) {
            getBackgroundInDB()
        }
    },
    {
        immediate: true,
    },
)

export const backgroundImage = computed(() => {
    if (!customBackgroundURL.value) {
        return ''
    }

    if (customBackgroundURL.value.includes(LOCAL_IMAGE)) {
        return `background-image: url('${backgroundInDB.value}');`
    }
    return `background-image: url('${customBackgroundURL.value}?v=${date}');`
})

export interface ConnectionHistoryData {
    key: string
    download: number
    upload: number
    count: number
}

export enum ConnectionHistoryType {
    Destination = 'destination',
    Outbound = 'outbound',
}

const connectionHistoryDB = useIndexedDB('connection-history')

export const saveConnectionHistoryToIndexedDB = async (
    uuid: string,
    aggregationType: ConnectionHistoryType,
    data: ConnectionHistoryData[],
): Promise<IDBValidKey> => {
    const jsonData = JSON.stringify(data)
    return connectionHistoryDB.put(`${uuid}-${aggregationType}`, jsonData)
}

export const getConnectionHistoryFromIndexedDB = async (
    uuid: string,
    aggregationType: ConnectionHistoryType,
): Promise<ConnectionHistoryData[]> => {
    const jsonData = await connectionHistoryDB.get(`${uuid}-${aggregationType}`)
    if (!jsonData) {
        return []
    }
    try {
        return JSON.parse(jsonData) as ConnectionHistoryData[]
    } catch {
        return []
    }
}

export const clearConnectionHistoryFromIndexedDB = async (): Promise<void> => {
    return connectionHistoryDB.clear()
}
