import { fetchRulesAPI } from '@/api'
import type { Rule } from '@/types'
import { ref } from 'vue'

// Reserved for ruleset hit count
export const rules = ref<Rule[]>([])

export const fetchRules = async () => {
    rules.value = (await fetchRulesAPI()).data.rules
}
