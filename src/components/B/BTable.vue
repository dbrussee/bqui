<script setup lang="ts">
import { computed } from 'vue'
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type: Object as () => any,
    required: true,
  },
  nofooter: {
    type: Boolean,
    required: false,
    defaul: false
  },
  rows: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const getCellValueInSlot = computed(() => {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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



// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleClick = (row:any, col:any, cn:any) => {
  if (row == props.config.pickedRow) {
    emit('pick', null)
  } else {
    emit('pick', row, col, cn as number)
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleDblClick = (row:any, col:any, cn:any) => {
  emit('pick', row, col, cn as number)
  emit('dblpick', row, col, cn as number)
}
</script>

<template>
  <div style="width: fit-content">
  <div v-if="props.config.heading && props.config.heading != ''" class="b-table-heading">
    {{ props.config.heading }}
  </div>
  <div class="b-table-container"
    :style="{
      height: 'calc(' + props.config.height + (props.nofooter ? ')' : ' - 1.3em)'),
      'overflow-y': props.config.height == '' ? 'visible' : 'scroll',
    }"
  >
    <table :style="{ width: props.config.width }">
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
              @click.stop="handleClick(row, col, cn)"
              @dblclick.stop="handleDblClick(row, col, cn)"
            >
            <slot :name="'column_' + col.id" :row="row" :rn="rn">
              {{ getCellValueInSlot(row, col) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-if="!props.nofooter" class="b-table-footer"><slot name="buttons"/>&nbsp;</div>
  </div>
</template>

<style scoped lang="css">
div.b-table-container {
  background-color: var(--unused_bgcolor);
  border-left: 1px solid black;
  width: fit-content;
  overscroll-behavior: none;
}
div.b-table-heading {
  padding: 0.2rem 0.5rem;
  font-style: italic;
  color: var(--heading-color);
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
