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
    type: [String,null],
    required: false,
    default: null
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

</script>

<template>
  <div class="content" :class="{'picked': props.current}">
    <BIcon :working="props.working" :icon='props.icon' style="font-size: 1.3em; margin-right: .05em; margin-bottom: .2em;" /><span v-html="props.shortname"/>
      <p class="truncate-text" style="font-size: .8em;" v-html="props.longname"></p>
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

  background-color: var(--table-row-bg);
  color: white;

  i.fa {
    color: var(--bcbs-light-blue);
  }

  &:hover {
    background-color: var(--table-row-picked-bg);
    color: var(--table-row-picked-text) !important;
    i.fa {
      color: goldenrod;
    }
  }
  &.picked {
    background-color: var(--table-row-picked-bg);
    color: var(--table-row-picked-text) !important;
    i.fa {
      color: var(--bcbs-dark-blue);
    }
  }


}


  .xcontent {
    display: block;
    padding-top: .3em;
    cursor: pointer;

    padding-bottom: .3em;
    border-bottom: 1px solid var(--table-row-border-color);
    padding-left: .3em;
    border-left: 3px solid transparent;

    color: white;
    i.fa {
      color: bisque;
    }

    &:hover {
      background-color: var(--table-row-picked-bg);
      /* color: oklch(100% 0 0); */
      color: sienna;
      /* color: white; */
      i.fa {
        color: sienna;
      }

      p { color: sienna; }
    }
    /* p { color: var(--form-prompt-color); } */

  }
  .xpicked {
    /* color: var(--table-row-picked-text) !important; */
    color: black !important;
    i.fa {
      color: black;
    }
    p { color: black; }
    background-color: var(--table-row-picked-bg);

    /* p { color: var(--form-prompt-color); } */
  }
  .truncate-text {
    white-space: nowrap;      /* 1. Prevents the text from wrapping to a new line */
    overflow: hidden;         /* 2. Hides the text that overflows the element's box */
    text-overflow: ellipsis;  /* 3. Adds the actual '...' to the end of the truncated text */
    width: 100%;              /* 4. Gives the element a boundary (can also be a max-width or fixed px/rem width) */
  }
</style>
