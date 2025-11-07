<script setup lang="ts">
import { ref, onMounted, computed, h } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import VButton from '@/components/common/VButton.vue';
import VFieldDisplay from '@/components/common/VFieldDisplay.vue';
import VDataTable from '@/components/common/VDataTable.vue';
import type { ColumnDef } from '@tanstack/vue-table';

import { useOrderedPlanStore } from '@/stores/orderedplan/orderedplan.stores';
import { useClaimStore } from '@/stores/claim/claim.stores';
import type { OrderedPlanDetailResponse } from '@/interfaces/orderedplan.interface';
import type { ClaimSummaryResponse, ClaimDetailResponse } from '@/interfaces/claim.interface';

const route = useRoute();
const router = useRouter();
const { id: orderedPlanId } = route.params as { id: string };

const orderedPlanStore = useOrderedPlanStore();
const claimStore = useClaimStore();

const plan = ref<OrderedPlanDetailResponse | null>(null);
const isLoading = ref(false);

// Modal state
const isModalOpen = ref(false);
const modalLoading = ref(false);
const selectedClaim = ref<ClaimSummaryResponse | null>(null);
const claimDetail = ref<ClaimDetailResponse | null>(null);

const formatDateTime = (value?: string | null) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatLocalDate = (value?: string | null) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: '2-digit' });
};

