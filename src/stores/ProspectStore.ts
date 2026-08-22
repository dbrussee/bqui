/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import BQAPIFetcher from "@/components/BQAPI";
import { ref } from "vue";
import { B } from "@/composables/BUtils";

import { appUserStore } from "./AppUserStore";

export const appProspectStore = defineStore("appProspectStore", () => {
  const prospect = ref<any>(null);
  const quotes = ref<any[]>([])
  const meta = ref<any>({
    ip: "UNKNOWN",
    name: "UNKNOWN",
    os: "UNKNOWN",
    arch: "UNKNOWN",
    tz: "UNKNOWN",
    times: {
      start: new Date(),
      end: new Date(),
      ms: 0,
    },
  });
  const issue = ref<any>({});
  const isLoading = ref<boolean>(false)


  async function clearRecents() {
    const userStore = appUserStore()
    delete userStore.user.recents

    const fetcher = new BQAPIFetcher()
    fetcher.callAPI(`/recents`, "DELETE")
    // meta.value = fetcher.meta
    // issue.value = fetcher.issue

  }

  const censusHash = ref("Unused")
  const censusDirty = ref(false)
  async function setCensusDirty() {
    const hash = await B.getHash(JSON.stringify(prospect.value.census))
    censusDirty.value = censusHash.value != hash
  }
  function getProspect(pid: string, registerRecent: boolean = false) {
    if (pid == "") return;
    prospect.value = {};
    quotes.value.length = 0;
    issue.value = {}
    const fetcher = new BQAPIFetcher()
    isLoading.value = true
    fetcher.callAPI(`/prospect/${pid}`, "GET").then(() => {
      // Dont wait for recents to be updated
      // Release the Prospect screen to show data
      isLoading.value = false
      meta.value = fetcher.meta
      issue.value = fetcher.issue
      // resp is null if not found
      if (fetcher.resp == null) {
        return
      }
      prospect.value = fetcher.resp.prosp
      B.getHash(JSON.stringify(prospect.value.census)).then(hash => {
        censusHash.value = hash
        censusDirty.value = false
      })
      quotes.value = fetcher.resp.quotes
      // console.log(JSON.stringify(prospect.value, null, 2))
      if (registerRecent) {
        fetcher.callAPI('/recents', "GET").then(() => {
          if (fetcher.resp) {
            const userStore = appUserStore()
            userStore.user.recents = fetcher.resp
          }
        })
      }
    })
    // return prospect.value;
  }

  async function setFavorite(pid: number, isFavorite: boolean = true) {
    const fetcher = await new BQAPIFetcher().callAPI(
      `/favorite/${pid}`,
      isFavorite ? "POST" : "DELETE",
    );
    if (fetcher.resp != null) {
      const updatedUser = fetcher.resp as any;
      const userStore = appUserStore();
      userStore.user.faves = updatedUser.faves as any[];
    }
  }

  async function createProspect(data:any) {
    const fetcher = await new BQAPIFetcher().callAPI(`/prospect`, 'POST', data)
    if (fetcher.resp != null) {
      prospect.value = fetcher.resp.prosp
      B.getHash(JSON.stringify(prospect.value.census)).then(hash => {
        censusHash.value = hash
        censusDirty.value = false
      })

      const userStore = appUserStore()
      if (!userStore.user.recents) userStore.user.recents = []
      userStore.user.recents.unshift({pid: prospect.value.id, name: prospect.value.name})
    }
    meta.value = fetcher.meta
    issue.value = fetcher.issue
  }
  async function updateProspect(data:any) {
    // console.log(JSON.stringify(data, null, 2))
    const fetcher = await new BQAPIFetcher().callAPI(`/prospect`, 'PUT', data)
    if (fetcher.resp != null) {
      prospect.value = fetcher.resp.prosp
      B.getHash(JSON.stringify(prospect.value.census)).then(hash => {
        censusHash.value = hash
        censusDirty.value = false
      })
      const userStore = appUserStore()
      userStore.user.recents[0].name = prospect.value.name
      // console.dir(userStore.user.faves)
      userStore.user.faves.forEach((fave:any) => {
        if (fave.pid == prospect.value.id) {
          fave.name = prospect.value.name
        }
      })

    }
    meta.value = fetcher.meta
    issue.value = fetcher.issue
  }


  return { isLoading, createProspect, updateProspect, getProspect, clearRecents, prospect, setCensusDirty, censusDirty, quotes, meta, issue, setFavorite };
});
