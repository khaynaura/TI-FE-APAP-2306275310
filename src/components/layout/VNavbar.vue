<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="navbar">
    <div class="nav-container">
      <RouterLink to="/" class="nav-brand">Insurance</RouterLink>

      <div class="nav-links">
        <RouterLink to="/insurance-plan" class="nav-link">Insurance Plan</RouterLink>
        <RouterLink to="/policy" class="nav-link">Policy</RouterLink>
        <RouterLink to="/claim" class="nav-link">Claim</RouterLink>
        <RouterLink to="/statistics" class="nav-link">Statistics</RouterLink>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 1.5rem;
}

.nav-container {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px; /* Tinggi navbar */
}
.nav-brand {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f97316; /* Warna oranye seperti di screenshot */
  text-decoration: none;
}
.nav-links {
  display: flex;
  gap: 1.5rem;
}
.nav-link {
  font-size: 0.95rem;
  color: #475569;
  text-decoration: none;
  font-weight: 500;
  padding: 5px 0;
  border-bottom: 2px solid transparent;
}
.nav-link:hover {
  color: #1e293b;
}
/* Style untuk link yang sedang aktif */
.nav-link.router-link-exact-active {
  color: #1e293b;
  border-bottom-color: #f97316;
}
</style>
