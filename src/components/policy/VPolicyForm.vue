<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import { ref, toRefs, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import VInput from '@/components/common/VInput.vue';
import VButton from '@/components/common/VButton.vue';
import { useInsurancePlanStore } from '@/stores/insurances/insurances.stores';
import type { PropType } from 'vue';
import type { CreatePolicyRequest } from '@/interfaces/policy.interface';
import type { ServiceEnum } from '@/stores/enums.stores';
import type { InsurancePlan } from '@/interfaces/insurances.interface';

const props = defineProps({
  action: {
    type: Function as PropType<(payload: CreatePolicyRequest) => Promise<void>>,
    required: true,
  },
  policyModel: {
    type: Object as PropType<CreatePolicyRequest>,
    required: true,
  },
});

const model = toRefs(props).policyModel;

const insurancePlanStore = useInsurancePlanStore();
const { plans } = storeToRefs(insurancePlanStore);
const loadingPlans = computed(() => insurancePlanStore.loading);

const error = ref<string | null>(null);
const isSubmitting = ref(false);
const services: { value: ServiceEnum; label: string }[] = [
  { value: 'ACCOMMODATION' as ServiceEnum, label: 'Accommodation' },
  { value: 'FLIGHT' as ServiceEnum, label: 'Flight' },
  { value: 'TOUR_PACKAGE' as ServiceEnum, label: 'Tour Package' },
  { value: 'RENTALS' as ServiceEnum, label: 'Rentals' },
];

const formatServiceName = (s?: string) =>
  (s ?? '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

// Available plans dari store
const availablePlans = computed<InsurancePlan[]>(() => plans.value || []);

// Fetch plans saat service berubah
watch(
  () => model.value.service,
  async newService => {
    if (!newService) {
      return;
    }
    await insurancePlanStore.fetchPlansByService(String(newService));
    // Filter selected plan ids agar tetap valid terhadap service baru
    const validIds = new Set(availablePlans.value.map(p => p.id));
    model.value.insurancePlanIds = model.value.insurancePlanIds.filter(id => validIds.has(id));
  },
  { immediate: false }
);

// Option per select index: cegah duplikasi, tapi ijinkan value yang sedang dipilih
const optionsFor = (index: number) => {
  const selected = model.value.insurancePlanIds;
  const current = selected[index];
  const taken = new Set(selected.filter((_, i) => i !== index));
  return availablePlans.value.filter(p => p.id === current || !taken.has(p.id));
};

// Aksi UI
const addPlanRow = () => {
  if (!model.value.service) return;
  if (availablePlans.value.length === 0) return;
  model.value.insurancePlanIds.push('');
};

const removePlanRow = (idx: number) => {
  model.value.insurancePlanIds.splice(idx, 1);
};

const onChangePlan = (idx: number, id: string) => {
  const dupIndex = model.value.insurancePlanIds.findIndex((v, i) => v === id && i !== idx);
  if (dupIndex !== -1) {
    model.value.insurancePlanIds[idx] = '';
  } else {
    model.value.insurancePlanIds[idx] = id;
  }
};

const validate = (): string | null => {
  if (!model.value.userId?.trim()) return 'User ID wajib diisi.';
  if (!model.value.bookingId?.trim()) return 'Booking ID wajib diisi.';
  if (!model.value.service) return 'Service wajib dipilih.';
  if (!model.value.insurancePlanIds || model.value.insurancePlanIds.length === 0)
    return 'Minimal pilih 1 Insurance Plan.';
  if (model.value.insurancePlanIds.some(id => !id || id.trim() === ''))
    return 'Semua pilihan Insurance Plan harus diisi.';
  const unique = new Set(model.value.insurancePlanIds);
  if (unique.size !== model.value.insurancePlanIds.length) return 'Insurance Plan tidak boleh duplikat.';
  return null;
};

const handleSubmit = async () => {
  error.value = validate();
  if (error.value) return;

  try {
    isSubmitting.value = true;
    await props.action(model.value);
  } catch (e) {
    error.value = 'Gagal membuat policy. Silakan coba lagi.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="flex flex-col gap-6 py-4">
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <p class="font-semibold">Error</p>
      <p class="text-sm">{{ error }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <VInput
        v-model="model.bookingId"
        id="bookingId"
        name="bookingId"
        label="Booking ID *"
        placeholder="Enter booking ID"
        :required="true"
      />
      <VInput
        v-model="model.userId"
        id="userId"
        name="userId"
        label="User ID *"
        placeholder="Enter user ID"
        :required="true"
      />
    </div>

    <div class="flex flex-col gap-1">
      <label for="service" class="block text-sm text-gray-700 title-bold">Service <span class="text-red-600">*</span></label>
      <select
        id="service"
        class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :disabled="isSubmitting"
        :value="model.service as unknown as string"
        @change="model.service = ($event.target as HTMLSelectElement).value as unknown as ServiceEnum"
      >
        <option value="" disabled selected>Select a service</option>
        <option v-for="s in services" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
      <p v-if="model.service && !loadingPlans" class="text-xs text-emerald-600 mt-1">
        {{ availablePlans.length }} insurance plan(s) available for {{ formatServiceName(model.service as unknown as string) }}
      </p>
      <p v-if="model.service && loadingPlans" class="text-xs text-slate-500 mt-1">Loading plans...</p>
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <label class="block text-sm text-gray-700 title-bold">Insurance Plans <span class="text-red-600">*</span></label>
        <VButton
          type="button"
          variant="primary"
          size="sm"
          @click="addPlanRow"
          :disabled="!model.service || loadingPlans || availablePlans.length === 0 || isSubmitting"
        >
          + Add Insurance Plan
        </VButton>
      </div>

      <div
        v-if="(!model.service && model.insurancePlanIds.length === 0) || (model.service && availablePlans.length === 0 && model.insurancePlanIds.length === 0)"
        class="text-sm text-gray-500 border border-dashed border-gray-300 rounded-md py-6 text-center"
      >
        <template v-if="!model.service">No Insurance Plans selected. Please select a service first to see available insurance plans.</template>
        <template v-else>No plans available for the selected service.</template>
      </div>

      <div v-for="(selectedId, idx) in model.insurancePlanIds" :key="idx" class="flex items-center gap-3">
        <div class="flex-1">
          <select
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :disabled="!model.service || loadingPlans || isSubmitting"
            :value="selectedId"
            @change="onChangePlan(idx, ($event.target as HTMLSelectElement).value)"
          >
            <option value="" disabled selected>Select an insurance plan</option>
            <option
              v-for="p in optionsFor(idx)"
              :key="p.id"
              :value="p.id"
            >
              {{ p.id }} - {{ p.planName }}
            </option>
          </select>
        </div>
        <VButton type="button" variant="danger" size="sm" @click="removePlanRow(idx)" :disabled="isSubmitting">Remove</VButton>
      </div>
    </div>

    <div class="flex justify-end gap-3 pt-4">
      <VButton type="button" variant="secondary" class="px-6 py-2" :disabled="isSubmitting" @click="$router.back()">
        Cancel
      </VButton>
      <VButton type="submit" variant="primary" class="px-6 py-2" :disabled="isSubmitting">
        {{ isSubmitting ? 'Creating...' : 'Create Policy' }}
      </VButton>
    </div>
  </form>
</template>

<style scoped>
.title-bold { font-weight: 600; }
</style>
