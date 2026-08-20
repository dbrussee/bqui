<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import BTable from '@/components/BTable.vue';
import { ref } from 'vue';
import FA from '@/components/FA.vue';
// import { B } from "@/composables/BUtils";

// import { appUserStore } from '@/stores/AppUserStore';
// const userStore = appUserStore()

const cfgCensus = ref({
  height: "calc(100vh = 7em)",
  columns: [
    { id: "relation", heading: "", width: "3em", flags: "C" },
    { id: "fstnam", heading: "First Name" },
    { id: "lstnam", heading: "Last Name" },
    { id: "midnam", heading: "Mid", width: "2em", flags: "C" },
    { id: "sex", heading: "Sex", width: "3em", flags: "C" },
    { id: "dob", heading: "DOB", width: "6em", flags: "C" },
    { id: "med", heading: "MED", width: "4em", flags: "C" },
    { id: "den", heading: "DEN", width: "4em", flags: "C" },
    { id: "vis", heading: "VIS", width: "4em", flags: "C" },
    { id: "cobra", heading: "COBRA", width: "4em", flags: "C" },
    { id: "dis", heading: "Dis", width: "4em", flags: "C" },
  ],
})

const sample = [
  {relation:'SUB', fstnam:'Daniel', lstnam:'Brussee', midnam:'',
    sex:'M', dob:'9/1/1960', med:true, den:true, vis:true, cobra:false, dis:false}
]

</script>

<template>
  <div class="drop_menu">
    <FA clickable icon="square-plus_" >New Subscriber</FA>&nbsp;
  </div>

  <BTable :config="cfgCensus" :rows="sample"/>
</template>

<style scoped>
</style>
