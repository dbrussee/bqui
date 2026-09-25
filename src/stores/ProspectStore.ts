/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import BQAPIFetcher from "@/components/BQAPI";
import { ref } from "vue";
import { B } from "@/composables/BUtils";
import { appUserStore } from "./AppUserStore";
import { useToast } from '../composables/useToast'
import * as XLSX from "xlsx";

export const appProspectStore = defineStore("appProspectStore", () => {
  const prospect = ref<any>(null);
  const searchResults = ref<any[]>([])
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
  const prospWorking = ref<any>(null)
  const censusWorking = ref<any>(null)

  async function removeMeFromRecents() {
    const fetcher = new BQAPIFetcher()
    const userStore = appUserStore()
    const pid = prospect.value.id
    fetcher.callAPI(`/recents/${pid}`, "DELETE").then(() => {
      if (fetcher.issue) {
        useToast().addToast(`Error removing prospect ${pid} from Recents`, "error")
      } else {
        useToast().addToast(`Removed prospect ${pid} from Recents`, "info")
        if (userStore.user.recents.length > 1) {
          getProspect(userStore.user.recents[1]?.pid, true)
        } else {
          prospect.value = null
        }
      }
      meta.value = fetcher.meta
      issue.value = fetcher.issue
    })
  }

  async function deleteProspect() {
    const fetcher = new BQAPIFetcher()
    const userStore = appUserStore()
    const pid = prospect.value.id
    B.working.set(prospWorking, "Deleting...");
    fetcher.callAPI(`/prospect/${pid}`, "DELETE").then(() => {
      B.working.clear(prospWorking);
      if (fetcher.issue) {
        useToast().addToast(`Error deleting prospect ${pid}:<p>${fetcher.issue.message}</p?`, "error", 0)
        fetcher.issue = null
      } else {
        useToast().addToast(`Deleted prospect ${pid}`, "success")
        if (userStore.user.recents.length > 1) {
          getProspect(userStore.user.recents[1]?.pid, true)
        } else {
          prospect.value = null
        }
      }
      meta.value = fetcher.meta
      issue.value = fetcher.issue
    })
  }


  const censusHash = ref("Unused")
  const censusDirty = ref(false)
  async function setCensusDirty() {
    const hash = await B.getHash(JSON.stringify(prospect.value.census))
    censusDirty.value = censusHash.value != hash
  }

  async function searchProspects(query:string) {
    if (query == "") return
    B.working.set(prospWorking, "Searching...")
    searchResults.value.length = 0
    const fetcher = await new BQAPIFetcher().callAPI(`/search/prospects`, 'POST', query)
    B.working.clear(prospWorking)
    if (fetcher.resp != null) {
      searchResults.value = [...fetcher.resp]
    }
    meta.value = fetcher.meta
    issue.value = fetcher.issue
  }

  function getProspect(pid: string, registerRecent: boolean = false) {
    if (pid == "") return;
    prospect.value = {};
    quotes.value.length = 0;
    issue.value = {}
    const fetcher = new BQAPIFetcher()
    B.working.set(prospWorking, "Loading...")
    B.working.set(censusWorking, "Loading Prospect...")
    fetcher.callAPI(`/prospect/${pid}`, "GET").then(() => {
      // Dont wait for recents to be updated
      // Release the Prospect screen to show data
      B.working.clear(prospWorking)
      B.working.clear(censusWorking)
      meta.value = fetcher.meta
      issue.value = fetcher.issue
      // resp is null if not found
      if (fetcher.resp == null) {
        return
      }
      prospect.value = fetcher.resp.prosp
      // console.log(JSON.stringify(prospect.value, null, 2))
      prospect.value.census = sortCensus(fetcher.resp.prosp.census)
      B.getHash(JSON.stringify(prospect.value.census)).then(hash => {
        censusHash.value = hash
        censusDirty.value = false
      })
      quotes.value = sortQuotes(fetcher.resp.quotes)
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
  }
  const sortCensus = (original:any[]):any[] => {
    for (const sub of original) {
      sub.deps = sub.deps.sort((depa:any, depb:any) => {
        if (depa.relation == 'SPS') return -1
        const doba = new Date(depa.dob)
        const dobb = new Date(depb.dob)
        if (doba < dobb) return -1
        if (doba > dobb) return 1
        return 0
      })
    }
    const sorted = original.sort((suba, subb) => {
      if (suba.lstnam < subb.lstnam) return -1
      if (suba.lstnam > subb.lstnam) return 1
      if (suba.fstnam < subb.fstnam) return -1
      if (suba.fstnam > subb.fstnam) return 1
      return 0
    })
    return sorted
  }

  function sortQuotes(original:any[]):any[] {
    const sorted = original.sort((a, b) => {
      const aDate = new Date(a.effdat)
      const bDate = new Date(b.effdat)
      if (aDate < bDate) return 1
      if (aDate > bDate) return -1
      if (a.id < b.id) return -1
      if (a.id > b.id) return 1
      return 0
    })
    return sorted
  }

  async function setFavorite(pid: number, isFavorite: boolean = true) {
    B.working.set(prospWorking, isFavorite ? "Set Bookmark..." : "Remove Bookmark...")
    const fetcher = await new BQAPIFetcher().callAPI(
      `/favorite/${pid}`,
      isFavorite ? "POST" : "DELETE",
    );
    B.working.clear(prospWorking)
    if (fetcher.resp != null) {
      const updatedUser = fetcher.resp as any;
      const userStore = appUserStore();
      userStore.user.faves = updatedUser.faves as any[];
      useToast().addToast(isFavorite ? "Added to Bookmarks" : "Removed from Bookmarks", isFavorite ? "success" : "info")
    }
  }
  const isCurrentlyFavorite = () => {
    const userStore = appUserStore()
    if (!userStore.user || !userStore.user.faves || !prospect.value.id) return false;
    let rslt = false;
    for (let i = 0; i < userStore.user.faves.length; i++) {
      if (userStore.user.faves[i].pid == prospect.value.id) {
        rslt = true;
        break;
      }
    }
    return rslt;
  }

  async function createProspect(data:any) {
    prospWorking.value = true
    const fetcher = await new BQAPIFetcher().callAPI(`/prospect`, 'POST', data)
    prospWorking.value = false
    if (fetcher.resp != null) {
      prospect.value = fetcher.resp.prosp
      quotes.value.length = 0
      B.getHash(JSON.stringify(prospect.value.census)).then(hash => {
        censusHash.value = hash
        censusDirty.value = false
      })

      const userStore = appUserStore()
      if (!userStore.user.recents) userStore.user.recents = []
      userStore.user.recents.unshift({pid: prospect.value.id, name: prospect.value.name})
      useToast().addToast(`Prospect ID ${prospect.value.id} created`, "success")
    }
    meta.value = fetcher.meta
    issue.value = fetcher.issue
  }
  async function updateProspect(data:any) {
    B.working.set(prospWorking, "Saving...")
    const curCensus = JSON.parse(JSON.stringify(B.ifNull(prospect.value.census, []))) // Clone the current census
    delete data.census
    const fetcher = await new BQAPIFetcher().callAPI(`/prospect?census=N`, 'PUT', data)
    B.working.clear(prospWorking)
    if (fetcher.resp != null) {
      prospect.value = fetcher.resp.prosp
      prospect.value.census = [...curCensus]
      const userStore = appUserStore()
      userStore.user.recents[0].name = prospect.value.name
      // console.dir(userStore.user.faves)
      userStore.user.faves.forEach((fave:any) => {
        if (fave.pid == prospect.value.id) {
          fave.name = prospect.value.name
        }
      })
      useToast().addToast("Prospect Changes Saved", "success")
    }
    meta.value = fetcher.meta
    issue.value = fetcher.issue
  }

  async function getCensus() {
    B.working.set(censusWorking, "Loading...")
    const fetcher = await new BQAPIFetcher().callAPI(`/census/${prospect.value.id}`, 'GET')
    B.working.clear(censusWorking)
    if (fetcher.resp != null) {
      prospect.value.census.length = 0
      prospect.value.census = sortCensus([...fetcher.resp[0].census])
      B.getHash(JSON.stringify(prospect.value.census)).then(hash => {
        censusHash.value = hash
        censusDirty.value = false
      })
    }
    meta.value = fetcher.meta
    issue.value = fetcher.issue
  }
  async function updateCensus(data:any) {
    B.working.set(censusWorking, "Saving...")
    console.log("Saving...")
    console.log(data)
    const fetcher = await new BQAPIFetcher().callAPI(`/census/${prospect.value.id}`, 'PUT', data)
    B.working.clear(censusWorking)
    if (fetcher.resp != null) {
      prospect.value.census.length = 0
      prospect.value.census = [...fetcher.resp[0].census]
      B.getHash(JSON.stringify(prospect.value.census)).then(hash => {
        censusHash.value = hash
        censusDirty.value = false
      })
      useToast().addToast("Census Changes Saved", "success")
    }
    meta.value = fetcher.meta
    issue.value = fetcher.issue
  }
  const exportCensus = async () => {
    const census = flattenCensus()
    const worksheet = XLSX.utils.json_to_sheet(census)
    worksheet['!cols'] = [
      { wch: 4 },  // Sub number
      { wch: 7 },  // Relation
      { wch: 19 }, // Last
      { wch: 19 }, // First
      { wch: 4 },  // MI
      { wch: 5 },  // Suffix
      { wch: 11 }, // DOB
      { wch: 4 },  // Sex
      { wch: 4 },  // MED
      { wch: 4 },  // DEN
      { wch: 4 },  // VIS
      { wch: 7 },  // Sub COBRA
      { wch: 9 }   // Dep Disabled
    ];
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Census")

    try {
      // 1. Prompt the user with the native blocking save dialog
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: `BQ Census for Prospect ${prospect.value.id}.xlsx`,
        types: [{
          description: 'Excel Workbook',
          accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
          }
        }]
      });

      // --- The code cleanly pauses here until the user clicks "Save" ---

      // 2. Generate the raw Excel file bytes using SheetJS
      const rawData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      // 3. Write the data directly to the chosen file handle
      const writable = await handle.createWritable();
      await writable.write(rawData);
      await writable.close();

      // 4. Runs strictly AFTER the file is successfully saved
      useToast().addToast("Census exported successfully", "success");

    } catch (err: any) {
      // Suppress notifications if the user intentionally closes/cancels the native window
      if (err.name !== 'AbortError') {
        useToast().addToast(`Error while exporting: ${err.message || err}`, "error");
      }
    }
  }

  const flattenCensus = ():any => {
    const flat = [] as any[]
    prospect.value.census.forEach((sub: any, rn:number) => {
      flat.push({
        'Sub':rn+1, 'Relation':'',
        'Last Name':sub.lstnam, 'First Name':sub.fstnam, 'MI':sub.midnam, 'Suffix':sub.suffnam,
        'DOB':sub.dob, 'Sex':sub.sex,
        'MED':sub.med ? 'Y' : '', 'DEN':sub.den ? 'Y' : '', 'VIS':sub.vis ? 'Y' : '',
        'COBRA':sub.cobra ? 'Y' : '', 'Disabled':''
      })
      if (sub.deps && Array.isArray(sub.deps)) {
        sub.deps.forEach((dep: any) => {
          flat.push({
            'Sub':'', 'Relation':dep.relation,
            'Last Name':dep.lstnam, 'First Name':dep.fstnam, 'MI':dep.midnam, 'Suffix':dep.suffnam,
            'DOB':dep.dob, 'Sex':dep.sex,
            'MED':dep.med ? 'Y' : '', 'DEN':dep.den ? 'Y' : '', 'VIS':dep.vis ? 'Y' : '',
            'COBRA': '', 'Disabled':dep.dis ? 'Y' : '',
          })
        })
      }
      // console.log(JSON.stringify(flat, null, 2))
    });
    return flat
  }

  const importCensus = (event:Event) => {
    console.log("Before Import")
    console.log(prospect.value.census)
    const target = event.currentTarget as HTMLInputElement
    if (target.files && target.files.length > 0) {
      const file = target.files[0] as File

      const reader = new FileReader();

      // Define what happens once the file is completely read into memory
      reader.onload = function(e) {
        if (!e.target) {
          useToast().addToast("No data in census reader", "error")
          return
        }
        const data = e.target.result; // This is the ArrayBuffer containing file data

        /* Parse file data and generate a SheetJS workbook object */
        const workbook = XLSX.read(data, { type: 'array' });

        /* Get the name of the first worksheet */
        const firstSheetName:string = workbook.SheetNames[0] as string

        /* Get the actual worksheet object */
        const worksheet:XLSX.WorkSheet = workbook.Sheets[firstSheetName] as XLSX.WorkSheet;

        /* Convert the worksheet rows into a readable array of JSON objects */
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Display the formatted JSON on the page
        mapImportJSONToCensus(jsonData)
        setCensusDirty()
        target.value = ''
        target.blur()

        console.log("After Import")
        console.log(prospect.value.census)
      }
      reader.readAsArrayBuffer(file);
    }
  }
  const addNodeIfNotNull = (parent:any, nodeName:string, value:any) => {
    if (value) parent[nodeName] = value
  }
  const mapImportJSONToCensus = (json:any) => {
    prospect.value.census.length = 0
    let sub:any = null
    for(let rn = 0; rn < json.length; rn++) {
      const mem = json[rn]
      const relation = mem["Relation"]
      if (relation == '') {
        sub = {
          relation: mem["Relation"],
          lstnam: mem["Last Name"], fstnam: mem["First Name"], midnam: mem["MI"],
          dob: mem["DOB"], sex: mem["Sex"],
          med: mem["MED"] != "", den: mem["DEN"] != "", vis: mem["VIS"] != "",
          cobra: mem["COBRA"] != "", dis: mem["DIS"] != "",
          deps: []
        }
        addNodeIfNotNull(sub, "suffnam", mem["Suffix"])
        prospect.value.census.push(sub)
      } else {
        if (sub != null) {
          const dep = {
            relation: mem["Relation"],
            lstnam: mem["Last Name"], fstnam: mem["First Name"], midnam: mem["MI"],
            dob: mem["DOB"], sex: mem["Sex"],
            med: mem["MED"] != "", den: mem["DEN"] != "", vis: mem["VIS"] != "",
            cobra: mem["COBRA"] != "", dis: mem["DIS"] != ""
          }
          addNodeIfNotNull(dep, "suffnam", mem["Suffix"])
          sub.deps.push(dep)
        }
      }
    }
    useToast().addToast("Census imported", "success")
  }

  return {
    prospWorking, censusWorking, meta, issue,
    censusDirty, getCensus, updateCensus, importCensus, exportCensus,
    quotes,
    prospect, createProspect, updateProspect, getProspect, searchProspects, searchResults, deleteProspect,
    removeMeFromRecents, setFavorite, isCurrentlyFavorite, setCensusDirty };
  }
);
