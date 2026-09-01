<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, useId } from "vue";
import { appProspectStore } from "@/stores/ProspectStore";
const prospectStore = appProspectStore();
import ProspectComponent from "@/components/ProspectComponent.vue";
import QuoteListComponent from "@/components/QuoteListComponent.vue";
import BButton from "@/components/B/BButton.vue";

const prospHandler = ref({
  id: useId(),
  temp: {
    id: -1, grpnum: null, name: "", dba: null, agent_id: "",
    addr1: "", addr2: "", city: "", state_cd: "NC", zip_cd: "", county: null,
    size_cd: "", group_type: "", subs_estimate: 1,
    created_ts: "", created_by: "",
    last_quoted_ts: null, enrolled_ts: null,
    contact: "", phone: "", email: "",
    enroll_date: (() => {
      const d = new Date()
      d.setMonth(d.getMonth() + 3)
      d.setDate(1)
      return d.toLocaleDateString()
    })()
  } as any,
  edit: () => {
    const popup = document.getElementById(prospHandler.value.id) as HTMLDialogElement
    popup?.showModal()
  },
  save: () => {
    prospectStore.createProspect(prospHandler.value.temp)
    const popup = document.getElementById(prospHandler.value.id) as HTMLDialogElement
    popup?.close()
  },
  abort: () => {
    const popup = document.getElementById(prospHandler.value.id) as HTMLDialogElement
    popup?.close()
  }
})

</script>
<template>
  <div class="drop_menu">
    <BButton @click="prospHandler.edit()" class="action" icon="square-plus_">New Prospect&hellip;</BButton>
  </div>
  <ProspectComponent />
  <div style="margin-top: .5em;" v-if="prospectStore.prospect">
    <QuoteListComponent />
  </div>

  <dialog :id="prospHandler.id">
    <div class="titlebar">New Prospect</div>
    <table class="form-table">
      <tbody>
        <tr><th>Group Name:</th><td><input name="grpname" style="width: 30em;" v-model="prospHandler.temp.name"></td></tr>
        <tr><th>Contact:</th><td><input name="grpcontact" style="width: 30em;" v-model="prospHandler.temp.contact"></td></tr>
        <tr><th>Email:</th><td><input name="grpemail" style="width: 30em;" v-model="prospHandler.temp.email"></td></tr>
        <tr><th>Phone:</th><td><input name="grpphone" style="width: 12em;" v-model="prospHandler.temp.phone"></td></tr>
        <tr><th>Subscribers:</th><td><input name="estimate" style="width: 5em;" v-model="prospHandler.temp.subs_estimate"> <span class="info">(estimate)</span></td></tr>
        <tr><th>Address:</th><td><input name="grpaddr1" style="width: 30em;" v-model="prospHandler.temp.addr1"></td></tr>
        <tr><th></th><td><input name="grpaddr2" style="width: 30em;" v-model="prospHandler.temp.addr2"></td></tr>
        <tr><th></th><td>
          <input name="grpcity" style="width: 12em; margin-right: .3em;" v-model="prospHandler.temp.city">
          <input name="grpstate" style="width: 3em; margin-right: .3em;" v-model="prospHandler.temp.state_cd">
          <input name="grpzip" style="width: 6em;" v-model="prospHandler.temp.zip_cd">
        </td></tr>
        <tr><th>Enroll Date:</th><td><input name="enrollDate" style="width: 10em;" v-model="prospHandler.temp.enroll_date"></td></tr>
        <tr><td colspan="2">
          <div class="buttonbar">
            <BButton class="anchor" icon="#red solid x" @click="prospHandler.abort()">Cancel</BButton>&nbsp;
            <BButton class="action" icon="square-plus_" @click="prospHandler.save()">Create Prospect</BButton>
          </div>
        </td></tr>
      </tbody>
    </table>
  </dialog>

</template>
<style lang="css" scoped></style>
