/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import BQAPIFetcher from '@/components/BQAPI'
import { ref } from 'vue'

export const appMessageStore = defineStore('appMessageStore', () => {
  const messages = ref<any[]>([])
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

  async function getMessages(uid: string) {
    messages.value.length = 0
    const fetcher = await new BQAPIFetcher().callAPI(`/messages/${uid}`, 'GET')
    if (fetcher.resp != null) {
      messages.value.push(...(fetcher.resp as any[]))
    }
    meta.value = fetcher.meta
    issue.value = fetcher.issue
    return messages.value
  }

  return { getMessages, messages, meta, issue }
})
