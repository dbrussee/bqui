<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, ref } from 'vue'
interface IColumn {
  id: string
  flags?: string
  heading: string
  width?: string
  cellclass?: string
}
const emit = defineEmits(["pick", "dblpick", "hdrclick"])
const props = defineProps({
  config: {
    type: Object as () => any,
    required: true,
  },
  heading: {
    type: String,
    required: false,
    default: ""
  },
  nofooter: {
    type: Boolean,
    required: false,
    defaul: false
  },
  rows: {
    type: Array as () => any[],
    required: false,
    default: () => [],
  },
})

const tdRef = ref(null)

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

const getCellValueInSlot = computed(() => {
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

const handleTableClick = (event:MouseEvent) => {
  const el = event.target as HTMLElement // could be anything
  let celltype = ''
  let cell = el.closest('td') as HTMLTableCellElement | null
  if (cell) {
    celltype = 'td'
  } else {
    cell = el.closest('th') as HTMLTableCellElement
    if (cell) {
      celltype = 'th'
    }
  }
  if (celltype == '') return
  const col = props.config.columns[cell.cellIndex]
  if (celltype == 'th') {
    emit("hdrclick", col)
  } else {
    const tr = cell.closest('tr') as HTMLTableRowElement
    const row = props.rows[tr.rowIndex - 1] // Skip thead row
    if (row == props.config.pickedRow) {
      emit('pick', null)
    } else {
      emit('pick', row, col, cell.cellIndex as number)
    }
  }
}
const handleTableDblClick = (event:MouseEvent) => {
  const el = event.target as HTMLElement // could be anything
  const cell = el.closest('td') as HTMLTableCellElement | null
  if (!cell) return
  const col = props.config.columns[cell.cellIndex]
  const tr = cell.closest('tr') as HTMLTableRowElement
  const row = props.rows[tr.rowIndex - 1] // Skip thead row
  emit('pick', row, col, cell.cellIndex as number)
  emit('dblpick', row, col, cell.cellIndex as number)
}

// const handleClick = (row:any, col:any, cn:any) => {
//   if (row == props.config.pickedRow) {
//     emit('pick', null)
//   } else {
//     emit('pick', row, col, cn as number)
//   }
// }
// const handleDblClick = (row:any, col:any, cn:any) => {
//   emit('pick', row, col, cn as number)
//   emit('dblpick', row, col, cn as number)
// }

const getCellRef = (rn:any, cn:any) => {
  const rownum = rn as number
  const colnum = cn as number
  const offset:number = (rownum * props.config.columns.length) + colnum
  return tdRef.value?.[offset] || null
}
</script>

<template>
  <div style="width: fit-content">
  <div v-if="props.heading != ''" class="b-table-heading">
    {{ props.heading }}
  </div>
  <div class="b-table-container"
    :style="{
      height: 'calc(' + props.config.height + (props.nofooter ? ')' : ' - 1.3em)'),
      'overflow-y': props.config.height == '' ? 'visible' : 'scroll',
    }"
  >
    <table :style="{ width: props.config.width }"
        @click.stop="handleTableClick($event)"
        @dblclick.stop="handleTableDblClick($event)"
        >
        <thead>
          <tr>
            <th v-for="col in props.config.columns" :key="col.id" :style="deduceTHStyle(col)">
              {{ col.heading }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row,rn) in props.rows" :key="row" :class="{picked : props.config.pickedRow == row}">
            <td v-for="(col,cn) in props.config.columns" :class="col.cellclass" :key="col.id" :style="deduceTDStyle(col)"
            ref="tdRef"
            >
            <slot v-if="row" :name="'column_' + col.id" :row="row" :rn="rn" :td="getCellRef(rn, cn)" :col="col" :cn="cn">
              {{ getCellValueInSlot(row, col) }}
            </slot>
          </td>
        </tr>
        <tr v-if="(!props.rows || props.rows.length == 0) && props.config.no_rows_text && props.config.no_rows_text != ''" class="no_rows_text">
          <td :colspan="props.config.columns.length">
            {{ props.config.no_rows_text }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-if="!props.nofooter" class="b-table-footer"><slot name="buttons"/>&nbsp;</div>
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
  /* background-color: var(--unused_bgcolor); */
  border-left: 1px solid black;
  width: fit-content;
  overscroll-behavior: none;
}
div.b-table-heading {
  padding-bottom: 0.2rem;
  font-style: italic;
  color: var(--heading-color);
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
  /* height: 1.5em; */
  font-size: .9em;
  padding: .2em .3em;
  border: 1px solid black;
  border-top: 1px solid silver;
  background-color: gainsboro;
  color: silver;

  & button {
    margin-right: 5em;
  }

}
table {
  /* border-right: 1px solid var(--heading-color); */
  border-collapse: collapse;
  position: relative;
  background-color: white;
}
thead tr {
  top: 0;
  position: sticky;
  z-index: 1;
}
thead tr th {
  border-top: 1px solid var(--heading-color);
  border-bottom: 1px solid var(--heading-color);
  text-align: left;
  font-weight: normal;
  padding: 0.1rem 0.2rem;
  background-color: var(--heading-bgcolor);
  color: var(--heading-color);
  vertical-align: top;
}
tbody tr td {
  line-height: 1.1em;
  /* border-left: 1px solid black; */
  border-bottom: 1px solid silver;
  padding: 0.1rem 0.2rem;
  vertical-align: top;
  cursor: pointer;
}
tbody tr:hover {
  background-color: lightcyan;
}
tbody tr.picked {
  background-color: springgreen;
}
/* tbody tr.picked:hover {
  background-color: paleturquoise;
} */
</style>
