<script setup lang="ts">
import VInput from '../common/VInput.vue'
import VTextArea from '../common/VTextArea.vue'
import VButton from '../common/VButton.vue'
import { type PropType, toRefs, watch, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { InsurancePlanRequest } from '@/interfaces/insurances.interface'
import type { ServiceEnum } from '@/stores/enums.stores'

const router = useRouter()

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
const servicesTouched = ref(false)
const servicesError = computed(() =>
  servicesTouched.value && model.value.applicableService.length === 0
    ? 'Minimal pilih 1 layanan.'
    : null
)

const isEditMode = computed(() => model.value.id && model.value.id.trim() !== '')

const emit = defineEmits(['update:modelValue'])

watch(
  () => model,
  (newValue) => {
    emit('update:modelValue', newValue)
  },
  { deep: true },
)

const handleSubmit = async () => {
  servicesTouched.value = true
  if (model.value.applicableService.length === 0) return

  try {
    error.value = null
    isLoading.value = true
    await props.action(model.value)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('Error processing insurance plan:', err)
    if (err.response?.data?.message) error.value = err.response.data.message
    else if (err.response?.status === 400) error.value = 'Invalid data provided. Please check all required fields.'
    else if (err.response?.status === 500) error.value = 'Server error. Please try again later.'
    else error.value = 'An unexpected error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const handleServiceChange = (service: ServiceEnum, checked: boolean) => {
  servicesTouched.value = true
  if (checked) {
    if (!model.value.applicableService.includes(service)) {
      model.value.applicableService.push(service)
    }
  } else {
    const index = model.value.applicableService.indexOf(service)
    if (index > -1) model.value.applicableService.splice(index, 1)
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="flex flex-col gap-6 py-4">
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <p class="font-medium">Error:</p>
      <p>{{ error }}</p>
    </div>


<div v-if="isEditMode" class="grid grid-cols-2 gap-4">
  <div>
    <VInput
      :modelValue="model.id || ''"
      @update:modelValue="(v) => (model.id = v)"
      id="insurancePlanId"
      name="insurancePlanId"
      label="Insurance Plan ID *"
      :disabled="true"
    />
    <p class="text-xs text-gray-500 mt-1">Insurance Plan ID cannot be changed</p>
  </div>

  <div>
    <VInput
      v-model="model.providerId"
      id="providerIdDisabled"
      name="providerIdDisabled"
      label="Provider ID *"
      :disabled="true"
    />
    <p class="text-xs text-gray-500 mt-1">Provider ID cannot be changed</p>
  </div>
</div>

    <!-- Regular form fields -->
    <div class="grid grid-cols-2 gap-4">
      <VInput
        v-if="!isEditMode"
        v-model="model.providerId"
        id="providerId"
        name="providerId"
        label="Provider ID *"
        placeholder="Enter provider ID"
        :required="true"
      />
      <VInput
        v-model="model.planName"
        id="planName"
        name="planName"
        label="Plan Name *"
        placeholder="Enter plan name"
        :required="true"
        :class="isEditMode ? 'col-span-2' : ''"
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
        :required="true"
        :validate="v => (v === '' || Number(v) >= 0 ? null : 'Harus >= 0')"
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
        :required="true"
        :validate="v => (v === '' || Number(v) >= 0 ? null : 'Harus >= 0')"
      />
    </div>

    <VTextArea
      v-model="model.coverageDetails"
      id="coverageDetails"
      name="coverageDetails"
      label="Coverage Details *"
      placeholder="Describe what this insurance plan covers..."
      :required="true"
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
        :required="true"
        :validate="v => (Number(v) >= 1 ? null : 'Minimal 1 hari')"
      />
    </div>

    <div class="flex flex-col gap-2">
      <label class="block text-sm text-gray-700 mb-1 title-bold">
        Applicable Services <span class="text-red-600">*</span>
      </label>
      <div :class="['grid grid-cols-4 gap-4', servicesError ? 'border border-red-400 rounded-md p-3' : '']">
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            :checked="model.applicableService.includes('ACCOMMODATION' as ServiceEnum)"
            @change="(e) => handleServiceChange('ACCOMMODATION' as ServiceEnum, (e.target as HTMLInputElement).checked)"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="text-sm">Accommodation</span>
        </label>
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            :checked="model.applicableService.includes('FLIGHT' as ServiceEnum)"
            @change="(e) => handleServiceChange('FLIGHT' as ServiceEnum, (e.target as HTMLInputElement).checked)"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="text-sm">Flight</span>
        </label>
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            :checked="model.applicableService.includes('TOUR_PACKAGE' as ServiceEnum)"
            @change="(e) => handleServiceChange('TOUR_PACKAGE' as ServiceEnum, (e.target as HTMLInputElement).checked)"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="text-sm">Tour Package</span>
        </label>
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            :checked="model.applicableService.includes('RENTALS' as ServiceEnum)"
            @change="(e) => handleServiceChange('RENTALS' as ServiceEnum, (e.target as HTMLInputElement).checked)"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="text-sm">Rentals</span>
        </label>
      </div>
      <p v-if="servicesError" class="text-xs text-red-600 mt-0.5">{{ servicesError }}</p>
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
        {{ isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Insurance Plan' : 'Create Insurance Plan') }}
      </VButton>
    </div>
  </form>
</template>

<style scoped>
.title-bold { font-weight: 550; }
</style>
