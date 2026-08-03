<script setup lang="ts">
interface IColumn {
  id: string;
  flags?: string;
  heading: string;
  width?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatter?: any;
}
const props = defineProps({
  config: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type: Object as () => any,
    required: true,
  },
  rows: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type: Array as () => any[],
    required: true,
  },
});

const deduceTDStyle = (col: IColumn) => {
  const style = {} as Record<string, string>;
  deduceJustification(style, col);
  return style;
};
const deduceTHStyle = (col: IColumn) => {
  const style = {} as Record<string, string>;
  deduceJustification(style, col);
  if (col.width) {
    style.width = col.width;
  }
  return style;
};

const deduceJustification = (style: Record<string, string>, col: IColumn) => {
  if (col.flags) {
    if (col.flags.includes("R")) {
      style.textAlign = "right";
    } else if (col.flags.includes("C")) {
      style.textAlign = "center";
    } else {
      style.textAlign = "left";
    }
  }
};
</script>

<template>
  <div
    :class="props.config.width ? 'b-table-container' : null"
    :style="{
      height: props.config.height,
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
        <tr v-for="row in props.rows" :key="row">
          <td
            v-for="col in props.config.columns"
            :key="col.id"
            :style="deduceTDStyle(col)"
            :innerHTML="col.formatter ? col.formatter(row, col, this) : row[col.id]"
          ></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="css">
div.b-table-container {
  /* border-top: 1px solid black; */
  /* border-bottom: 1px solid black; */
  background-color: var(--unused_bgcolor);
  width: fit-content;
  overscroll-behavior: none;
}
table {
  border-right: 1px solid var(--heading-color);
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
  border: 1px solid var(--heading-color);
  text-align: left;
  font-weight: normal;
  padding: 0.1rem 0.2rem;
  background-color: var(--heading-bgcolor);
  color: var(--heading-color);
  vertical-align: top;
}
tbody tr td {
  border-left: 1px solid black;
  border-bottom: 1px solid black;
  padding: 0.1rem 0.2rem;
  vertical-align: top;
}
</style>
