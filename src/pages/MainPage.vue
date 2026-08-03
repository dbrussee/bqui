<script setup lang="ts">
import AppHeader from './AppHeader.vue';
import HomePage from './HomePage.vue';
import SidebarPage from './SidebarPage.vue';

</script>
<template>
<div class="page-container">
  <header class="header"><AppHeader/></header>
  <aside class="sidebar">
    <SidebarPage />
  </aside>
  <main class="main-content">
    <HomePage />
  </main>
  <footer class="footer">Footer</footer>
</div>
</template>
