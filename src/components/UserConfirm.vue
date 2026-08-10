<script setup lang="ts">
import { useId } from 'vue';
const popid = useId()
const emit = defineEmits(["confirm"]);

const props = defineProps({
  as_anchor: {
    type: Boolean,
    required: false,
    default: false,
  },
  confirm_button_text: {
    type: String,
    required: false,
    default: "Confirm"
  },
  cancel_button_text: {
    type: String,
    required: false,
    default: ""
  },
  title: {
    type: String,
    required: false,
    default: "",
  },
});

function confirm() {
  emit("confirm")
}
function cancel() {
  document.getElementById("info-div")?.togglePopover();
}
</script>

<template>
  <button :popovertarget="popid" :class="{anchor: props.as_anchor}"><slot/></button>
  <div :id="popid" popover>
    <div v-if="props.title != ''" class="info_title">
      {{ props.title }}
    </div>
    <!-- <div v-else class="info_title">
      <slot/>
    </div> -->
    <div class="info">
      <slot name="content">Are you sure?</slot>
    </div>
    <div class="buttonbar">
      <form @submit.prevent="confirm()">
      <button v-if="props.cancel_button_text != ''" type="button" :innerHTML="props.cancel_button_text" style="margin-right: .2em;" @click="cancel()"/>
      <button autofocus type="submit" v-if="props.confirm_button_text != ''" :innerHTML="props.confirm_button_text"/>
      </form>
    </div>
  </div>
</template>

<style lang="css" scoped>
.buttonbar {
  padding-top: .3em;
  padding-right: .5em;
  /* border-top: 1px solid black; */
  margin-top: .3em;
  text-align: right;
}
[popover]:popover-open {
  position-area: left;
}
.info_title {
  padding-bottom: 0.2em;
  border-bottom: 1px solid black;
  margin-bottom: 0.2em;
  /* margin-right: .5em; */
}
</style>
