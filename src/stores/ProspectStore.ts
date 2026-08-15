/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import BQAPIFetcher from "@/components/BQAPI";
import { ref } from "vue";

import { appUserStore } from "./AppUserStore";

export const appProspectStore = defineStore("appProspectStore", () => {
  const prospect = ref<any>(null);
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

  function getProspect(pid: string, registerRecent: boolean = false) {
    if (pid == "") return;
    prospect.value = {};
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
      prospect.value = fetcher.resp
      // console.dir(prospect.value)
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
      `/user_favorite/${pid}`,
      isFavorite ? "POST" : "DELETE",
    );
    if (fetcher.resp != null) {
      const updatedUser = fetcher.resp as any;
      const userStore = appUserStore();
      userStore.user.faves = updatedUser.faves as any[];
    }
  }

  return { isLoading, getProspect, clearRecents, prospect, meta, issue, setFavorite };
});
