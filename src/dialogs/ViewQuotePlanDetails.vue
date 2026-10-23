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


</script>

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

<template>
  <div>
    <div class="info">{{ B.codeToText.qtype(props.family) }} Plan: {{ props.plncod }}</div>
    <table class="form-table" v-if="props.attrs && props.details">
      <tbody>
        <tr v-for="(attr, rn) of props.attrs" :key="rn">
          <td>{{ attr?.descr }}</td><td class="val">{{ props.details[attr.id] ? props.details[attr.id].value : '*none*' }}</td>
        </tr>
      </tbody>
    </table>
  </div>

</template>
