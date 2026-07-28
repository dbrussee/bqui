/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import BQAPIFetcher from '@/components/BQAPI'
import { ref } from 'vue'

export const appProspectStore = defineStore('appProspectStore', () => {
  const prospect = ref<any>({})
  const meta = ref<any>({
    ip: 'UNKNOWN',
    name: 'UNKNOWN',
    os: 'UNKNOWN',
    arch: 'UNKNOWN',
    tz: 'UNKNOWN',
    times: {
      start: new Date(),
      end: new Date(),
      ms: 0,
    },
  })
  const issue = ref<any>({})

  async function getProspect(pid : number | null) {
    if (pid == null) return
    prospect.value = {}
    const fetcher = await new BQAPIFetcher().callAPI(`/prospect/${pid}`, 'GET')
    if (fetcher.resp != null) {
      prospect.value = fetcher.resp as any[]
    }
    meta.value = fetcher.meta
    issue.value = fetcher.issue
    return prospect.value
  }

  return { getProspect, prospect, meta, issue }
})
