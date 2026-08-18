/* eslint-disable @typescript-eslint/no-explicit-any */
import BQAPIFetcher from '@/components/BQAPI'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const appStore = defineStore('qppStore', () => {
  const config = ref<any>({})
  const vers = ref({
    major: 2,
    minor: 0,
    sub: null,
    special: "a",
    release: new Date(2027, 0, 1)
  })
  const version = () => {
    const v = vers.value
    let vtext = v.major.toString()
    if (v.minor != null) vtext += "." + v.minor
    if (v.sub != null) vtext += "." + v.sub
    if (v.special != "") vtext += v.special
    return vtext
  }
  const versionDescription = () => {
    const v = vers.value
    let vtext = 'Major: ' + v.major.toString()
    if (v.minor != null) vtext += ", Minor: " + v.minor
    if (v.sub != null) vtext += ", Sub: " + v.sub
    if (v.special != "") vtext += v.special
    return vtext
  }

  const initialize = () => {
    const fetcher = new BQAPIFetcher()
    fetcher.callAPI("/app/init").then(() => {
      config.value = fetcher.resp
    })
  }

  return { initialize, vers, version, versionDescription, config }
})
