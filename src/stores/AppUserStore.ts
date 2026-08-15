/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import BQAPIFetcher from "@/components/BQAPI";
import { appMessageStore } from "./MessagesStore";
import { appProspectStore } from "./ProspectStore";
import { ref } from "vue";

export const appUserStore = defineStore("appUserStore", () => {
  const user = ref<any>(null);
  const otherUser = ref<any>(null);
  const meta = ref<any>(null);
  // const meta = ref<any>({
  //   ip: 'UNKNOWN',
  //   name: 'UNKNOWN',
  //   os: 'UNKNOWN',
  //   arch: 'UNKNOWN',
  //   tz: 'UNKNOWN',
  //   times: {
  //     start: new Date(),
  //     end: new Date(),
  //     ms: 0,
  //   },
  // })
  const issue = ref<any>(null)
  const isLoading = ref<boolean>(false)

  initialize();

  function initialize() {
    relogin();
  }

  async function getOtherUser(uid: string) {
    otherUser.value = null;
    const fetcher = await new BQAPIFetcher().callAPI(`/user/${uid}`, "GET");
    otherUser.value = fetcher.resp;
    meta.value = fetcher.meta;
    issue.value = fetcher.issue;
    return otherUser.value;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function login(uid: string, pwd: string = "") {
    if (uid == "") return
    logout();
    const fetcher = new BQAPIFetcher()
    isLoading.value = true
    fetcher.callAPI(`/login/${uid}`, "POST").then(() => {
      isLoading.value = false
      user.value = fetcher.resp;
      meta.value = fetcher.meta;
      issue.value = fetcher.issue;

      const msgStore = appMessageStore()
      msgStore.getMessages()
    })
  }
  async function relogin() {
    const fetcher = await new BQAPIFetcher().callAPI(`/relogin`, "POST");
    user.value = fetcher.resp;
    meta.value = fetcher.meta;
    issue.value = fetcher.issue;

    const msgStore = appMessageStore()
    msgStore.getMessages()

    return user.value;
  }
  async function logout() {
    const prospStore = appProspectStore()
    prospStore.prospect = null

    if (!user.value) return;
    await new BQAPIFetcher().callAPI(`/logout`, "POST");
    user.value = null;
    issue.value = null;
    meta.value = null;
  }

  return { isLoading, getOtherUser, relogin, login, logout, otherUser, user, meta, issue };
});
