<script setup lang="ts">
import VInput from '../common/VInput.vue'
import VTextArea from '../common/VTextArea.vue'
import VButton from '../common/VButton.vue'
import { type PropType, toRefs, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { InsurancePlanRequest } from '@/interfaces/insurances.interface'
import type { ServiceEnum } from '@/stores/enums.stores'

const router = useRouter()

// Add error handling and loading state
const error = ref<string | null>(null)
const isLoading = ref(false)

const props = defineProps({
  action: {
    type: Function as PropType<(data: InsurancePlanRequest) => Promise<void>>,
    required: true,
  },
  insuranceModel: {
    type: Object as PropType<InsurancePlanRequest>,
    required: true,
  },
})

const model = toRefs(props).insuranceModel

const emit = defineEmits(['update:modelValue'])

watch(
  () => model,
  (newValue) => {
    emit('update:modelValue', newValue)
  },
  { deep: true },
)

// Updated handleSubmit with error handling
const handleSubmit = async () => {
  try {
    error.value = null
    isLoading.value = true
    await props.action(model.value)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('Error creating insurance plan:', err)

    if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else if (err.response?.status === 400) {
      error.value = 'Invalid data provided. Please check all required fields.'
    } else if (err.response?.status === 500) {
      error.value = 'Server error. Please try again later.'
    } else {
      error.value = 'An unexpected error occurred. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

const handleServiceChange = (service: ServiceEnum, checked: boolean) => {
  if (checked) {
    if (!model.value.applicableService.includes(service)) {
      model.value.applicableService.push(service)
    }
  } else {
    const index = model.value.applicableService.indexOf(service)
    if (index > -1) {
      model.value.applicableService.splice(index, 1)
    }
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="flex flex-col gap-6 py-4">
    <!-- Error message display -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <p class="font-medium">Error:</p>
      <p>{{ error }}</p>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <VInput
        v-model="model.providerId"
        id="providerId"
        name="providerId"
        label="Provider ID *"
        placeholder="Enter provider ID"
      />
      <VInput
        v-model="model.planName"
        id="planName"
        name="planName"
        label="Plan Name *"
        placeholder="Enter plan name"
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <VInput
        :modelValue="String(model.price ?? '')"
        @update:modelValue="(v) => (model.price = v === '' ? 0 : Number(v))"
        id="price"
        name="price"
        type="number"
        min="0"
        label="Price (IDR) *"
        placeholder="0"
      />
      <VInput
        :modelValue="String(model.coverage ?? '')"
        @update:modelValue="(v) => (model.coverage = v === '' ? 0 : Number(v))"
        id="coverage"
        name="coverage"
        type="number"
        min="0"
        label="Coverage (IDR) *"
        placeholder="0"
      />
    </div>

    <VTextArea
      v-model="model.coverageDetails"
      id="coverageDetails"
      name="coverageDetails"
      label="Coverage Details *"
      placeholder="Describe what this insurance plan covers..."
    />

    <div class="grid grid-cols-2 gap-4">
      <VInput
        :modelValue="String(model.expiredByDays ?? '')"
        @update:modelValue="(v) => (model.expiredByDays = v === '' ? 0 : Number(v))"
        id="expiredByDays"
        name="expiredByDays"
        type="number"
        min="1"
        label="Expired By Days *"
        placeholder="1"
      />
    </div>

    <div class="flex flex-col gap-2">
      <label class="font-medium">Applicable Services *</label>
      <div class="grid grid-cols-4 gap-4">
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            :checked="model.applicableService.includes('ACCOMMODATION' as ServiceEnum)"
            @change="
              (e) =>
                handleServiceChange(
                  'ACCOMMODATION' as ServiceEnum,
                  (e.target as HTMLInputElement).checked,
                )
            "
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="text-sm">Accommodation</span>
        </label>
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            :checked="model.applicableService.includes('FLIGHT' as ServiceEnum)"
            @change="
              (e) =>
                handleServiceChange('FLIGHT' as ServiceEnum, (e.target as HTMLInputElement).checked)
            "
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="text-sm">Flight</span>
        </label>
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            :checked="model.applicableService.includes('TOUR_PACKAGE' as ServiceEnum)"
            @change="
              (e) =>
                handleServiceChange(
                  'TOUR_PACKAGE' as ServiceEnum,
                  (e.target as HTMLInputElement).checked,
                )
            "
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="text-sm">Tour Package</span>
        </label>
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            :checked="model.applicableService.includes('RENTALS' as ServiceEnum)"
            @change="
              (e) =>
                handleServiceChange(
                  'RENTALS' as ServiceEnum,
                  (e.target as HTMLInputElement).checked,
                )
            "
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="text-sm">Rentals</span>
        </label>
      </div>
    </div>

    <div class="flex justify-end gap-3 pt-4">
      <VButton
        @click="router.back()"
        type="button"
        variant="secondary"
        class="px-6 py-2"
        :disabled="isLoading"
      >
        Cancel
      </VButton>
      <VButton
        type="submit"
        variant="primary"
        class="px-6 py-2"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Creating...' : 'Create Insurance Plan' }}
      </VButton>
    </div>
  </form>
</template>

<style scoped></style>
