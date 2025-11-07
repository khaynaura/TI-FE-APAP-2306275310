<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useStatisticsStore } from '@/stores/statistics/statistics.stores.ts'
import VStatCard from '@/components/common/VStatCard.vue'

const statsStore = useStatisticsStore()
const { summary, loading } = storeToRefs(statsStore)
const { fetchHomeSummary } = statsStore

onMounted(() => {
  fetchHomeSummary()
})
</script>

<template>
  <div class="page-container">
    <div class="welcome-header">
      <h1>Welcome to <span>Insurance</span></h1>
      <p>Your comprehensive travel insurance management platform</p>
    </div>

    <div class="stats-section">
      <h2>Platform Statistics</h2>

      <div v-if="loading">
        Loading statistics...
      </div>

      <div class="stats-grid" v-else-if="summary">

        <VStatCard
          title="Insurance Plans"
          :value="summary.totalInsurancePlans"
          description="Active insurance plans available"
        >
          <template #icon>📄</template>
        </VStatCard>

        <VStatCard
          title="Insurance Policies"
          :value="summary.totalPolicies"
          description="Total policies issued to travelers"
        >
          <template #icon>🛡️</template>
        </VStatCard>

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

