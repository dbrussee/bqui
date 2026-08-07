<script setup lang="ts">
import UserComponent from '@/components/UserComponent.vue';

</script>

<template>
  <div class="container">
    <div class="logo-area">
      BlueQuote
    </div>
    <div class="user-area">
      <UserComponent>Not logged in</UserComponent>
    </div>
    <div class="meta-area">
    </div>
  </div>
</template>

<style scoped>
  .container {
    display: grid;
    grid-template-columns: 200px 1fr 100px;
  }
  .meta-area {
    text-align: right;
    font-size: .7em;
  }
</style>
