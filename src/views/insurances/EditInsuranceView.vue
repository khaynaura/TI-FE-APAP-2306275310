<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import VInsuranceForm from '@/components/insurance/VInsuranceForm.vue'
import type { InsurancePlanRequest } from '@/interfaces/insurances.interface'
import { useInsurancePlanStore } from '@/stores/insurances/insurances.stores.ts'

const router = useRouter()
const route = useRoute()
const insurancePlanStore = useInsurancePlanStore()

const insuranceModel = reactive<InsurancePlanRequest>({
  id: '',
  planName: '',
  providerId: '',
  price: 0,
  coverage: 0,
  coverageDetails: '',
  applicableService: [],
  expiredByDays: 1,
})

const loadInsuranceData = async () => {
  const planId = route.params.id as string
  if (planId) {
    const plan = await insurancePlanStore.getPlanById(planId)
    if (plan) {
      Object.assign(insuranceModel, {
        id: plan.id,
        planName: plan.planName,
        providerId: plan.providerId,
        price: plan.price,
        coverage: plan.coverage,
        coverageDetails: plan.coverageDetails,
        applicableService: plan.applicableService,
        expiredByDays: plan.expiredByDays,
      })
    } else {
      router.push('/insurance-plan')
    }
  }
}

const updateInsurance = async (bodyRequest: InsurancePlanRequest) => {
  try {
    const updateInsuranceResponse = await insurancePlanStore.updatePlan(bodyRequest)
    if (updateInsuranceResponse) {
      router.push('/insurance-plan')
    }
  } catch (error) {

    throw error
  }
}

onMounted(() => {
  loadInsuranceData()
})
</script>

<template>
  <main class="w-full min-h-screen">

    <div class="px-8 py-8">
      <h1 class="text-3xl font-extrabold text-gray-800 mb-2 title-bold">Update Insurance Plan</h1>
      <p class="text-gray-600 mb-8">Update existing Insurance Plan in the system</p>
      <hr class="border-gray-200 custom-margin" />
      <VInsuranceForm :insuranceModel="insuranceModel" :action="updateInsurance" />
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
