<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, nextTick, toRaw } from 'vue'
import BInfo from './BInfo.vue';

const tableRef = ref<HTMLTableElement | null>(null)

interface IColumn {
  id: string
  flags?: string
  heading: string
  width?: string
  cellclass?: string
  hide?: boolean
}
// const emit = defineEmits(["pick", "unpick", "dblpick", "hdrclick"])
const props = defineProps({
  config: {
    type: Object as () => any,
    required: true,
  },
  rows: {
    type: Array as () => any[],
    required: false,
    default: () => [],
  },
})


const deduceTDStyle = (col: IColumn) => {
  const style = {} as Record<string, string>
  deduceJustification(style, col)
  return style;
};
const deduceTHStyle = (col: IColumn) => {
  const style = {} as Record<string, string>
  deduceJustification(style, col)
  if (col.width) {
    style.width = col.width
  }
  return style;
};
const deduceJustification = (style: Record<string, string>, col: IColumn) => {
  if (col.flags) {
    if (col.flags.includes("R")) {
      style.textAlign = "right"
    } else if (col.flags.includes("C")) {
      style.textAlign = "center"
    } else {
      style.textAlign = "left"
    }
  }
};

// const handleTableHeadClick = (event:MouseEvent) => {
//   event.stopImmediatePropagation()
//   const el = event.target as HTMLElement // could be anything
//   const cell = el.closest('th') as HTMLTableCellElement | null
//   if (!cell) return
//   const col = props.config.columns[cell.cellIndex]
//   emit("hdrclick", col)
// }

const pickedRowIndex = ref<number>(-1) // No row number
const doPick = (isDouble:boolean, row:any, ri?:number, col?:IColumn, ci?:number) => {
  if (!isDouble) {
    if (row == props.config.pickedRow) {
      pickedRowIndex.value = -1
      // emit('unpick', row, ri, col, ci)
      if (props.config['onUnpick']) {
        props.config.onUnpick(row, ri, col, ci)
      }
    } else {
      pickedRowIndex.value = ri as number
      // emit('pick')
      if (props.config['onPick']) props.config.onPick(row, ri, col, ci)
    }
  } else if (isDouble) {
      // emit('dblpick', row, ri, col, ci)
      if (props.config['onDblpick']) props.config.onDblpick(row, ri, col, ci)
  }
}
const handleTableBodyClick = (event:MouseEvent, isDouble:boolean) => {
  event.stopImmediatePropagation()
  event.preventDefault()
  const el = event.target as HTMLElement // could be anything
  const cell = el.closest('td') as HTMLTableCellElement | null
  if (!cell) return
  const col = props.config.columns[cell.cellIndex]
  const tr = cell.closest('tr') as HTMLTableRowElement
  // const row = props.rows[tr.rowIndex - 1] // Skip thead row
  const row = rowsByIndex.value[tr.rowIndex - 1]?.val
  doPick(isDouble, row, tr.rowIndex - 1, col, cell.cellIndex as number)
}

// Mainly culled from Google AI with extensive prompting
// Coordinate maps to bind layouts strictly to absolute row_col identifiers
const cellStylesMap = ref<Record<string, (el: HTMLTableCellElement) => void>>({});
const cellHtmlMap = ref<Record<string, string>>({});

// 1. Hook to capture container element mutation strategies from slots
const registerStyle = (rn: string | number, cn: string | number, callback: (el: HTMLTableCellElement) => void) => {
  cellStylesMap.value[`${rn}_${cn}`] = callback;
  return ''; // Outputs nothing to the mustache text node
};

// 2. Hook to capture custom raw text markup structures from slots
const registerHtml = (rn: string | number, cn: string | number, htmlString: string) => {
  cellHtmlMap.value[`${rn}_${cn}`] = htmlString;
  return ''; // Outputs nothing to the mustache text node
};

// 3. Post-render lifecycle execution handler triggered natively by Vue
const applyStyleRef = (el: any, rn: string | number, cn: string | number) => {
  if (el) {
    const cell = el as HTMLTableCellElement;
    const customizer = cellStylesMap.value[`${rn}_${cn}`];
    if (customizer) {
      customizer(cell);
    }
  }
};

const getCellValue = computed(() => {
  return (row:any, col:any):string => {
    if (typeof row == 'string') return row
    const dotList:string[] = col.id.split(".")
    let value = row
    dotList.forEach(element => {
      value = value[element]
    });
    return value as string
  }
})

