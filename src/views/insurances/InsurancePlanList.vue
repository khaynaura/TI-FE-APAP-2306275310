<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useInsurancePlanStore } from '@/stores/insurances/insurances.stores';
import VDataTable from '@/components/common/VDataTable.vue';
import VButton from '@/components/common/VButton.vue';
import { useRouter } from 'vue-router';
import { formatRupiah } from '@/utils/formatter.ts';

const insurancePlanStore = useInsurancePlanStore();
const router = useRouter();

const searchQuery = ref('');

// Load dari backend
onMounted(async () => {
  await insurancePlanStore.fetchPlans();
});

const tableHeaders = [
  'ID',
  'Provider ID',
  'Plan Name',
  'Price',
  'Coverage',
  'Applicable Services',
  'Duration',
  'Actions',
];

const handleSearchUpdate = (search: string) => {
  searchQuery.value = search;
  insurancePlanStore.fetchPlans(search); // trigger pencarian ke backend
};

const goToCreatePage = () => {
  router.push('/insurance-plan/create');
};

const goToDetailPage = (id: string) => {
  router.push(`/insurance-plan/${id}`);
};

const goToEditPage = (id: string) => {
  router.push(`/insurance-plan/${id}/update`);
};

async function handleDelete(id: string) {
  const ok = confirm('Yakin ingin menghapus plan ini?');
  if (!ok) return;
  await insurancePlanStore.deletePlan(id);
}
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-extrabold text-gray-900">Insurance Plans</h1>
      <VButton variant="primary" @click="goToCreatePage">
        + Add New Plan
      </VButton>
    </div>

    <p class="text-gray-600 mb-6">Manage and monitor insurance plans available for travelers.</p>

    <VDataTable
      :items="insurancePlanStore.plans"
      :headers="tableHeaders"
      table-title="Daftar Insurance Plan"
      :loading="insurancePlanStore.loading"
      :per-page-options="[10, 25, 50]"
      @update:search="handleSearchUpdate"
    >
      <template #body="{ items }">
        <tr v-for="plan in items" :key="plan.id" class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ plan.id }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ plan.providerId }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ plan.planName }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{{ formatRupiah(plan.price) }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">{{ formatRupiah(plan.coverage) }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <span v-if="plan.applicableService?.length">{{ plan.applicableService.join(', ') }}</span>
            <span v-else>-</span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ plan.expiredByDays }} days</td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div class="flex gap-2 justify-end">
              <VButton variant="link" @click="goToDetailPage(plan.id)">View</VButton>
              <VButton variant="link" class="text-yellow-600" @click="goToEditPage(plan.id)">Edit</VButton>
              <VButton variant="link" class="text-red-600" @click="handleDelete(plan.id)">Delete</VButton>
            </div>
          </td>
        </tr>
      </template>
    </VDataTable>
  </div>
</template>
