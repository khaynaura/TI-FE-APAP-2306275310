<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import VButton from '@/components/common/VButton.vue'
import type { InsurancePlan } from '@/interfaces/insurances.interface'
import { useInsurancePlanStore } from '@/stores/insurances/insurances.stores.ts'

const route = useRoute()
const router = useRouter()
const insurancePlanStore = useInsurancePlanStore()
const { id: planId } = route.params as { id: string }

const plan = ref(undefined as undefined | InsurancePlan)

const getPlan = async () => {
  const getPlanResponse = await insurancePlanStore.getPlanById(planId as string)
  plan.value = getPlanResponse ?? undefined
}

const deletePlan = async () => {
  if (confirm('Apakah Anda yakin ingin menghapus Insurance Plan ini?')) {
    const success = await insurancePlanStore.deletePlan(planId as string)
    if (success) {
      router.replace('/insurance-plan')
    }
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount)
}

onMounted(async () => {
  await getPlan()
  if (!plan.value) {
    router.replace('/insurance-plan')
  }
})
</script>

<template>
  <div class="w-full min-h-screen bg-gray-50">
    <!-- Header Navigation -->
    <div class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-8">
            <h1 class="text-2xl font-bold text-orange-500">Insurance</h1>
            <nav class="flex space-x-8">
              <RouterLink to="/insurance-plan" class="text-orange-500 font-medium border-b-2 border-orange-500 pb-1">
                Insurance Plan
              </RouterLink>
              <RouterLink to="/policy" class="text-gray-500 hover:text-gray-700">
                Policy
              </RouterLink>
              <RouterLink to="/claim" class="text-gray-500 hover:text-gray-700">
                Claim
              </RouterLink>
              <RouterLink to="/statistics" class="text-gray-500 hover:text-gray-700">
                Statistics
              </RouterLink>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow-sm border">
        <!-- Header Section -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">Insurance Plan Details</h2>
              <p class="text-sm text-gray-500 mt-1">{{ plan?.planName }}</p>
            </div>
            <div class="flex gap-3">
              <RouterLink :to="`/insurance-plan/update/${planId}`">
                <VButton class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                  Update Plan
                </VButton>
              </RouterLink>
              <VButton @click="deletePlan" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
                Delete Plan
              </VButton>
            </div>
          </div>
        </div>

        <!-- Content Form-like Layout -->
        <div class="p-6">
          <div class="flex flex-col gap-6">
            <!-- Basic Information Section -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <!-- Custom Read-only Input Style -->
                <div class="flex flex-col">
                  <label class="block text-sm font-medium text-gray-700 mb-1">ID</label>
                  <div class="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm">
                    {{ plan?.id || '-' }}
                  </div>
                </div>

                <div class="flex flex-col">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                  <div class="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm">
                    {{ plan?.planName || '-' }}
                  </div>
                </div>

                <div class="flex flex-col">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Provider ID</label>
                  <div class="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm">
                    {{ plan?.providerId || '-' }}
                  </div>
                </div>

                <div class="flex flex-col">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Plan Duration</label>
                  <div class="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm">
                    {{ plan?.expiredByDays ? `${plan.expiredByDays} days` : '-' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Financial Information Section -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Financial Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Price (IDR)</label>
                  <div class="px-3 py-2 border border-gray-300 rounded-md bg-green-50 text-green-800 text-sm font-medium">
                    {{ plan ? formatCurrency(plan.price) : '-' }}
                  </div>
                </div>

                <div class="flex flex-col">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Coverage Amount (IDR)</label>
                  <div class="px-3 py-2 border border-gray-300 rounded-md bg-blue-50 text-blue-800 text-sm font-medium">
                    {{ plan ? formatCurrency(plan.coverage) : '-' }}
                  </div>
                </div>

                <div class="flex flex-col">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                  <div class="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm">
                    {{ plan ? format(new Date(plan.createdAt), 'dd MMMM yyyy \'pukul\' HH:mm') : '-' }}
                  </div>
                </div>

                <div class="flex flex-col">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                  <div class="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm">
                    {{ plan ? format(new Date(plan.updatedAt), 'dd MMMM yyyy \'pukul\' HH:mm') : '-' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Coverage Details Section -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Coverage Details</h3>
              <div class="flex flex-col">
                <label class="block text-sm font-medium text-gray-700 mb-1">Coverage Details</label>
                <div class="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm min-h-[100px] whitespace-pre-wrap">
                  {{ plan?.coverageDetails || 'No coverage details available' }}
                </div>
              </div>
            </div>

            <!-- Applicable Services Section -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Applicable Services</h3>
              <div class="grid grid-cols-4 gap-4">
                <div class="flex items-center gap-2 pointer-events-none">
                  <input
                    type="checkbox"
                    :checked="plan?.applicableService?.includes('ACCOMMODATION')"
                    disabled
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-75"
                  />
                  <span class="text-sm text-gray-600">Accommodation</span>
                </div>
                <div class="flex items-center gap-2 pointer-events-none">
                  <input
                    type="checkbox"
                    :checked="plan?.applicableService?.includes('FLIGHT')"
                    disabled
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-75"
                  />
                  <span class="text-sm text-gray-600">Flight</span>
                </div>
                <div class="flex items-center gap-2 pointer-events-none">
                  <input
                    type="checkbox"
                    :checked="plan?.applicableService?.includes('TOUR_PACKAGE')"
                    disabled
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-75"
                  />
                  <span class="text-sm text-gray-600">Tour Package</span>
                </div>
                <div class="flex items-center gap-2 pointer-events-none">
                  <input
                    type="checkbox"
                    :checked="plan?.applicableService?.includes('RENTALS')"
                    disabled
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-75"
                  />
                  <span class="text-sm text-gray-600">Rentals</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <VButton
                @click="router.back()"
                variant="secondary"
                class="px-6 py-2"
              >
                Kembali
              </VButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
