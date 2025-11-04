<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useStatisticsStore } from '@/stores/statistics/statistics.stores.ts'
import VStatCard from '@/components/common/VStatCard.vue'

// (Logika script sisanya tetap sama)
const statsStore = useStatisticsStore()
const { summary, loading } = storeToRefs(statsStore)
const { fetchHomeSummary } = statsStore

onMounted(() => {
  fetchHomeSummary()
})
</script>

<template>
  <div class="page-container">
    <!-- Bagian Welcome (tetap sama) -->
    <div class="welcome-header">
      <h1>Welcome to <span>Insurance</span></h1>
      <p>Your comprehensive travel insurance management platform</p>
    </div>

    <!-- Bagian Statistik (Sekarang JAUH LEBIH BERSIH) -->
    <div class="stats-section">
      <h2>Platform Statistics</h2>

      <!-- Tampilkan loading -->
      <div v-if="loading">
        Loading statistics...
      </div>

      <!-- 2. Gunakan komponen VStatCard -->
      <div class="stats-grid" v-else-if="summary">

        <!-- Card 1: Insurance Plans -->
        <VStatCard
          title="Insurance Plans"
          :value="summary.totalInsurancePlans"
          description="Active insurance plans available"
        >
          <!-- 3. Masukkan icon kustom lewat slot -->
          <template #icon>📄</template>
        </VStatCard>

        <!-- Card 2: Insurance Policies -->
        <VStatCard
          title="Insurance Policies"
          :value="summary.totalPolicies"
          description="Total policies issued to travelers"
        >
          <template #icon>🛡️</template>
        </VStatCard>

        <!-- Card 3: Claims Processed -->
        <VStatCard
          title="Claims Processed"
          :value="summary.totalClaimsProcessed"
          description="Claims handled and resolved"
        >
          <template #icon>📊</template>
        </VStatCard>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* Style untuk .stat-card dan lainnya sekarang ada di VStatCard.vue
  Di sini HANYA berisi style untuk layout halaman
*/
.page-container {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}
.welcome-header {
  text-align: center;
}
.welcome-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
}
.welcome-header h1 span {
  color: #0d6efd;
}
.welcome-header p {
  font-size: 1.1rem;
  color: #64748b;
  margin-top: 0.5rem;
}

.stats-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  text-align: center;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
</style>

