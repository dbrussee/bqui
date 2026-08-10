<script setup lang="ts">
import { useId } from 'vue';
const popid = useId()
const props = defineProps({
  title: {
    type: String,
    required: false,
    default: "",
  },
  pos: {
    type: String,
    required: false,
    default: "R"
  }
});

</script>

<template>
<button :popovertarget="popid" class="anchor"><span class="info_icon">?</span></button>
<div :id="popid" popover>
  <div v-if="props.title != ''" class="info_title">
    {{ props.title }}
  </div>
  <div class="local-info">
    <slot />
  </div>
</div>
</template>

<style lang="css" scoped>
* {
  font-size: 1rem;
}
div.local-info {
  padding-right: .5em;
  text-align: left;
}
[popover]:popover-open {
  position-area: top;
  /* Automatically flips the popover to the top if space runs out at the bottom */
  position-try-fallbacks: flip-block;
}
span.info_icon {
  position: relative;
  bottom: 0.15em;
  font-size: .9em;
  border: 1px solid sienna;
  padding-left: .25em;
  padding-right: .25em;
  border-radius: 50%;
  color: sienna;
  background-color: antiquewhite;

  &:hover {
    background-color: gainsboro;
    border-color: transparent;
    color: black;
  }
}
button.anchor:hover {
  text-decoration: none;
}
.info_title {
  padding-bottom: .2em;
  border-bottom: 1px solid black;
  margin-bottom: .2em;
  margin-right: .5em;

  text-align: left;
}
</style>
