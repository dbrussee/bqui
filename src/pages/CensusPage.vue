<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
// import BTable from '@/components/BTable.vue';
import { ref } from 'vue';
import { appProspectStore } from '@/stores/ProspectStore';
import BIcon from '@/components/B/BIcon.vue';
import BButton from '@/components/B/BButton.vue';
import BConfirm from '@/components/B/BConfirm.vue';
const prospStore = appProspectStore()

const deduceTHStyle = (col:any) => {
  const style = {} as Record<string, string>;
  deduceJustification(style, col);
  if (col.width) {
    style.width = col.width;
  }
  return style;
};
const deduceJustification = (style: Record<string, string>, col:any) => {
  if (col.flags) {
    if (col.flags.includes("R")) {
      style.textAlign = "right";
    } else if (col.flags.includes("C")) {
      style.textAlign = "center";
    } else {
      style.textAlign = "left";
    }
  }
};


const cfgCensus = ref({
  height: "calc(100vh - 8em)",
  columns: [
    { id: "relation", heading: "", width: "3em" },
    { id: "lstnam", heading: " Last Name" },
    { id: "fstnam", heading: " First Name" },
    { id: "midnam", heading: "Mid", width: "2em", flags: "C" },
    { id: "dob", heading: "DOB", width: "6em", flags: "C" },
    { id: "sex", heading: "Sex", width: "2em", flags: "C" },
    { id: "plans", heading:"Med Den Vis", width: "6.5em", flags: "C" },
    { id: "cobra", heading: "COBRA", width: "4em", flags: "C" },
    { id: "dis", heading: "Dis", width: "3em", flags: "C" },
    { id:"acts", heading: "", width: "4.5em" }
  ],
})

// Enable up / down arrow handler
// const currentElement = ref({
//   rownum: -1,
//   cellnum: -1,
//   elnum: -1
// })
// const setCurrent = (e:Event) => {
//   const el = e.target as HTMLElement
//   if (el) {
//     const td = el.closest("td") as HTMLTableCellElement
//     if (td) {
//       currentElement.value.cellnum = td.cellIndex
//       const tr = td.closest("tr") as HTMLTableRowElement
//       currentElement.value.rownum = tr.rowIndex
//       currentElement.value.elnum = [...td.children].indexOf(el);
//     }
//   }
// }

const newSub = ():void => {
  const sub = {relation:"SUB", fstnam:'', lstnam:'', midnam:'',
    sex:'M', dob:'', med:false, den:false, vis:false, cobra: false, deps:[]
  } as any
  prospStore.prospect.census.unshift(sub)
  prospStore.setCensusDirty()
}
const delSub = (subnum:number):void => {
  prospStore.prospect.census.splice(subnum, 1)
  prospStore.setCensusDirty()
}
const newDep = (subnum:number):void => {
  const sub = prospStore.prospect.census[subnum] as any
  let relation = 'SPS'
  let sex = 'M'
  if (sub.deps.length > 0) {
    relation = 'CHD'
  } else {
    sex = sub.sex == 'M' ? 'F' : 'M'
  }
  const data = {relation:relation, fstnam:'', lstnam:sub.lstnam, midnam:'',
    sex:sex, dob:'', med:sub.med, den:sub.den, vis:sub.vis, cobra: false
  } as any
  sub.deps.push(data)
  prospStore.setCensusDirty()
}
const delDep = (subnum:number, depnum:number):void => {
  prospStore.prospect.census[subnum]?.deps.splice(depnum, 1)
  prospStore.setCensusDirty()
}

