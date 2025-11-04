<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Toaster } from 'vue-sonner'
import VNavbar from '@/components/layout/VNavbar.vue'
</script>

<template>
  <Toaster position="top-center" richColors />
  <VNavbar />
  <main class="app-main">
    <RouterView />
  </main>
</template>

<style>
.app-main {
  max-width: 1200px;
  margin: 0 auto;
  /* padding: 2rem 1rem; */
}
</style>
