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

  async function clearRecents() {
    const userStore = appUserStore()
    delete userStore.user.recents

    const fetcher = new BQAPIFetcher()
    fetcher.callAPI(`/recents`, "DELETE")
    // meta.value = fetcher.meta
    // issue.value = fetcher.issue

  }

  async function getProspect(pid: string, registerRecent: boolean = false) {
    if (pid == "") return;
    prospect.value = {};
    const fetcher = new BQAPIFetcher()
    await fetcher.callAPI(`/prospect/${pid}`, "GET")
    if (fetcher.resp == null) return
    prospect.value = fetcher.resp
    meta.value = fetcher.meta
    issue.value = fetcher.issue
    if (registerRecent) {
      await fetcher.callAPI('/recents', "GET")
      if (fetcher.resp) {
        const userStore = appUserStore()
        userStore.user.recents = fetcher.resp
      }
    }

    return prospect.value;
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

  return { getProspect, clearRecents, prospect, meta, issue, setFavorite };
});
