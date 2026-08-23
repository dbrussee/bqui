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
  icon: {
    type: String,
    required: false,
    default: ''
  },
  iconcolor: {
    type: String,
    required: false,
    default: ''
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
  title: {
    type: String,
    required: false,
    default: "",
  },
});

</script>
<template>
  <BPopup
    :id="popid"
    :class="$attrs.class"
    :as="props.as"
    :buttons="[
      {text: props.confirm_button_text, action: () => emit('confirm')}
    ]"
    :linkicon="props.icon"
    :iconcolor="props.iconcolor"
    :linktext="props.linktext"
    ><slot>Are you sure?</slot></BPopup
  >
</template>

<style lang="css" scoped>
/* [popover]:popover-open {
  position-area: left;
} */
/* .info_title {
  padding-bottom: 0.2em;
  margin-right: 0.5em;
  border-bottom: 1px solid black;
  margin-bottom: 0.2em;
} */
</style>
