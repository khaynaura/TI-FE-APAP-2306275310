<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, h } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { toast } from 'vue-sonner';
import type { ColumnDef } from '@tanstack/vue-table';
import { useInsurancePlanStore } from '@/stores/insurances/insurances.stores';
import VDataTable from '@/components/common/VDataTable.vue';
import VButton from '@/components/common/VButton.vue';

// --- Inisialisasi Store dan Router ---
const router = useRouter();
const planStore = useInsurancePlanStore();
const { plans } = storeToRefs(planStore);

// --- State Halaman ---
const searchQuery = ref('');
const isLoading = ref(false);

// --- Helpers untuk Formatting ---
const formatCurrency = (value: unknown) => {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(n)) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n);
};

const formatDuration = (days?: number) => {
  if (!Number.isFinite(days as number)) return '-';
  const d = Number(days);
  return `${d} ${d === 1 ? 'day' : 'days'}`;
};

const formatServiceName = (service: string) => {
  return service
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// --- Navigasi ---
const goToAddPlan = () => router.push('/insurance-plan/create');
const goToViewPlan = (id: string) => router.push(`/insurance-plan/${id}`);
const goToEditPlan = (id: string) => router.push(`/insurance-plan/update/${id}`);

// --- Definisi Columns untuk TanStack Table ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: (info) => h('span', { class: 'text-sm title-bold' }, String(info.getValue() ?? '')),
    size: 80,
  },
  {
    accessorKey: 'providerId',
    header: 'PROVIDER ID',
    cell: (info) => h('span', { class: 'text-sm title-bold' }, String(info.getValue() ?? '')),
    size: 120,
  },
  {
    accessorKey: 'planName',
    header: 'PLAN NAME',
    cell: (info) => h('span', { class: 'text-sm title-bold' }, String(info.getValue() ?? '')),
    size: 220,
  },
  {
    accessorKey: 'price',
    header: 'PRICE',
    cell: (info) => {
      const formatted = formatCurrency(info.getValue());
      return h('span', { class: 'text-green-600 text-sm title-bold' }, formatted);
    },
    size: 140,
  },
  {
    accessorKey: 'coverage',
    header: 'COVERAGE',
    cell: (info) => {
      const formatted = formatCurrency(info.getValue());
      return h('span', { class: 'text-blue-600 text-sm title-bold' }, formatted);
    },
    size: 160,
  },
  {
    accessorKey: 'applicableService',
    header: 'APPLICABLE SERVICES',
    cell: (info) => {
      const value = info.getValue();
      let text = '-';
      if (Array.isArray(value) && value.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        text = value.map((s: any) => formatServiceName(String(s))).join(', ');
      } else if (typeof value === 'string' && value.trim()) {
        text = formatServiceName(value);
      }
      return h('span', { class: 'text-sm title-bold' }, text);
    },
    size: 260,
  },
  {
    accessorKey: 'expiredByDays',
    header: 'DURATION',
    cell: (info) => {
      const raw = info.getValue();
      const days = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : undefined;
      const formatted = formatDuration(days);
      return h('span', { class: 'text-sm title-bold' }, formatted);
    },
    size: 120,
  },
  {
    id: 'actions',
    header: 'ACTIONS',
    cell: (info) => {
      const item = info.row.original;
      return h('div', { class: 'flex justify-center gap-2' }, [
        h(
          VButton,
          { variant: 'outline-green', size: 'sm', onClick: () => goToViewPlan(item.id) },
          { default: () => 'View' }
        ),
        h(
          VButton,
          { variant: 'outline-blue', size: 'sm', onClick: () => goToEditPlan(item.id) },
          { default: () => 'Edit' }
        ),
      ]);
    },
    size: 160,
  },
];

// --- Logika ---
const fetchData = async () => {
  isLoading.value = true;
  try {
    await planStore.fetchPlans(searchQuery.value);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('Error fetching plans:', err);
    toast.error(err?.message || 'Failed to fetch plans');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

// Debounce untuk search
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchData();
  }, 300);
});
onUnmounted(() => {
  if (searchTimeout) clearTimeout(searchTimeout);
});
</script>

<template>
  <div class="w-full min-h-screen bg-white">
    <div class="px-6 md:px-8 py-6">
      <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 title-bold">Insurance Plans</h1>
          <p class="text-md text-gray-600 font-semibold">
            Manage and monitor all insurance plans available for travelers
          </p>
        </div>

        <VButton variant="primary" @click="goToAddPlan" class="whitespace-nowrap">
          <span class="mr-2">+</span>
          Add New Plan
        </VButton>
      </div>

      <hr class="border-gray-200 custom-margin" />

      <div class="w-full overflow-x-auto">
        <VDataTable
          :data="plans || []"
          :columns="columns"
          header-variant="gray"
          :striped="true"
          :sticky-header="true"
          :page-size="10"
          :page-size-options="[10, 20, 50]"
          :show-entries-per-page="true"
          :show-pagination="true"
          class="w-full"
          :loading="isLoading"
        >
          <!-- Search diletakkan di toolbar kiri agar sejajar dengan entries per page -->
          <template #toolbar-left>
            <label for="search" class="text-sm font-medium text-gray-700 whitespace-nowrap">Search:</label>
            <div class="relative w-72">
              <input
                id="search"
                v-model="searchQuery"
                type="text"
                placeholder="Search plans..."
                class="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                :disabled="isLoading"
              />
              <div v-if="isLoading" class="absolute right-3 top-1/2 -translate-y-1/2">
                <div class="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </template>
        </VDataTable>
      </div>
    </div>
  </div>
</template>

<style scoped>
.title-bold { font-weight: 800; }

.custom-margin {
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
