<script setup lang="ts">
// Komponen ini menerima props (data) dari parent-nya
defineProps<{
  title: string
  value: number | string
  description: string
}>()
</script>
<template>
  <div class="stat-card">
    <!-- Bagian Icon di ATAS -->
    <div class="stat-icon-wrapper">
      <slot name="icon">📄</slot>
    </div>

    <!-- Bagian Teks di BAWAH -->
    <div class="stat-content">
      <p class="stat-title">{{ title }}</p>
      <span class="stat-value">{{ value }}</span>
      <p class="stat-desc">{{ description }}</p>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column; /* Ubah ke column supaya vertikal */
  align-items: flex-start;
  gap: 1rem; /* Jarak antara icon dan konten */
}

.stat-icon-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background-color: #f0f4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #4368ff;
}

.stat-content {
  width: 100%;
}

.stat-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: #475569;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  display: block;
  margin-top: 0.5rem;
}

.stat-desc {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0.75rem 0 0 0;
}
</style>
