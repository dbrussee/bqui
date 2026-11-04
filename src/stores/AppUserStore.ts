/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import BQAPIFetcher from "@/components/BQAPI";
import { appMessageStore } from "./MessagesStore";
import { appProspectStore } from "./ProspectStore";
// import { proposalStore } from "./ProposalStore";
import { ref } from "vue";
import { useToast } from "@/composables/useToast";
import { B } from "@/composables/BUtils";
import type { Iuser } from "@/types/user";

export const appUserStore = defineStore("appUserStore", () => {
  const user = ref<Iuser | null>(null);
  const dashdata = ref<any>({})
  const meta = ref<any>(null);
  const issue = ref<any>(null)
  const working = ref<any>(null)
  const dashworking = ref<any>(null)
  const apiHistory = ref<any[]>([])

  initialize();

  function initialize() {
    relogin();
  }

  const getUserSetting = (thing:string, ifNotFound:string):string => {
    let rslt = ifNotFound
    if (!user.value) return rslt
    const config = user.value.config
    if ("settings" in config) {
      if (thing in config.settings) {
        rslt = config.settings[thing].trim()
      }
    }
    // console.log("User Setting", thing, rslt)
    return rslt

  }


  function clearSearch() {
    const pStore = appProspectStore()
    pStore.clearSearchParameters()
    pStore.searchResults = []
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function login(uid: string, pwd: string = "") {
    if (uid == "") return
    logout();
    const fetcher = new BQAPIFetcher()
    B.working.set(working, "Login...")
    await fetcher.callAPI(`/login/${uid}`, "POST")
    B.working.clear(working)
    user.value = fetcher.resp;
    applyTheme()
    // console.log(JSON.stringify(user.value, null, 2))
    meta.value = fetcher.meta;
    issue.value = fetcher.issue;
    const msgStore = appMessageStore()
    msgStore.getMessages()
    await getMostRecentProspect()
    // getDashboard()
    // proposalStore().getProposals()
  }
  async function relogin() {
    B.working.set(working, "Reload...")
    const fetcher = await new BQAPIFetcher().callAPI(`/relogin`, "POST");
    B.working.clear(working)
    user.value = fetcher.resp;
    applyTheme()
    // console.log(JSON.stringify(user.value, null, 2))
    meta.value = fetcher.meta;
    issue.value = fetcher.issue;

    const msgStore = appMessageStore()
    msgStore.getMessages()
    await getMostRecentProspect()
    // getDashboard()
    // proposalStore().getProposals()
    return user.value;
  }

  async function getDashboard(pid:number=-1) {
    dashdata.value = {}
    if (!user.value) return
    B.working.set(dashworking, "Loading...")
    if (pid < 0) {
      const test = getUserSetting("dashboard_filter", "N")
      if (test == "Y") { // User wants to filter
        const pStore = appProspectStore()
        if (pStore.prospect) {
          const lookedUpPID = pStore.prospect.id
          pid = lookedUpPID
        }
      }
    }
    const fetcher = new BQAPIFetcher()
    if (pid < 0) {
      await fetcher.callAPI(`/dashboard`, "GET")
    } else {
      await fetcher.callAPI(`/dashboard?onlyProspectId=${pid}`, "GET")
    }
    B.working.clear(dashworking)
    if (fetcher.resp.result == null) {
      dashdata.value = {}
    } else {
      dashdata.value = fetcher.resp.result
    }
    // console.dir(dashdata.value)
  }
  async function getDashboardQuotes(eff:string, status:string) {
    if (!user.value) return []
    let pidParam = ""
    const filter = getUserSetting('dashboard_filter','N')
    if (filter == 'Y') {
      const pStore = appProspectStore()
      if (pStore.prospect) {
        pidParam = `&pid=${pStore.prospect.id}`
      }
    }
    B.working.set(dashworking, "Loading Quotes...")
    const fetcher = new BQAPIFetcher()
    await fetcher.callAPI(`/dashboard/quotes?eff=${eff}&status=${status}${pidParam}`, "GET")
    B.working.clear(dashworking)
    // dashdata.value = fetcher.resp.result
    return fetcher.resp as any[]
  }

  function setTheme(themeString:string | null) {
    // No user... no change
    if (user.value == null || user.value.config == null) return
    if (themeString == null) {
      removeUserSetting('theme', false).then(() => {
        applyTheme(null)
      })
      localStorage.removeItem('bq-ui-theme')
      // console.log("--- Theme set to auto")
    } else {
      const code = themeString.toLowerCase()
      saveUserSetting('theme', code, false).then(() => {
        applyTheme(code)
      })
      localStorage.setItem('bq_ui_theme', code)
      // console.log("--- Theme set to", code)
    }
  }
  function applyTheme(themeString:string | null = null) {
    // No user... no change
    if (user.value == null || user.value.config == null) return
    // Get root of web page
    const rootElement = document.documentElement
    if (themeString == null) { // Not told. Look it up
      if (user.value.config.settings?.theme) { // theme provided (light or dark)
        const code = user.value.config.settings.theme.toLowerCase()
        // console.log("--- Found theme", code)
        rootElement.setAttribute('data-theme', code)
      } else { // theme not set (auto)
        // console.log("--- No theme defined... auto!")
        rootElement.removeAttribute('data-theme')
      }
    } else { // I was told what to set the theme to
      // console.log("--- Theme set to parameter value", themeString)
      rootElement.setAttribute('data-theme', themeString.toLowerCase())
    }
  }

  async function getMostRecentProspect () {
    if (!user.value) return
    if (!user.value.recents) return
    if (user.value.recents.length == 0) return
    const prospStore = appProspectStore()
    await prospStore.getProspect(user.value.recents[0].pid)
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

  // Remember last filter option. If no filter is passed to the
  // method, this is the next filter.
  const lastAPIFilter = ref<'ALL'|'ERROR'>('ERROR')
  async function getAPIHistory(filter?:'ALL' | 'ERROR') {
    if (filter == undefined) filter = lastAPIFilter.value
    apiHistory.value.length = 0
    const fetcher = await new BQAPIFetcher().callAPI(`/apihistory/${filter}`, 'GET')
    if (fetcher.resp != null) {
      lastAPIFilter.value = filter
      apiHistory.value.push(...(fetcher.resp as any[]))
    }
  }

  async function addRole(code:string) {
    B.working.set(working, "...")

    const fetcher = await new BQAPIFetcher().callAPI(`/user/role/${code}`, "POST")
    B.working.clear(working)
    if (fetcher.resp != null) {
      user.value = fetcher.resp;
      useToast().addToast(`Added role ${code}`, "info")
      getDashboard()
      clearSearch()
    } else {
      useToast().addToast(fetcher.issue, "error")
    }
  }
  async function deleteRole(code:string) {
    B.working.set(working, "...")
    const fetcher = await new BQAPIFetcher().callAPI(`/user/role/${code}`, "DELETE")
    B.working.clear(working)
    if (fetcher.resp != null) {
      user.value = fetcher.resp;
      useToast().addToast(`Removed role ${code}`, "info")
      getDashboard()
      clearSearch()
    } else {
      useToast().addToast(fetcher.issue, "error")
    }
  }

  const removeUserSetting = async(thing:string, reloadNeeded:boolean) => {
    await saveUserSetting(thing, null, reloadNeeded)
  }
  const saveUserSetting = async (thing:string, code:string | null, reloadNeeded:boolean) => {
    if (!user.value) return
    B.working.set(working, "...")
    const fetcher = new BQAPIFetcher()
    if (!code) {
      await new BQAPIFetcher().callAPI(`/user/config/${thing}`, "DELETE")
    } else {
      await new BQAPIFetcher().callAPI(`/user/config/${thing}/${code}`, "PUT")
    }

    B.working.clear(working)
    if (reloadNeeded) {
      if (fetcher.resp != null) {
        user.value = fetcher.resp;
        getDashboard()
        clearSearch()
      }
    }
    if (user.value) {
      if (!code) {
        if (user.value.config.settings) {
          delete user.value.config.settings[thing]
        }
      } else {
        if (!user.value.config.settings) user.value.config.settings = {}
        if (code != null) user.value.config.settings[thing] = code
      }
    }
  }


  const isUserReadOnly = ():boolean => {
    if (!user.value) return true
    if (!user.value.config) return true
    if (!user.value.config.roles) return true
    if (user.value.config.roles.indexOf('READONLY') >= 0) return true
    return false
  }
  const getUserRightValue = (code:string):string => {
    if (!user.value) return "ERROR"
    if (!user.value.rights) return "ERROR"
    const right = user.value.rights[code.trim().toUpperCase()]
    if (!right) return "ERROR"
    return right.value
  }

  async function setUserRightValue(code:string, value:string) {
    B.working.set(working, "...")

    const fetcher = await new BQAPIFetcher().callAPI(`/user/right/${code}/${value}`, "PUT")
    B.working.clear(working)
    if (fetcher.resp != null) {
      user.value = fetcher.resp;
      getDashboard()
      clearSearch()
      useToast().addToast(`Set right override for ${code} to ${value}`, "info")
    } else {
      useToast().addToast(fetcher.issue, "error")
    }
  }
  async function deleteUserRight(code:string) {
    B.working.set(working, "...")

    const fetcher = await new BQAPIFetcher().callAPI(`/user/right/${code}`, "DELETE")
    B.working.clear(working)
    if (fetcher.resp != null) {
      user.value = fetcher.resp;
      getDashboard()
      clearSearch()
      useToast().addToast(`Removed override for ${code}`, "info")
    } else {
      useToast().addToast(fetcher.issue, "error")
    }
  }

  async function clearRecents() {
    B.working.set(working, "...")
    const fetcher = new BQAPIFetcher()
    fetcher.callAPI(`/recents`, "DELETE").then(() => {
      B.working.clear(working)
      if (user.value) {
        user.value.recents = [...fetcher.resp]
        useToast().addToast("Cleared Recents List", "info")
      }
    })
  }


  return { isLoading: working,
    relogin, login, logout, working,
    dashworking, getDashboard, getDashboardQuotes, dashdata,
    saveUserSetting, applyTheme, setTheme, getUserSetting, removeUserSetting,
    addRole, deleteRole,
    user, getUserRightValue, setUserRightValue, deleteUserRight, isUserReadOnly,
    clearRecents,
    getAPIHistory, apiHistory, lastAPIFilter,
    meta, issue
  };
});