const rowsByIndex = computed(() => {
  if (!props.rows) return []
  return props.rows.map((value, rn) => ({
    id: `row-${rn}`, // Stable DOM key that never changes positions
    val: value      // The raw primitive value
  }))
})


const scrollToSelectedRow = async () => {
  await nextTick();

  if (!tableRef.value) return;

  const container = tableRef.value;
  const selectedRow = container.querySelector('.picked') as HTMLElement;
  const stickyHeader = container.querySelector('thead') as HTMLElement;

  // Accurately checks the current pixel height of the header at this browser size
  const headerHeight = stickyHeader ? stickyHeader.offsetHeight : 0;

  if (selectedRow) {
    const containerTop = container.scrollTop;
    // Captures the exact, live pixel equivalent of your 50vh value
    const containerBottom = containerTop + container.clientHeight;

    const rowTop = selectedRow.offsetTop;
    const rowBottom = rowTop + selectedRow.offsetHeight;

    const buffer = 0;

    // Moving Down
    if (rowBottom > containerBottom) {
      container.scrollTop = rowBottom - container.clientHeight + buffer;
    }
    // Moving Up (Subtracting the sticky header space)
    else if (rowTop - headerHeight < containerTop) {
      container.scrollTop = rowTop - headerHeight - buffer;
    }
  }
};

const handleKeyDown = (event:KeyboardEvent) => {
  // console.dir(event)
  if (props.rows.length == 0) return // Nothing to pick
  // No picked row indicator... cant pick rows!
  if (props.config.onPick == undefined) return
  if (pickedRowIndex.value < 0) {
    if (event.key === 'ArrowDown') {
      const row = rowsByIndex.value[0]
      if (row) {
        doPick(false, row.val, 0)
        scrollToSelectedRow()
      }
    }
    if (event.key === 'ArrowUp') {
      const lastRowNumber = props.rows.length - 1
      const row = rowsByIndex.value[lastRowNumber]
      if (row) {
        doPick(false, row.val, lastRowNumber)
        scrollToSelectedRow()
      }
    }
    return;
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault(); // Prevent page scrolling
    if (pickedRowIndex.value < props.rows.length - 1) {
      const newIndex = pickedRowIndex.value + 1
      const row = rowsByIndex.value[newIndex]
      if (row) {
        doPick(false, row.val, newIndex)
        scrollToSelectedRow()
      }
    }
  } else if (event.key === 'ArrowUp') {
    event.preventDefault(); // Prevent page scrolling
    if (pickedRowIndex.value > 0) {
      const newIndex = pickedRowIndex.value - 1
      const row = rowsByIndex.value[newIndex]
      if (row) {
        doPick(false, row.val, newIndex)
        scrollToSelectedRow()
      }
    }
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault(); // Prevent page scrolling
    if (pickedRowIndex.value >= 0) {
      const index = pickedRowIndex.value
      const row = rowsByIndex.value[index]
      if (row) doPick(true, row.val, index)
    }
  } else if (event.key === 'Escape') {
    // if (!props.config['onUnpick']) return
    // event.preventDefault(); // Prevent page scrolling
    if (pickedRowIndex.value >= 0) {
      const index = pickedRowIndex.value
      const row = rowsByIndex.value[index]
      if (row) doPick(false, null, -1) // unpicks if allowed by implemention
    }
  }
}

const isPicked = (rowval:any):boolean => {
  return toRaw(props.config.pickedRow) == toRaw(rowval)
}
</script>


