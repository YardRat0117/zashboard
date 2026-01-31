<template>
  <div class="bg-base-200/50 relative h-35 rounded-lg p-2 text-sm">
    <div class="flex h-full flex-col justify-between">
      <div>
        <span class="inline-block"> {{ $t('latencyMethodNote') }}</span>
      </div>
      <div>
        <span class="inline-block w-20">Google </span>
        :
        <span :class="getColorForLatency(Number(googleLatency))">{{ googleLatency }}ms </span>
      </div>
      <div>
        <span class="inline-block w-20">Cloudflare </span>
        :
        <span :class="getColorForLatency(Number(cloudflareLatency))"
          >{{ cloudflareLatency }}ms
        </span>
      </div>
      <div>
        <span class="inline-block w-20">Github </span>
        :
        <span :class="getColorForLatency(Number(githubLatency))">{{ githubLatency }}ms </span>
      </div>
      <div>
        <span class="inline-block w-20">Docker </span>
        :
        <span :class="getColorForLatency(Number(dockerLatency))">{{ dockerLatency }}ms </span>
      </div>
    </div>
    <button
      class="btn btn-circle btn-sm absolute right-2 bottom-2"
      @click="getLatency"
    >
      <BoltIcon class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import {
  getCloudflareLatencyAPI,
  getDockerLatencyAPI,
  getGithubLatencyAPI,
  getGoogleLatencyAPI,
} from '@/api/latency'
import {
  cloudflareLatency,
  dockerLatency,
  githubLatency,
  googleLatency,
} from '@/composables/overview'
import { getColorForLatency } from '@/helper'
import { autoConnectionCheck } from '@/store/settings'
import { BoltIcon } from '@heroicons/vue/24/outline'
import { onMounted } from 'vue'

const getLatency = async () => {
  getGoogleLatencyAPI().then((res) => {
    googleLatency.value = res.toFixed(0)
  })

  getCloudflareLatencyAPI().then((res) => {
    cloudflareLatency.value = res.toFixed(0)
  })

  getGithubLatencyAPI().then((res) => {
    githubLatency.value = res.toFixed(0)
  })

  getDockerLatencyAPI().then((res) => {
    dockerLatency.value = res.toFixed(0)
  })
}

onMounted(() => {
  if (
    autoConnectionCheck.value &&
    [googleLatency, cloudflareLatency, githubLatency, dockerLatency].some(
      (item) => item.value === '',
    )
  ) {
    getLatency()
  }
})
</script>
