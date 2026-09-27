<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import BButton from '@/components/B/BButton.vue'
import { appProspectStore } from '@/stores/ProspectStore'
const prospStore = appProspectStore()
import { useNewProspectPopup } from './useNewProspectPopup'
const { popRef, closeNewProspect, createProspect } = useNewProspectPopup()
import { reactive } from 'vue'

const prosp = reactive({
  name: "New Prospect",
  addr1: "", addr2: "", city: "", state_cd: "NC", zip_cd: "", county: null,
  size_cd: "", group_type: "", subs_estimate: 1,
  contact: "", phone: "", email: ""
})

</script>
<template>
  <dialog ref="popRef" popover="manual">
    <div class="titlebar">Create New Prospect</div>
    <form @submit.prevent="createProspect(prosp)">
      <table class="form-table">
        <tbody>
          <tr><th>Group Name:</th><td><input name="grpname" style="width: 30em;" v-model="prosp.name"></td></tr>
          <tr><th>Contact:</th><td><input name="grpcontact" style="width: 30em;" v-model="prosp.contact"></td></tr>
          <tr><th>Email:</th><td><input name="grpemail" style="width: 30em;" v-model="prosp.email"></td></tr>
          <tr><th>Phone:</th><td><input name="grpphone" style="width: 12em;" v-model="prosp.phone"></td></tr>
          <tr><th>Eligible:</th><td><input name="estimate" style="width: 5em;" v-model="prosp.subs_estimate"> <span class="info">(estimate)</span></td></tr>
          <tr><th>Address:</th><td><input name="grpaddr1" style="width: 30em;" v-model="prosp.addr1"></td></tr>
          <tr><th></th><td><input name="grpaddr2" style="width: 30em;" v-model="prosp.addr2"></td></tr>
          <tr><th></th><td>
            <input name="grpcity" style="width: 12em; margin-right: .3em;" v-model="prosp.city">
            <input name="grpstate" style="width: 3em; margin-right: .3em;" v-model="prosp.state_cd">
            <input name="grpzip" style="width: 6em;" v-model="prosp.zip_cd">
          </td></tr>
        </tbody>
      </table>
      <div class="buttonbar">
        <span v-if="prospStore.censusDirty" style="float:left; color:red">You will lose unsaved census changes!</span>
        <BButton :disabled="prospStore.prospWorking != null" type="button" class="anchor" icon="#red solid x" @click="closeNewProspect()">Cancel</BButton>&nbsp;
        <BButton :disabled="prospStore.prospWorking != null" type="submit" class="action" icon="square-plus_">Create Prospect</BButton>
      </div>
    </form>
  </dialog>


</template>
