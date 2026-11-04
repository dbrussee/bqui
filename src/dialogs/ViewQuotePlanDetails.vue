<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { type PropType } from 'vue';
import type { Iquote } from '@/types';
import { B } from '@/composables/BUtils';

const props = defineProps({
  family: {
    type: String,
    required: true
  },
  plncod: {
    type: String,
    required: true
  },
  quote: {
    type: Object as PropType<Iquote>,
    required: true
  },
  details: {
    type: Object || null,
    required: true
  },
  attrs: {
    type: Array as PropType<Array<Record<string, any>>> | null,
    required: true
  },
})

const getPlanName = () => {
  if (!props.details.name) return props.plncod
  return props.details.name
}
const getAttributeValue = (attrid:string) => {
  if (!props.details.attrs) return ""
  if (!props.details.attrs[attrid]) return ""
  return props.details.attrs[attrid].value
}

</script>


<template>
  <div>
    <div class="info">{{ B.codeToText.qtype(props.family) }} Plan: {{ getPlanName() }}</div>
    <table class="form-table" v-if="props.attrs && props.details">
      <tbody>
        <tr v-for="(attr, rn) of props.attrs" :key="rn">
          <td>{{ attr?.descr }}</td><td class="val">{{ getAttributeValue(attr.id) }}</td>
        </tr>
      </tbody>
    </table>
  </div>

</template>

<style scoped>
  table {
    margin-left: .5em;
    margin-bottom: .3em;
    width: calc(100% - .5em);
    tr {
      border-bottom: 1px solid var(--table-row-border-color);
    }
  }
  td.val {
    width: 10em;
    padding-left: .5em;
  }
  </style>
