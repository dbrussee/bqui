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

  async function getMessages() {
    messages.value.length = 0
    const fetcher = await new BQAPIFetcher().callAPI(`/messages`, 'GET')
    if (fetcher.resp != null) {
      messages.value.push(...(fetcher.resp as any[]))
    }
    meta.value = fetcher.meta
    issue.value = fetcher.issue
    return messages.value
  }

  function unreadCount():number {
    let count = 0
    messages.value.forEach((msg) => {
      if (!msg.readat) count++
    })
    return count
  }

  async function acknowledge(index:number) {
    const msg = messages.value[index]
    if (msg.readat != null) return
    const fetcher = await new BQAPIFetcher().callAPI(`/message/${msg.id}`, 'PUT')
    if (fetcher.resp != null) {
      msg.readat = fetcher.resp.readat
    }
    meta.value = fetcher.meta
    issue.value = fetcher.issue
  }

  return { getMessages, acknowledge, unreadCount, messages, meta, issue }
})
