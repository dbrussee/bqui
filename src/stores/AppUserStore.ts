/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import BQAPIFetcher from "@/components/BQAPI";
import { appMessageStore } from "./MessagesStore";
import { appProspectStore } from "./ProspectStore";
import { ref } from "vue";
import { useToast } from "@/composables/useToast";
import { B } from "@/composables/BUtils";

export const appUserStore = defineStore("appUserStore", () => {
  const user = ref<any>(null);
  // const otherUser = ref<any>(null);
  const meta = ref<any>(null);
  const issue = ref<any>(null)
  const working = ref<any>(null)

  const apiHistory = ref<any[]>([])

  initialize();

  function initialize() {
    relogin();
  }

  // async function getOtherUser(uid: string) {
  //   otherUser.value = null;
  //   const fetcher = await new BQAPIFetcher().callAPI(`/user/${uid}`, "GET");
  //   otherUser.value = fetcher.resp;
  //   meta.value = fetcher.meta;
  //   issue.value = fetcher.issue;
  //   return otherUser.value;
  // }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function login(uid: string, pwd: string = "") {
    if (uid == "") return
    logout();
    const fetcher = new BQAPIFetcher()
    B.working.set(working, "Login...")
    fetcher.callAPI(`/login/${uid}`, "POST").then(() => {
      B.working.clear(working)
      user.value = fetcher.resp;
      // console.log(JSON.stringify(user.value, null, 2))
      meta.value = fetcher.meta;
      issue.value = fetcher.issue;
      const msgStore = appMessageStore()
      msgStore.getMessages()
    })
  }
  async function relogin() {
    B.working.set(working, "Relogin...")
    const fetcher = await new BQAPIFetcher().callAPI(`/relogin`, "POST");
    B.working.clear(working)
    user.value = fetcher.resp;
    // console.log(JSON.stringify(user.value, null, 2))
    meta.value = fetcher.meta;
    issue.value = fetcher.issue;

    const msgStore = appMessageStore()
    msgStore.getMessages()

    return user.value;
  }
  function logout() {
    if (!user.value) return;
    B.working.set(working, "Logout...")
    user.value = null;
    const prospStore = appProspectStore()
    B.working.clear(working)
    prospStore.prospect = null
    window.setTimeout(() => {
      new BQAPIFetcher().callAPI(`/logout`, "POST");
    },100)
  }
  async function getAPIHistory() {
    apiHistory.value.length = 0
    const fetcher = await new BQAPIFetcher().callAPI(`/apihistory`, 'GET')
    if (fetcher.resp != null) {
      apiHistory.value.push(...(fetcher.resp as any[]))
    }
  }

  const getUserRightValue = (code:string):string => {
    if (!user.value) return "ERROR"
    if (!user.value.rights) return "ERROR"
    const right = user.value.rights[code.trim().toUpperCase()]
    if (!right) return "ERROR"
    return right.value
  }

  async function clearRecents() {
    B.working.set(working, "...")
    const userStore = appUserStore()
    delete userStore.user.recents

    const fetcher = new BQAPIFetcher()
    fetcher.callAPI(`/recents`, "DELETE").then(() => {
    B.working.clear(working)
    // meta.value = fetcher.meta
    // issue.value = fetcher.issue
      useToast().addToast("Cleared Recents List", "info")

    })
  }


  return { isLoading: working,
    relogin, login, logout,
    user, getUserRightValue, working,
    clearRecents,
    getAPIHistory, apiHistory,
    meta, issue
  };
});
