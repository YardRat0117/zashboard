import { isMiddleScreen } from '@/helper/utils'
import type { ComputedRef } from 'vue'
import { computed, ref } from 'vue'

export const ctrlsBottom = ref(0)
export const dockTop = ref(0)

const EMPTY_STYLE: Record<string, never> = {}

export const usePaddingForViews = (
    config = {
        offsetTop: 8,
        offsetBottom: 8,
    },
): {
    padding: ComputedRef<{ paddingTop: string; paddingBottom: string } | Record<string, never>>
    paddingTop: ComputedRef<number>
    paddingBottom: ComputedRef<number>
} => {
    const { offsetTop, offsetBottom } = config

    const paddingTop = computed(() => {
        if (isMiddleScreen.value) {
            return ctrlsBottom.value + offsetTop
        }
        return 0
    })

    const paddingBottom = computed(() => {
        if (isMiddleScreen.value) {
            return dockTop.value + offsetBottom
        }
        return 0
    })

    const padding = computed<{ paddingTop: string; paddingBottom: string } | Record<string, never>>(() => {
        if (isMiddleScreen.value) {
            return {
                paddingTop: `${paddingTop.value}px`,
                paddingBottom: `${paddingBottom.value}px`,
            }
        }
        return EMPTY_STYLE
    })

    return {
        padding,
        paddingTop,
        paddingBottom,
    }
}
