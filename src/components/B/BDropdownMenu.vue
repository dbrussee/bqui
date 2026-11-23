<script setup lang="ts">
import { computed, ref } from 'vue'
import BPopup from './BPopup.vue';
import BButton from './BButton.vue';
import BIcon from './BIcon.vue';


const thePopup = ref<InstanceType<typeof BPopup> | null>(null)
const emit = defineEmits<{
  change: [value: string]
}>()

const props = defineProps({
  options: {
    type: Array<any>,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false
  },
  width: {
    type: String,
    required: false,
    default: "fit-content",
  },
  heading: {
    type: String,
    required: false,
    default: "",
  },
  pos: { // For confirm popover
    type: String,
    required: false,
    default: 'B2R',
    validator(value: string) {
      return [
        'T','T2L','T2R',
        'R','R2T','R2B',
        'B','B2L','B2R',
        'L','L2T','L2B'
      ].includes(value)
    }
  },
})

const current = computed(() => {
  const item = props.options.find((opt:any) => {
    return opt.value == props.value
  })
  if (item) {
    return item
  } else {
    return {value:'', text:'Unknown', icon:'solid ban'}
  }
})

const doEmit = (val:string) => {
  emit('change', val)
  thePopup.value?.close()
}
</script>

<template>
  <BPopup ref="thePopup"
      :heading="props.heading"
      :disabled="props.disabled"
      :pos="props.pos"
      class="normal forced"
      :icon="current.icon">{{ current.text }}<BIcon style="font-size:.7em;" icon="solid _angle-down"/>
    <template #body>
      <template v-for="(opt, rn) in props.options" :key="rn">
        <hr v-if="opt == '--'" style="border-color: sienna; margin-top: -.2em; margin-bottom: .5em;"/>
        <p v-else><BButton @click="doEmit(opt.value)" class="anchor" :icon="opt.icon">{{opt.text}}</BButton></p>
      </template>
    </template>
  </BPopup>
</template>

<style scoped>

</style>
