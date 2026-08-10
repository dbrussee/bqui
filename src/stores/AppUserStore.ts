/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import BQAPIFetcher from "@/components/BQAPI";
import { appMessageStore } from "./MessagesStore";
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
  const issue = ref<any>(null);

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
    logout();
    const fetcher = await new BQAPIFetcher().callAPI(`/login/${uid}`, "POST");
    user.value = fetcher.resp;
    meta.value = fetcher.meta;
    issue.value = fetcher.issue;

    const msgStore = appMessageStore()
    msgStore.getMessages()

    return user.value;
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
    if (!user.value) return;
    await new BQAPIFetcher().callAPI(`/logout`, "POST");
    user.value = null;
    issue.value = null;
    meta.value = null;
  }

  return { getOtherUser, relogin, login, logout, otherUser, user, meta, issue };
});
