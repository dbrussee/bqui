<script setup lang="ts">
import { useId } from "vue";
import BPopup from "./BPopup.vue";
defineOptions({
  inheritAttrs: false
})

const emit = defineEmits(["confirm"]);
const popid = useId();

const props = defineProps({
  linktext: {
    type: String,
    required: true,
  },
  as: {
    type: String,
    required: false,
    default: "button",
    validator(value: string) {
      return ["anchor", "button"].includes(value);
    },
  },
  confirm_button_text: {
    type: String,
    required: false,
    default: "Confirm",
  },
  cancel_button_text: {
    type: String,
    required: false,
    default: "",
  },
  title: {
    type: String,
    required: false,
    default: "",
  },
});

function clickButton(btn: string) {
  if (btn == props.confirm_button_text) {
    confirm();
  } else {
    cancel();
  }
}
function confirm() {
  emit("confirm");
}
function cancel() {
  // document.getElementById(popid)?.close();
}
</script>
<template>
  <BPopup
    :id="popid"
    :class="$attrs.class"
    :as="props.as"
    :buttons="props.confirm_button_text + ',' + props.cancel_button_text"
    @button-clicked="clickButton($event)"
    :linktext="props.linktext"
    ><slot>Are you sure?</slot></BPopup
  >
</template>

<style lang="css" scoped>
.buttonbar {
  padding-top: 0.3em;
  padding-right: 0.5em;
  /* border-top: 1px solid black; */
  margin-top: 0.3em;
  text-align: right;
}
[popover]:popover-open {
  position-area: left;
}
.info_title {
  padding-bottom: 0.2em;
  margin-right: 0.5em;
  border-bottom: 1px solid black;
  margin-bottom: 0.2em;
  /* margin-right: .5em; */
}
</style>
