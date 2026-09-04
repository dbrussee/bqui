/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import BQAPIFetcher from '@/components/BQAPI'
import { ref } from 'vue'
import { useToast } from '../composables/useToast'

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

  async function sendNewMessage(sendto:string, subject:string, message:string) {
    const msgBody = {
      sendto: sendto,
      subject: subject,
      message: message
    }
    const fetcher = await new BQAPIFetcher().callAPI(`/message`, 'POST', msgBody)
    if (fetcher.resp != null) {
      messages.value.unshift(fetcher.resp as any)
    }
    meta.value = fetcher.meta
    issue.value = fetcher.issue
    if (issue.value) {
      useToast().addToast(`Error sending message: ${issue.value.error}`, "error")
    } else {
      useToast().addToast(`Message sent to ${sendto}`, "success")
    }
  }
  async function deleteMessage(id:number) {
    const fetcher = await new BQAPIFetcher().callAPI(`/message/${id}`, 'DELETE')
    messages.value.length = 0
    if (fetcher.resp != null) {
      messages.value.push(...(fetcher.resp as any[]))
    }
    meta.value = fetcher.meta
    issue.value = fetcher.issue
  }

  async function getMessages() {
    messages.value.length = 0
    const fetcher = await new BQAPIFetcher().callAPI(`/messages`, 'GET')
    if (fetcher.resp != null) {
      messages.value.length = 0
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

  return { getMessages, acknowledge, unreadCount, sendNewMessage, deleteMessage, messages, meta, issue }
})