// const setButtonFocus = (e:Event):void => {
//   const el:HTMLElement = e.target as HTMLElement
//   const btn = el.closest("button")
//   btn?.focus()
// }
const setSubBoolean = (subnum:number, opt:string):void => {
  const sub = prospStore.prospect.census[subnum] as any
  if (sub) {
    sub[opt] = !sub[opt]
    if (opt != 'cobra') {
      sub.deps.forEach((dep:any)=> {
        dep[opt] = sub[opt]
      })
    }
  }
  prospStore.setCensusDirty()
}
const setDepBoolean = (subnum:number, depnum:number, opt:string):void => {
  const sub = prospStore.prospect.census[subnum] as any
  if (sub) {
    const dep = sub.deps[depnum] as any
    if (dep) dep[opt] = !dep[opt]
  }
  prospStore.setCensusDirty()
}
const setRelation = (subnum:number, depnum:number, e:Event) => {
  const sel = e.target as HTMLSelectElement
  const relation = sel.value
  const sub = prospStore.prospect.census[subnum] as any
  if (sub) {
    if (depnum < 0) {
      sub.relation = relation
    } else {
      const dep = sub.deps[depnum] as any
      if (relation == "CHD") {
        dep.relation = relation
      } else if (relation == 'SUB') {
        // Make a dependent a Subscriber
        // {'Joe', deps[
        //   'Jane',
        //   'Jimmy'
        // ]
        // ...
        // {'Jane', deps [
        //   'Joe',
        //   'Jimmy'
        // ]}
        // Clone the sub
        const oldSub = JSON.stringify(sub)
        const oldDeps = JSON.stringify(sub.deps)
        const newSub = JSON.parse(JSON.stringify(sub.deps[depnum]))
        newSub.deps = JSON.parse(oldDeps)
        newSub.relation = 'SUB'

        newSub.deps[depnum] = JSON.parse(oldSub)
        delete newSub.deps[depnum].deps
        newSub.deps[depnum].relation = dep.relation

        prospStore.prospect.census.splice(subnum, 1, newSub)
      } else { // SPS or DOM ... set all others to CHD and then set new value
        sub.deps.forEach((dep:any)=> {
          dep.relation = 'CHD'
        })
        dep.relation = relation
      }
    }
  }
  prospStore.setCensusDirty()
}
const setSex = (subnum:number, depnum:number):void => {
  // setButtonFocus(e)
  const sub = prospStore.prospect.census[subnum] as any
  if (sub) {
    if (depnum < 0) {
      sub.sex = sub.sex == 'M' ? 'F' : 'M'
    } else {
      const dep = sub.deps[depnum] as any
      dep.sex = dep.sex == 'M' ? 'F' : 'M'
    }
  }
  prospStore.setCensusDirty()
}

const updateCensusDirty = () => {
  prospStore.setCensusDirty()
}

</script>

<template>
  <div class="drop_menu">
    <BConfirm :bypass="!prospStore.censusDirty" class="anchor" width="20em" @confirm="prospStore.getProspect(prospStore.prospect.id)" icon="solid rotate-left_">Reload
      <template #message>
        Any changes you have made will be lost. Are you sure?
      </template>
    </BConfirm>&nbsp;
    <BButton class="action" icon="square-plus_" @click="newSub()">New Subscriber</BButton>&nbsp;
    <span style='float: right;'>
      <BIcon :as="prospStore.censusDirty ? 'anchor' : 'clickable'"
        :color="prospStore.censusDirty ? '' : 'gainsboro'"
        :icon="prospStore.censusDirty ? '#red solid floppy-disk_' : 'floppy-disk_'"
        @click="prospStore.updateProspect(prospStore.prospect)">Save Changes</BIcon>&nbsp;
    </span>
  </div>
  <div style="display: flex; justify-content: center;">
  <div class="b-table-container"
    :style="{
      width: 'fit-contents',
      margin: 'auto 0',
      position: 'relative',
      height: cfgCensus.height,
      'overflow-y': 'scroll',
    }"
  >
    <form @submit.prevent="" @keyup="updateCensusDirty()">
    <table style="margin: auto;">
      <thead>
        <tr>
          <th v-for="col in cfgCensus.columns" :key="col.id" :style="deduceTHStyle(col)">
            {{ col.heading }}
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(sub, rn) in prospStore.prospect.census" :key="sub">
          <tr :class="{seperator: Number(rn) > 0}">
            <td>&nbsp;</td>
            <td><input v-model="sub.lstnam" class="lstnam"/></td>
            <td><input v-model="sub.fstnam" class="fstnam"/></td>
            <td><input maxlength="1" v-model="sub.midnam" class="midnam"/></td>
            <td><input v-model="sub.dob" class="dob" placeholder="m/d/yyyy"/></td>
            <td style="text-align: center;"><button @click="(e:Event) => setSex(Number(rn), -1)" class="clear sex mono">{{ sub.sex }}</button></td>
            <td style="text-align: center;">
              <BButton class="clear" @click="(sub) => setSubBoolean(Number(rn), 'med')" :icon="sub.med ? 'square-check' : 'square'" />
              <BButton class="clear" @click="(sub) => setSubBoolean(Number(rn), 'den')" :icon="sub.den ? 'square-check' : 'square'" />
              <BButton class="clear" @click="(sub) => setSubBoolean(Number(rn), 'vis')" :icon="sub.vis ? 'square-check' : 'square'" />
            </td>
            <td class="cobra"><BButton class="clear" @click="(sub) => setSubBoolean(Number(rn), 'cobra')" :icon="sub.cobra ? 'square-check' : 'square'" /></td>
            <td class="dis">&nbsp;</td>
            <td>
              <BButton class="clear" @click="delSub(Number(rn))" icon="#red trash-can" />
              <BButton class="clear" @click="newDep(Number(rn))" icon="#black solid user-plus" />
            </td>
          </tr>
          <tr v-for="(dep, dn) in sub.deps" :key="dep">
            <td><select class="mono" style="width: 3.5em;" @change="setRelation(rn as number, dn as number, $event)">
                <option class="mono" :selected="dep.relation == 'SUB'" value="SUB">SUB - Subscriber</option>
                <option class="mono" :selected="dep.relation == 'SPS'" value="SPS">SPS - Spouse</option>
                <option class="mono" :selected="dep.relation == 'DOM'" value="DOM">DOM - Domestic Partner</option>
                <option class="mono" :selected="dep.relation == 'CHD'" value="CHD">CHD - Child</option>
            </select></td>
            <td><input v-model="dep.lstnam" class="lstnam"/></td>
            <td><input v-model="dep.fstnam" class="fstnam"/></td>
            <td><input maxlength="1" v-model="dep.midnam" class="midnam"/></td>
            <td><input v-model="dep.dob" class="dob" placeholder="m/d/yyyy"/></td>
            <td style="text-align: center;"><BButton class="clear sex" @click="(e:Event) => setSex(Number(rn), Number(dn))">{{ dep.sex }}</BButton></td>
            <td style="text-align: center;">
              <BButton class="clear" v-if="sub.med" @click="(sub) => setDepBoolean(Number(rn), Number(dn), 'med')" :icon="dep.med ? 'square-check' : 'square'"/>
              <BButton class="clear" v-else icon="#gainsboro solid ban"/>
              <BButton class="clear" v-if="sub.den" @click="(sub) => setDepBoolean(Number(rn), Number(dn), 'den')" :icon="dep.den ? 'square-check' : 'square'"/>
              <BButton class="clear" v-else icon="#gainsboro solid ban"/>
              <BButton class="clear" v-if="sub.vis" @click="(sub) => setDepBoolean(Number(rn), Number(dn), 'vis')" :icon="dep.vis ? 'square-check' : 'square'"/>
              <BButton class="clear" v-else icon="#gainsboro solid ban"/>
            </td>
            <td class="cobra">&nbsp;</td>
            <td class="dis"><BButton class="clear" v-if="dep.relation == 'CHD'" @click="(sub) => setDepBoolean(Number(rn), Number(dn), 'dis')" :icon="dep.dis ? 'square-check' : 'square'"/></td>
            <td><BButton class="clear" @click="delDep(Number(rn), Number(dn))" icon="#red trash-can"/></td>
          </tr>
      </template>
      </tbody>
    </table>
    </form>
  </div>
