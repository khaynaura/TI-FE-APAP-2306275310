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
const isLoading = ref(false); // Tambahan: untuk loading state

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

// Helper function to format service names
const formatServiceName = (service: string) => {
  return service
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// --- Navigasi ---
const goToAddPlan = () => {
  router.push('/insurance-plan/create');
};
const goToViewPlan = (id: string) => {
  router.push(`/insurance-plan/${id}`);
};
const goToEditPlan = (id: string) => {
  router.push(`/insurance-plan/update/${id}`);
};

// --- Definisi Columns untuk TanStack Table ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: (info) => h('span', { class: 'text-sm font-medium' }, String(info.getValue() ?? '')),
    size: 80,
  },
  {
    accessorKey: 'providerId',
    header: 'PROVIDER ID',
    cell: (info) => h('span', { class: 'text-sm' }, String(info.getValue() ?? '')),
    size: 120,
  },
  {
    accessorKey: 'planName',
    header: 'PLAN NAME',
    cell: (info) => h('span', { class: 'text-sm font-semibold' }, String(info.getValue() ?? '')),
    size: 180,
  },
  {
    accessorKey: 'price',
    header: 'PRICE',
    cell: (info) => {
      const value = info.getValue();
      const formatted = formatCurrency(value);
      return h('span', { class: 'font-medium text-green-600 text-sm' }, formatted);
    },
    size: 130,
  },
  {
    accessorKey: 'coverage',
    header: 'COVERAGE',
    cell: (info) => {
      const value = info.getValue();
      const formatted = formatCurrency(value);
      return h('span', { class: 'font-medium text-blue-600 text-sm' }, formatted);
    },
    size: 140,
  },
  {
    accessorKey: 'applicableService',
    header: 'APPLICABLE SERVICES',
    cell: (info) => {
      const value = info.getValue();
      let text = '-';
      if (Array.isArray(value) && value.length > 0) {
        text = value.map(service => formatServiceName(service.toString())).join(', ');
      } else if (typeof value === 'string' && value.trim()) {
        text = formatServiceName(value);
      }
      return h('span', { class: 'text-sm' }, text);
    },
    size: 200,
  },
  {
    accessorKey: 'expiredByDays',
    header: 'DURATION',
    cell: (info) => {
      const raw = info.getValue();
      const days = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : undefined;
      const formatted = formatDuration(days);
      return h('span', { class: 'text-sm' }, formatted);
    },
    size: 100,
  },
  {
    id: 'actions',
    header: 'ACTIONS',
    cell: (info) => {
      const item = info.row.original;
      return h('div', { class: 'flex justify-center gap-2' }, [
        h(
          VButton,
          {
            variant: 'outline-green',
            size: 'sm',
            onClick: () => goToViewPlan(item.id),
          },
          { default: () => 'View' }
        ),
        h(
          VButton,
          {
            variant: 'outline-blue',
            size: 'sm',
            onClick: () => goToEditPlan(item.id),
          },
          { default: () => 'Edit' }
        ),
      ]);
    },
    size: 140,
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

// ...existing code...
<template>
  <div class="w-full min-h-screen bg-white">
    <div class="px-6 md:px-8 py-6">
      <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 title-bold">Insurance Plans</h1>
          <p class="text-md text-gray-600 font-semibold">Manage and monitor all insurance plans available for travelers</p>
        </div>
        <VButton variant="primary" @click="goToAddPlan" class="whitespace-nowrap">
          <span class="mr-2">+</span>
          Add New Plan
        </VButton>
      </div>

      <div class="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div class="flex items-center gap-2 flex-1 md:flex-initial">
          <label for="search" class="text-sm font-medium text-gray-700 whitespace-nowrap">Search:</label>
          <div class="relative flex-1 md:w-64">
            <input
              id="search"
              v-model="searchQuery"
              type="text"
              placeholder="Search plans..."
              class="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              :disabled="isLoading"
            />
            <div v-if="isLoading" class="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div class="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          </div>
        </div>
        <div v-if="isLoading" class="flex items-center text-sm text-gray-500">
          <div class="animate-pulse flex items-center gap-2">
            <div class="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            <span>Loading...</span>
          </div>
        </div>
      </div>

      <div class="w-full overflow-x-auto">
        <VDataTable
          :data="plans || []"
          :columns="columns"
          :page-size="10"
          :page-size-options="[10, 20, 50]"
          :show-entries-per-page="true"
          :show-pagination="true"
          class="w-full"
          :loading="isLoading"
        />
      </div>
    </div>
  </div>
</template>


<style scoped>
.title-bold {
  font-weight: 900;
}
</style>