const formatStatus = (s?: string | null) =>
  String(s ?? '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());


const statusVariant = (s?: string | null) => {
  const v = (s ?? '').toUpperCase();
  if (v === 'PAID') return 'success';
  if (v === 'WAITING FOR REVIEW' || v === 'WAITING_FOR_REVIEW') return 'info';
  if (v === 'CLAIMED') return 'purple';
  if (v === 'ORDERED') return 'warning';
  if (v === 'REJECTED') return 'danger';
  if (v === 'EXPIRED') return 'secondary';
  return 'secondary';
};

const claims = computed<ClaimSummaryResponse[]>(() => plan.value?.claims ?? []);

const hasDetailButton = (s: string) => {
  const v = (s ?? '').toUpperCase();
  return v === 'ACCEPTED' || v === 'REJECTED';
};

const claimStatusVariant = (s?: string | null) => {
  const v = (s ?? '').toUpperCase();
  if (v === 'WAITING_FOR_REVIEW') return 'info';
  if (v === 'ACCEPTED') return 'success';
  if (v === 'REJECTED') return 'danger';
  return 'secondary';
};

const claimBadgeClass = (s?: string | null) => {
  switch (claimStatusVariant(s)) {
    case 'success': return 'bg-green-100 text-green-700';
    case 'info': return 'bg-blue-100 text-blue-700';
    case 'danger': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const columns: ColumnDef<ClaimSummaryResponse>[] = [
  {
    accessorKey: 'id',
    header: 'CLAIM ID',
    cell: info => h('span', { class: 'text-sm title-bold' }, String(info.getValue() ?? '')),
    size: 160,
  },
  {
    accessorKey: 'planName',
    header: 'PLAN NAME',
    cell: info => h('span', { class: 'text-sm title-bold' }, String(info.getValue() ?? '')),
    size: 240,
  },
  {
    accessorKey: 'status',
    header: 'STATUS',
    cell: info => {
      const raw = String(info.getValue() ?? '');
      return h(
        'span',
        { class: ['inline-flex items-center px-2 py-0.5 rounded-full text-xs title-bold', claimBadgeClass(raw)] },
        formatStatus(raw) || '-'
      );
    },
    size: 140,
  },
  {
    accessorKey: 'daysSinceClaimed',
    header: 'DAYS SINCE CLAIMED',
    cell: info => h('span', { class: 'text-sm title-bold' }, `${info.getValue() ?? 0} days`),
    size: 180,
  },
  {
    id: 'detail',
    header: 'DETAIL',
    cell: info => {
      const item = info.row.original;
      if (!hasDetailButton(item.status)) return h('span', { class: 'text-sm text-slate-400' }, '-');
      return h(
        VButton,
        {
          variant: 'outline-blue',
          size: 'sm',
          onClick: () => openClaimDetail(item),
        },
        { default: () => 'Detail' }
      );
    },
    size: 120,
  },
];

const fetchOrderedPlan = async () => {
  isLoading.value = true;
  try {
    const data = await orderedPlanStore.getOrderedPlanById(orderedPlanId);
    plan.value = data;
    if (!plan.value) router.replace('/policy');
  } finally {
    isLoading.value = false;
  }
};

const openClaimDetail = async (item: ClaimSummaryResponse) => {
  selectedClaim.value = item;
  claimDetail.value = null;
  modalLoading.value = true;
  isModalOpen.value = true;

  try {
    const detail = await claimStore.getById(item.id);
    claimDetail.value = detail;
  } finally {
    modalLoading.value = false;
  }
};

const closeModal = () => {
  if (modalLoading.value) return;
  isModalOpen.value = false;
  selectedClaim.value = null;
  claimDetail.value = null;
};

const goToSubmitClaim = () => {
  if (!plan.value) return;
  router.push({ name: 'claim-add', params: { id: plan.value.id } });
};

onMounted(fetchOrderedPlan);
</script>

<template>
  <main class="w-full min-h-screen">
    <div class="px-8 py-8">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 title-bold">Ordered Plan Details</h1>
          <p class="text-gray-600 mt-1">Plan ID: {{ plan?.id }}</p>
        </div>
        <div class="flex items-center gap-3 shrink-0">


      <div class="flex items-center gap-3 shrink-0">
  <VButton
    variant="orange"
    size="lg"
    :disabled="isLoading || !plan"
    @click="goToSubmitClaim"
  >
    Claim
  </VButton>
</div>
</div>
      </div>

      <hr class="border-gray-200 custom-margin" />

      <!-- Grids -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-12">
        <!-- Basic Information -->
        <section>
          <h3 class="text-l font-black text-gray-900 section-bold">Basic Information</h3>
          <hr class="border-gray-200 custom-margin2" />
          <div class="grid grid-cols-1 gap-4">
            <VFieldDisplay label="Plan ID" :value="plan?.id || null" />
            <VFieldDisplay label="Insurance Plan ID" :value="plan?.insurancePlanId || null" />
            <VFieldDisplay
              label="Status"
              :value="plan?.status ? formatStatus(plan?.status) : null"
              :variant="statusVariant(plan?.status)"
            />
          </div>
        </section>

        <!-- Date Information -->
        <section>
          <h3 class="text-l font-black text-gray-900 section-bold">Date Information</h3>
          <hr class="border-gray-200 custom-margin2" />
          <div class="grid grid-cols-1 gap-4">
            <VFieldDisplay
              label="Expired Date"
              :value="plan?.expiredDate ? formatLocalDate(plan?.expiredDate) : null"
              variant="danger"
            />
            <VFieldDisplay
              label="Created Date"
              :value="plan?.createdAt ? formatDateTime(plan?.createdAt) : null"
            />
            <VFieldDisplay
              label="Last Updated"
              :value="plan?.updatedAt ? formatDateTime(plan?.updatedAt) : null"
            />
          </div>
        </section>
      </div>

      <hr class="border-gray-200 custom-margin2" />

      <!-- Claims (VDataTable) -->
      <section>
        <h3 class="text-l font-black text-gray-900 section-bold">
          Claims ({{ claims.length }})
        </h3>
        <hr class="border-gray-200 custom-margin2" />
        <VDataTable
          :data="claims"
          :columns="columns"
          header-variant="gray"
          :striped="true"
          :sticky-header="true"
          :page-size="5"
          :page-size-options="[5,10,20]"
          :show-entries-per-page="true"
          :show-pagination="true"
          class="w-full"
          :loading="isLoading"
        />
      </section>

      <!-- Footer actions -->
      <div class="flex justify-end gap-3 pt-8">
        <VButton variant="secondary" size="lg" @click="router.push('/policy')">
          Back
        </VButton>
      </div>
    </div>

    <!-- Claim Detail Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60" @click="closeModal"></div>
      <div
        class="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-900 flex-1 text-center section-bold">
            <template v-if="(selectedClaim?.status ?? '').toUpperCase() === 'ACCEPTED'">
              Accepted Claim Details
            </template>
            <template v-else-if="(selectedClaim?.status ?? '').toUpperCase() === 'REJECTED'">
              Rejected Claim Details
            </template>
            <template v-else>Claim Details</template>
          </h3>

          <button class="text-gray-400 hover:text-gray-600 p-1 ml-4" @click="closeModal" :disabled="modalLoading" aria-label="Close">✕</button>
        </div>
        <hr class="border-gray-100 custom-margin2" />

        <div v-if="modalLoading" class="text-center py-6 text-sm text-slate-500">Loading...</div>

        <template v-else>
          <div class="grid grid-cols-1 gap-4">
            <VFieldDisplay label="Claim ID" :value="selectedClaim?.id || null" />
            <!-- Accepted view -->
            <template v-if="(selectedClaim?.status ?? '').toUpperCase() === 'ACCEPTED'">
              <VFieldDisplay label="Note" :value="claimDetail?.acceptedNote || null" variant="success" />
              <VFieldDisplay
                label="Accepted Timestamp"
                :value="claimDetail?.acceptedTimestamp ? formatDateTime(claimDetail?.acceptedTimestamp) : null"
              />
            </template>
            <!-- Rejected view -->
            <template v-else-if="(selectedClaim?.status ?? '').toUpperCase() === 'REJECTED'">
              <VFieldDisplay label="Rejection Reason" :value="claimDetail?.rejectionReason || null" variant="danger" />
              <VFieldDisplay label="Rejection Description" :value="claimDetail?.rejectionDescription || null" variant="danger" />
              <VFieldDisplay
                label="Rejection Timestamp"
                :value="claimDetail?.rejectionTimestamp ? formatDateTime(claimDetail?.rejectionTimestamp) : null"
              />
            </template>
            <!-- Fallback -->
            <template v-else>
              <VFieldDisplay label="Status" :value="selectedClaim?.status || null" />
            </template>
          </div>

          <hr class="border-gray-100 custom-margin2" />

          <div class="flex justify-center mt-6">
            <VButton variant="secondary" size="md" @click="closeModal">Close</VButton>
          </div>
        </template>
      </div>
    </div>
  </main>
</template>

<style scoped>
.title-bold { font-weight: 800; }
.section-bold { font-weight: 700; }
.field-bold { font-weight: 550; }
.soft-bold { font-weight: 450; }

.custom-margin { margin-top: 20px; margin-bottom: 20px; }
.custom-margin2 { margin-top: 10px; margin-bottom: 10px; }
</style>
