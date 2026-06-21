<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref } from 'vue'

interface CustomApiResponse {
  meta: Record<string, any>
  issue: Record<string, any>
  result: Record<string, any>
}

const json = ref<CustomApiResponse | null>(null)
async function fetchApiData() {
  try {
    const response = await fetch('http://192.168.68.202:8080/bqapi/v2.1/user/admin')
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    json.value = await response.json()
    console.log('API response (pretty JSON):')
    console.dir(json)
  } catch (error) {
    console.error('Error fetching API data:', error)
  }
}
fetchApiData()
</script>

<template>
  <h1>You did it!</h1>
  <div v-if="json">
    You are: {{ json.result.fstnam }} {{ json.result.lstnam }}<br />
    Your email is: {{ json.result.email }}<br />
    Took: {{ json.meta.times.ms }}ms
  </div>
</template>

<style scoped></style>
