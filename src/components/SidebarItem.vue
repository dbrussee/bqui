<script setup lang="ts">
import BIcon from './B/BIcon.vue';
// import { appUserStore } from '@/stores/AppUserStore';
// const userStore = appUserStore()

const props = defineProps({
  current: {
    type: Boolean,
    required: false,
    default: false
  },
  working: {
    type: String,
    required: false,
    default: null
  },
  mode: {
    type: String,
    required: false,
    default: 'full'
  },
  icon: {
    type: String,
    required: true
  },
  badge: {
    type: Number,
    required: false,
    default: 0
  },
  shortname: {
    type: String,
    required: true
  },
  longname: {
    type: String,
    required: false,
    default: ''
  },

})

const getIconColor = () => {
  let rslt = ''
  if (props.mode == 'icons') {
    if (props.badge > 0) {
      rslt = 'red'
    }
  }
  return rslt
}
</script>

<template>
  <div class="content" :class="{'picked': props.current}">
    <BIcon :color="getIconColor()" :style="{'font-size': props.mode == 'icons' ? '1.5em' : '1em'}" :working="props.working" :icon='props.icon' /><span v-if="props.mode == 'full'" v-html="props.shortname"/>
      <p v-if="props.mode == 'full'" style="font-size: .8em;" v-html="props.longname"></p>
  </div>
</template>

<style lang="css">
  .content {
    display: block;
    padding-top: .3em;
    cursor: pointer;

    padding-bottom: .3em;
    border-bottom: 1px solid var(--table-row-border-color);
    padding-left: .3em;
    border-left: 3px solid transparent;

    &:hover {
      color: oklch(100% 0 0);
      background-color: var(--table-row-picked-bg);

      /* p { color: var(--form-prompt-color); } */
    }
    p { color: var(--form-prompt-color); }

  }
  .picked {
    color: var(--table-row-picked-text) !important;
    background-color: var(--table-row-picked-bg);

    /* p { color: var(--form-prompt-color); } */
  }
</style>