<template>
  <div style="width: fit-content">
  <div v-if="props.config.heading && props.config.heading != ''" class="b-table-heading">
    {{ props.config.heading }}
  </div>
  <div class="b-table-container"
    ref="tableRef"
    tabindex="0"
    @keydown="handleKeyDown"
    :style="{
      height: 'calc(' + props.config.height + ($slots.footer ? ' - 1.3em)' : ')'),
      'overflow-y': props.config.height == '' ? 'hidden' : 'auto',
    }"
  >
    <table :style="{ width: props.config.width }" :class="{'nohover': (props.config.hover != undefined && props.config.hover == false)}">
    <!-- <thead @click="handleTableHeadClick($event)"> -->
    <thead>
      <tr>
        <template v-for="col in props.config.columns" :key="col.id">
        <th v-if="col.hide == undefined || !col.hide" :style="deduceTHStyle(col)">
          <span :innerHTML="col.heading"/><BInfo v-if="col.help && col.help != ''" width="22em">{{ col.help }}</BInfo>
        </th>
        </template>
      </tr>
    </thead>
    <tbody
        @click.prevent="handleTableBodyClick($event, false)"
        @dblclick.prevent="handleTableBodyClick($event, true)"
        >
        <tr v-for="(row, rn) in rowsByIndex" :key="row.id"
            :class="{picked : isPicked(row.val)}">
          <td v-for="(col,cn) in props.config.columns" :key="col.id"
              :class="col.cellclass"
              :style="deduceTDStyle(col)"
              :ref="(el) => applyStyleRef(el, rn, cn)"
            >
            <template v-if="$slots['column_' + col.id]">
            <slot v-if="row"
                :name="'column_' + col.id"
                :row="row.val"
                :rn="rn"
                :col="col"
                :cn="cn"
                :setHtml="(htmlStr:string) => registerHtml(rn, cn, htmlStr)"
                :setStyle="(styleCb:any) => registerStyle(rn, cn, styleCb)">
              </slot>
            </template>
            <template v-else>
              {{ getCellValue(row.val, col) }}
            </template>
            <span v-if="cellHtmlMap[`${rn}_${cn}`]" v-html="cellHtmlMap[`${rn}_${cn}`]"></span>
          </td>
        </tr>
        <tr v-if="(!props.rows || props.rows.length == 0) && props.config.no_rows_text && props.config.no_rows_text != ''" class="no_rows_text">
          <td :colspan="props.config.columns.length" :innerHTML="props.config.no_rows_text" />
        </tr>
      </tbody>
    </table>
  </div>
  <div v-if="$slots.footer" class="b-table-footer" @click.self="doPick(false,null,-1)"><slot name="footer"/>&nbsp;</div>
  </div>
</template>


<style scoped lang="css">
tr.no_rows_text {
  cursor: default;
  &:hover {
    background-color: transparent;
  }
  & td {
    cursor: default;
    background-color: transparent;
    border-bottom: none;
    text-align: center;
    padding-top: 1em;
    font-style: italic;
    color: silver;
  }
}
div.b-table-container {
  outline: none;
  border-left: 1px solid black;
  width: fit-content;
  overscroll-behavior: none;
}
div.b-table-heading {
  padding-left: .3rem;
  padding-bottom: .3rem;
  font-style: italic;
  font-size: 1.2em;
  color: var(--form-prompt-color) !important;
  /* background-color: var(--table-header-bg); */
  /* color: var(--table-header-text); */
}
.flex-row-container {
  display: flex;         /* Forces children onto the same line */
  flex-direction: row;   /* Sets horizontal alignment (default) */
  flex-wrap: nowrap;     /* Prevents items from breaking to a new line */
  gap: 1rem;             /* Adds clean spacing between your components */
  width: 100%;           /* Ensures the container spans full width */
}

.flex-item {
  flex: 1;               /* Forces all components to share width equally */
}
div.b-table-footer {
  width: 100%;
  /* font-size: .9em; */
  padding: .2em .3em;
  border: 1px solid black;
  border-top: 1px solid var(--separator-color);
  background-color: var(--table-footer-bg);
  color: var(--table-footer-text);

  & button {
    margin-right: 5em;
  }

}
table {
  border-collapse: collapse;
  position: relative;
}
thead tr {
  top: 0;
  position: sticky;
  z-index: 1;
}
thead tr th {
  /* border-top: 1px solid var(--table-header-bg); */
  /* border-bottom: 1px solid var(--table-header-bg); */
  text-align: left;
  font-weight: normal;
  background-color: var(--body-bg);
  color: var(--form-prompt-color) !important;
  padding: 0.1rem 0.2rem;
  padding-bottom: .6rem;
  text-decoration: double underline;
  text-underline-offset: 4px;
  vertical-align: bottom;
}
tr td {
  line-height: 1.1em;
  /* border-left: 1px solid black; */
  border-bottom: 1px solid var(--table-row-border-color);
  padding: 0.1rem 0.2rem;
  vertical-align: top;
  cursor: pointer;
}

tbody tr {
  background-color: var(--table-row-bg);
  color: var(--table-row-text);
  &.picked {
    background-color: var(--table-row-picked-bg);
    color: var(--table-row-picked-text) !important;
  }
}
table:not(.nohover) tr:hover {
    background-color: var(--table-row-picked-bg);
    color: var(--table-row-picked-text) !important;
}

xtbody tr:hover {
  background-color: var(--table-row-picked-bg);
  /* background-color: var(--table-row-hover-bg); */
}
xtbody tr.picked {
  background-color: var(--table-row-picked-bg);
  /* background-color: var(--table-row-picked-bg); */
  color: var(--table-row-picked-text);
}
</style>
