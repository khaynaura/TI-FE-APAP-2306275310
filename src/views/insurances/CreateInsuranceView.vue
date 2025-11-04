<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import VInsuranceForm from '@/components/insurance/VInsuranceForm.vue'
import type { InsurancePlanRequest } from '@/interfaces/insurances.interface'
import { useInsurancePlanStore } from '@/stores/insurances/insurances.stores.ts'

const router = useRouter()
const insurancePlanStore = useInsurancePlanStore()

const insuranceModel = reactive<InsurancePlanRequest>({
  planName: '',
  providerId: '',
  price: 0,
  coverage: 0,
  coverageDetails: '',
  applicableService: [],
  expiredByDays: 1,
})

const createInsurance = async (bodyRequest: InsurancePlanRequest) => {
  try {
    const createInsuranceResponse = await insurancePlanStore.createPlan(bodyRequest)
    if (createInsuranceResponse) {
      router.push('/insurance-plan')
    }
  } catch (error) {
    // Re-throw error so VInsuranceForm can handle it
    throw error
  }
}
</script>

<template>
  <main class="w-full min-h-screen">
    <!-- Form content langsung tanpa container -->
    <div class="px-8 py-8">
      <h1 class="text-3xl font-extrabold text-gray-800 mb-2 title-bold">Create Insurance Plan</h1>
      <p class="text-gray-600 mb-8">Add a new insurance plan to the system</p>
      <hr class="border-gray-200 custom-margin" />
      <VInsuranceForm :insuranceModel="insuranceModel" :action="createInsurance" />
    </div>

  </main>
</template>

<style scoped>
.title-bold {
  font-weight: 800;
}

.custom-margin {
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>
