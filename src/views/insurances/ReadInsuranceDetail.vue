<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// ...existing code...
// import { format } from 'date-fns'
import VButton from '@/components/common/VButton.vue'
import VFieldDisplay from '@/components/common/VFieldDisplay.vue'
import type { InsurancePlan } from '@/interfaces/insurances.interface'
import { useInsurancePlanStore } from '@/stores/insurances/insurances.stores.ts'

const route = useRoute()
const router = useRouter()
const insurancePlanStore = useInsurancePlanStore()
const { id: planId } = route.params as { id: string }

const plan = ref(undefined as undefined | InsurancePlan)

const showDeleteModal = ref(false)
const isDeleting = ref(false)

const getPlan = async () => {
  const getPlanResponse = await insurancePlanStore.getPlanById(planId as string)
  plan.value = getPlanResponse ?? undefined
}

const deletePlan = async () => {
  isDeleting.value = true
  const success = await insurancePlanStore.deletePlan(planId as string)
  isDeleting.value = false
  if (success) {
    showDeleteModal.value = false
    router.replace('/insurance-plan')
  }
}


// label untuk services (agar tampil sebagai chip)
const serviceLabels: Record<string, string> = {
  ACCOMMODATION: 'Accommodation',
  FLIGHT: 'Flight',
  TOUR_PACKAGE: 'Tour Package',
  RENTALS: 'Rentals'
}

const selectedServices = computed(() => {
  return (plan.value?.applicableService ?? []).map((s) => serviceLabels[s] ?? s)
})

onMounted(async () => {
  await getPlan()
  if (!plan.value) {
    router.replace('/insurance-plan')
  }
})
</script>

<template>
  <main class="w-full min-h-screen">
    <div class="px-8 py-8">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4">
                <div>
                  <h1 class="text-3xl font-extrabold text-gray-900 title-bold">Insurance Plan Details</h1>
                  <p class="text-gray-600 mt-1">{{ plan?.planName }}</p>
                </div>

                <div class="flex gap-3 shrink-0">
                  <VButton variant="primary" size="lg" @click="router.push(`/insurance-plan/update/${planId}`)">
                    Update Plan
                  </VButton>
                  <VButton variant="danger" size="lg" @click="showDeleteModal = true">Delete Plan</VButton>
                </div>
              </div>

      <hr class="border-gray-200 custom-margin" />
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-12">
        <section>
          <h3 class="text-l font-black text-gray-900 section-bold">Basic Information</h3>
          <hr class="border-gray-200 custom-margin2" />
          <div class="grid grid-cols-1 gap-4">
            <VFieldDisplay label="ID" :value="plan?.id" />
            <VFieldDisplay label="Plan Name" :value="plan?.planName" />
            <VFieldDisplay label="Provider ID" :value="plan?.providerId" />
            <VFieldDisplay
              label="Plan Duration"
              :value="plan?.expiredByDays ? `${plan?.expiredByDays} days` : null"
            />
          </div>
        </section>

        <section>
          <h3 class="text-l font-black text-gray-900 section-bold ">Financial Information</h3>
          <hr class="border-gray-200 custom-margin2" />
          <div class="grid grid-cols-1 gap-4">
            <VFieldDisplay
              label="Price (IDR)"
              :value="plan?.price"
              format="currency"
              variant="success"
              currency="IDR"
            />
            <VFieldDisplay
              label="Coverage Amount (IDR)"
              :value="plan?.coverage"
              format="currency"
              variant="info"
              currency="IDR"
            />
            <VFieldDisplay
              label="Created Date"
              :value="plan ? plan.createdAt : null"
              format="date"
            />
            <VFieldDisplay
              label="Last Updated"
              :value="plan ? plan.updatedAt : null"
              format="date"
            />
          </div>
        </section>
      </div>

      <hr class="border-gray-200 custom-margin2" />

      <div class="flex flex-col gap-2.5 mt-12">
        <section>
          <h3 class="text-l font-black text-gray-900 section-bold">Coverage Details</h3>
          <hr class="border-gray-200 custom-margin2" />
          <VFieldDisplay
            label="Coverage Details"
            :value="plan?.coverageDetails || null"
            placeholder="No coverage details available"
            multiline
          />
        </section>

        <hr class="border-gray-200 custom-margin2" />
        <!-- Applicable Services -->
        <section>
          <h3 class="text-l font-black text-gray-900 section-bold">Applicable Services</h3>
          <hr class="border-gray-200 custom-margin2" />
          <div class="flex flex-wrap gap-3">
            <span
              v-for="s in selectedServices"
              :key="s"
              class="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 text-blue-800 text-base font-semibold ring-1 ring-blue-300"
            >
              {{ s }}
            </span>
            <span v-if="!selectedServices.length" class="text-sm text-gray-500">No services</span>
          </div>
        </section>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-8">
        <VButton @click="router.push('/insurance-plan')" variant="secondary" size="lg">
          Kembali
        </VButton>
      </div>
    </div>

    <teleport to="body">
  <div v-if="showDeleteModal" class="fixed inset-0 z-[1000] flex items-center justify-center">
    <!-- Backdrop abu-abu tanpa blur -->
    <div
      class="absolute inset-0 bg-black/50"
      @click="!isDeleting && (showDeleteModal = false)"
    ></div>

    <div class="relative z-10 w-[400px] rounded-xl bg-white p-8 shadow-xl">
      <!-- Icon container - centered -->
      <div class="flex justify-center mb-5">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </div>
      </div>

      <!-- Title -->
      <h2 class="text-center text-lg text-gray-900 section-bold">Delete Insurance Plan</h2>
      <hr class="border-gray-100 custom-margin2" />
      <!-- Description -->
      <p class="text-center text-sm text-gray-600 mb-8">
        Are you sure you want to delete
        <span class="title-bold">"{{ plan?.planName }}"</span>? This action cannot be undone.
      </p>

      <hr class="border-gray-100 custom-margin2" />
      <!-- Buttons -->
      <div class="flex justify-center gap-3">
        <VButton variant="secondary" size="md" :disabled="isDeleting" @click="showDeleteModal = false">
          Cancel
        </VButton>
        <VButton variant="danger" size="md" :loading="isDeleting" :disabled="isDeleting" @click="deletePlan">
          Delete
        </VButton>
      </div>
    </div>
  </div>
</teleport>


  </main>
</template>

<style scoped>
.title-bold {
  font-weight: 800;
}

.section-bold {
  font-weight: 700;
}

.field-bold {
  font-weight: 450;
}

.title-bold {
  font-weight: 550;
}

.custom-margin {
  margin-top: 20px;
  margin-bottom: 20px;
}

.custom-margin2 {
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