</div>

  <!-- <BTable :config="cfgCensus" :rows="sample"/> -->
</template>

<style scoped>
input {
  padding-left: 2px;
  padding-right: 2px;
  border: none;
  /* border-bottom: 1px solid gray; */
  /* outline: transparent; */
  font-size: 1em;
}
input.fstnam,
input.lstnam {
  width: 8em;
}
input.midnam {
  width: 2em;
  text-align: center;
}
button.sex {
  width: 1.8em;
}
td.med,
td.den,
td.vis,
td.cobra,
td.dis {
  /* width: 2em; */
  text-align: center;
  button {
    text-align: center;
    width: 1.5em;
    padding: 0;
    font-size: 1em;
  }
}
input.dob {
  width: 5.5em;
  text-align: center;
}
div.b-table-container {
  background-color: var(--unused_bgcolor);
  width: fit-content;
  overscroll-behavior: none;
}
div.b-table-heading {
  padding: 0.2rem 0.5rem;
  font-style: italic;
  color: var(--heading-color);
}
table {
  border-collapse: collapse;
  position: relative;
  background-color: white;
}
thead tr {
  top: 0;
  position: sticky;
  z-index: 1;
}
thead tr th {
  border-top: 1px solid var(--heading-color);
  border-bottom: 1px solid var(--heading-color);
  /* border: 1px solid var(--heading-color); */
  text-align: left;
  font-weight: normal;
  padding: 0.1rem 0.2rem;
  background-color: var(--heading-bgcolor);
  color: var(--heading-color);
  vertical-align: top;
}
tbody tr td {
  line-height: 1.1em;
  /* border-left: 1px solid transparent; */
  /* border-bottom: 1px solid transparent; */
  padding: 0.1rem 0.2rem;
  vertical-align: top;
  cursor: pointer;
}
/* tbody tr:hover {
  background-color: lightcyan;
} */
tr.seperator {
  border-top: 2px solid sienna;
  td {
    padding-top: .3em;
  }
}

</style>
