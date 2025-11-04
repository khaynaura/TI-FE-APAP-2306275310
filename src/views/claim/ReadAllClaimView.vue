<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted, h } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import type { ColumnDef } from '@tanstack/vue-table';
import VDataTable from '@/components/common/VDataTable.vue';
import VButton from '@/components/common/VButton.vue';
import { useClaimStore } from '@/stores/claim/claim.stores';
import { useInsurancePlanStore } from '@/stores/insurances/insurances.stores';
import type { ClaimSummaryResponse } from '@/interfaces/claim.interface';

// --- Router & Store ---
const router = useRouter();
const claimStore = useClaimStore();
const insurancePlanStore = useInsurancePlanStore();
const { list: claimList, loading: storeLoading } = storeToRefs(claimStore);

// --- Local state ---
const isFetchingPlans = ref(false);
const searchQuery = ref('');
const selectedStatus = ref<string>(''); // '' => All
const selectedPlanId = ref<string>(''); // '' => All

// --- Options ---
const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'WAITING_FOR_REVIEW', label: 'Waiting For Review' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
];

type PlanOption = { id: string; name: string };
const planOptions = ref<PlanOption[]>([]);

// --- Helpers ---
const toTitle = (s?: string | null) =>
  (s ?? '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(w => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
    .join(' ');

// Status variant mapping and badge class
const claimStatusVariant = (s?: string | null) => {
  const v = (s ?? '').toUpperCase();
  if (v === 'WAITING_FOR_REVIEW') return 'info';
  if (v === 'ACCEPTED') return 'success';
  if (v === 'REJECTED') return 'danger';
  return 'secondary';
};
const claimStatusBadgeClass = (s?: string | null) => {
  switch (claimStatusVariant(s)) {
    case 'success': return 'bg-green-100 text-green-700';
    case 'info':    return 'bg-blue-100 text-blue-700';
    case 'danger':  return 'bg-red-100 text-red-700';
    default:        return 'bg-slate-100 text-slate-700';
  }
};

// --- Navigation ---
const goToProcess = (id: string) => {
  router.push(`/claim/process/${id}`);
};

// --- FE-only search across visible fields ---
const filteredRows = computed<ClaimSummaryResponse[]>(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return claimList.value ?? [];
  return (claimList.value ?? []).filter(c => {
    const fields = [c.id, c.orderedPlanId, c.planName, c.status, String(c.daysSinceClaimed)]
      .filter(Boolean)
      .map(String)
      .map(s => s.toLowerCase());
    return fields.some(f => f.includes(q));
  });
});

// --- Columns ---
const columns: ColumnDef<ClaimSummaryResponse>[] = [
  {
    accessorKey: 'id',
    header: 'CLAIM ID',
    cell: info => h('span', { class: 'text-sm font-extrabold' }, String(info.getValue() ?? '')),
    size: 160,
  },
  {
    accessorKey: 'orderedPlanId',
    header: 'ORDERED PLAN ID',
    cell: info => h('span', { class: 'text-sm font-extrabold' }, String(info.getValue() ?? '')),
    size: 160,
  },
  {
    accessorKey: 'planName',
    header: 'PLAN NAME',
    cell: info => h('span', { class: 'text-sm font-extrabold' }, String(info.getValue() ?? '')),
    size: 260,
  },
  {
    id: 'daysSinceClaimed',
    header: 'DAYS SINCE CLAIMED',
    accessorFn: row => row.status?.toUpperCase() === 'WAITING_FOR_REVIEW' ? row.daysSinceClaimed : null,
    cell: info => {
      const v = info.getValue() as number | null;
      return h('span', { class: 'text-sm font-semibold' }, v == null ? '-' : `${v} days`);
    },
    size: 160,
  },
  {
    accessorKey: 'status',
    header: 'STATUS',
    cell: info => {
      const raw = String(info.getValue() ?? '');
      return h(
        'span',
        { class: ['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold', claimStatusBadgeClass(raw)] },
        toTitle(raw) || '-'
      );
    },
    size: 160,
  },
  {
    id: 'process',
    header: 'PROCESS',
    cell: info => {
      const item = info.row.original;
      const canProcess = (item.status ?? '').toUpperCase() === 'WAITING_FOR_REVIEW';
      if (!canProcess) return h('span', { class: 'text-xs text-slate-400' }, '-');
      return h(
        VButton,
        { variant: 'primary', size: 'sm', onClick: () => goToProcess(item.id) },
        { default: () => 'Process' }
      );
    },
    size: 140,
  },
];

// --- Fetching ---
const fetchClaims = async () => {
  await claimStore.fetchAllFiltered({
    status: selectedStatus.value || undefined,
    planId: selectedPlanId.value || undefined,
  });
};

const fetchPlans = async () => {
  isFetchingPlans.value = true;
  try {
    await insurancePlanStore.fetchPlans(); // GET /api/insurance-plan
    planOptions.value = (insurancePlanStore.plans ?? []).map(p => ({
      id: p.id,
      name: p.planName,
    }));
  } finally {
    isFetchingPlans.value = false;
  }
};

// --- Lifecycle ---
onMounted(async () => {
  await Promise.all([fetchPlans(), fetchClaims()]);
});

// Re-fetch from backend when filters change
watch([selectedStatus, selectedPlanId], () => {
  fetchClaims();
});

// Debounce FE search only
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {}, 250);
});
onUnmounted(() => {
  if (searchTimeout) clearTimeout(searchTimeout);
});
</script>

<template>
  <div class="w-full min-h-screen bg-white">
    <div class="px-6 md:px-8 py-6">

      <div class="mb-2">
        <h1 class="text-3xl font-extrabold text-gray-900 title-bold">Claims</h1>
        <p class="text-gray-600 mt-1">View and manage all claims submitted by users</p>
      </div>

      <hr class="border-gray-200 custom-margin" />

      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div class="flex flex-col">
          <label class="text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
          <select
            v-model="selectedStatus"
            class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :disabled="storeLoading"
          >
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>

        <div class="flex flex-col">
          <label class="text-sm font-medium text-gray-700 mb-1">Filter by Insurance Plan</label>
          <select
            v-model="selectedPlanId"
            class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :disabled="storeLoading || isFetchingPlans"
          >
            <option value="">All Insurance Plans</option>
            <option v-for="p in planOptions" :key="p.id" :value="p.id">
              {{ p.id }} - {{ p.name }}
            </option>
          </select>
        </div>

        <div class="flex flex-col">
          <label for="search" class="text-sm font-medium text-gray-700 mb-1">Search</label>
          <div class="relative">
            <input
              id="search"
              v-model="searchQuery"
              type="text"
              placeholder="Search claims..."
              class="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              :disabled="storeLoading"
            />
            <div v-if="storeLoading" class="absolute right-3 top-1/2 -translate-y-1/2">
              <div class="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="w-full overflow-x-auto">
        <VDataTable
          :data="filteredRows"
          :columns="columns"
          header-variant="gray"
          :striped="true"
          :sticky-header="true"
          :page-size="10"
          :page-size-options="[10, 20, 50]"
          :show-entries-per-page="true"
          :show-pagination="true"
          class="w-full"
          :loading="storeLoading"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.title-bold {
  font-weight: 800;
}
.section-bold {
  font-weight: 700;
}
.field-bold {
  font-weight: 550;
}
.soft-bold {
  font-weight: 450;
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
