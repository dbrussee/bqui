<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref } from 'vue'
import BQAPIFetcher from './BQAPI'

const fetcher = ref<BQAPIFetcher>(new BQAPIFetcher())
async function fetchUser() {
  const el = document.getElementById('uid') as HTMLInputElement | null
  if (el) {
    await fetcher.value.fetch('/user/' + el.value)
    // console.dir(fetcher.value)
  }
}
</script>

<style scoped></style>

<template>
  <input id="uid" placeholder="Enter User ID" />
  <button @click="fetchUser()">Fetch User</button>
  <div v-if="fetcher.getStatus() == 'UNUSED'">User not loaded</div>
  <div v-else-if="fetcher.getStatus() == 'FETCHING'">...</div>
  <div v-else-if="fetcher.getStatus() == `FETCHED`">
    You are: {{ fetcher.json.resp.fstnam }} {{ fetcher.json.resp.lstnam }}<br />
    Your email is: {{ fetcher.json.resp.email }}<br />
    Took: {{ fetcher.json.meta.times.ms }}ms
  </div>
</template>
