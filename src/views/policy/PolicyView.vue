<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted, h } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import type { ColumnDef } from '@tanstack/vue-table';
import VDataTable from '@/components/common/VDataTable.vue';
import VButton from '@/components/common/VButton.vue';
import { usePolicyStore } from '@/stores/policy/policy.stores';
import type { Policy } from '@/interfaces/policy.interface';

// --- Init store & router ---
const router = useRouter();
const policyStore = usePolicyStore();
const { policies } = storeToRefs(policyStore);

// --- State ---
const searchQuery = ref('');
const isLoading = ref(false);

// --- Helpers ---
const formatCurrency = (value: unknown) => {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(n)) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
};

const formatServiceName = (service: string) =>
  service
    ?.replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || '-';

const statusBadge = (status?: string) => {
  const s = (status ?? '').toUpperCase();
  const base = 'px-2 py-0.5 text-xs rounded-full title-bold';
  if (s === 'PAID') return `${base} bg-emerald-100 text-emerald-700`;
  if (s === 'UNPAID') return `${base} bg-rose-100 text-rose-700`;
  return `${base} bg-slate-100 text-slate-700`;
};

// --- Navigation ---
const goToCreatePolicy = () => router.push('/policy/create');
const goToViewPolicy = (id: string) => router.push(`/policy/${id}`);


// --- FE-only search (filter di computed) ---
const filteredPolicies = computed<Policy[]>(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return policies.value ?? [];
  return (policies.value ?? []).filter(p => {
    const fields = [
      p.id,
      p.userId,
      p.bookingId,
      p.status,
      p.totalPrice?.toString(),
      p.totalCoverage?.toString(),
      p.orderedPlans?.length?.toString(),
      p.service?.toString(),
    ]
      .filter(Boolean)
      .map(String)
      .map(s => s.toLowerCase());
    return fields.some(f => f.includes(q));
  });
});

// --- Columns ---
const columns: ColumnDef<Policy>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: info => h('span', { class: 'text-sm title-bold' }, String(info.getValue() ?? '')),
    size: 90,
  },
  {
    accessorKey: 'userId',
    header: 'USER ID',
    cell: info => h('span', { class: 'text-sm title-bold' }, String(info.getValue() ?? '')),
    size: 140,
  },
  {
    accessorKey: 'service',
    header: 'SERVICE',
    cell: info => {
      const value = info.getValue() as string;
      return h('span', { class: 'text-sm title-bold' }, formatServiceName(value));
    },
    size: 160,
  },
  {
    id: 'planAmount',
    header: 'PLAN AMOUNT',
    accessorFn: row => row.orderedPlans?.length ?? 0,
    cell: info => h('span', { class: 'text-sm title-bold' }, String(info.getValue() ?? 0)),
    size: 140,
  },
  {
    accessorKey: 'totalCoverage',
    header: 'COVERAGE AMOUNT',
    cell: info => h('span', { class: 'text-blue-600 text-sm title-bold' }, formatCurrency(info.getValue())),
    size: 200,
  },
  {
    accessorKey: 'status',
    header: 'STATUS',
    cell: info => {
      const s = String(info.getValue() ?? '');
      return h('span', { class: statusBadge(s) }, s || '-');
    },
    size: 120,
  },
  {
    id: 'actions',
    header: 'ACTIONS',
    cell: info => {
      const item = info.row.original;
      return h('div', { class: 'flex justify-center gap-2' }, [
        h(
          VButton,
          { variant: 'outline-green', size: 'sm', onClick: () => goToViewPolicy(item.id) },
          { default: () => 'View' }
        ),
      ]);
    },
    size: 200,
  },
];

// --- Fetch ---
const fetchData = async () => {
  isLoading.value = true;
  try {
    await policyStore.fetchPolicies();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    // toast/error sudah ditangani di store
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

// Debounce search input (FE-only)
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    // FE filter only; tidak memanggil API lagi
  }, 250);
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
          <h1 class="text-3xl font-extrabold text-gray-900 title-bold">Policies</h1>
          <p class="text-md text-gray-600 font-semibold">
            Manage and monitor all Policy that have been made by Travelers
          </p>
        </div>

        <VButton variant="primary" @click="goToCreatePolicy" class="whitespace-nowrap">
          <span class="mr-2">+</span>
          Create New Policy
        </VButton>
      </div>

      <hr class="border-gray-200 custom-margin" />

      <div class="w-full overflow-x-auto">
        <VDataTable
          :data="filteredPolicies"
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
          <template #toolbar-left>
            <label for="search" class="text-sm font-medium text-gray-700 whitespace-nowrap">Search:</label>
            <div class="relative w-72">
              <input
                id="search"
                v-model="searchQuery"
                type="text"
                placeholder="Search policies..."
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
.custom-margin { margin-top: 10px; margin-bottom: 10px; }
</style>
