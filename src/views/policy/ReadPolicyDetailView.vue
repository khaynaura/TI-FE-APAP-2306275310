<script setup lang="ts">
import { ref, onMounted, computed, h } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import VButton from '@/components/common/VButton.vue';
import VFieldDisplay from '@/components/common/VFieldDisplay.vue';
import VDataTable from '@/components/common/VDataTable.vue';
import { usePolicyStore } from '@/stores/policy/policy.stores';
import type { Policy, OrderedPlanSummary } from '@/interfaces/policy.interface';
import type { ColumnDef } from '@tanstack/vue-table';

const route = useRoute();
const router = useRouter();
const { id: policyId } = route.params as { id: string };

const policyStore = usePolicyStore();

const policy = ref<Policy | null>(null);
const isLoading = ref(false);
const isPaying = ref(false);
const isConfirmOpen = ref(false);

const serviceLabels: Record<string, string> = {
  ACCOMMODATION: 'Accommodation',
  FLIGHT: 'Flight',
  TOUR_PACKAGE: 'Tour Package',
  RENTALS: 'Rentals',
};

const formatService = (s?: string) =>
  (s ?? '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const planAmount = computed(() => policy.value?.orderedPlans?.length ?? 0);
const canPay = computed(() => (policy.value?.status ?? '').toUpperCase() !== 'PAID');

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

const formatCurrency = (val?: number | null, currency = 'IDR') => {
  if (val == null) return null;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency }).format(val);
};

const fetchPolicy = async () => {
  isLoading.value = true;
  try {
    const data = await policyStore.getPolicyById(policyId);
    policy.value = data;
    if (!policy.value) router.replace('/policy');
  } finally {
    isLoading.value = false;
  }
};

const payPolicy = async () => {
  if (!policy.value) return;
  isPaying.value = true;
  try {
    const updated = await policyStore.payPolicy(policy.value.id);
    if (updated) policy.value = updated;
  } finally {
    isPaying.value = false;
  }
};

const openPayConfirm = () => { isConfirmOpen.value = true; };
const closePayConfirm = () => { if (!isPaying.value) isConfirmOpen.value = false; };
const confirmPay = async () => {
  await payPolicy();
  isConfirmOpen.value = false;
};

// ----- Ordered Plans table (TanStack via VDataTable) -----
const orderedPlans = computed<OrderedPlanSummary[]>(() => policy.value?.orderedPlans ?? []);

const columns: ColumnDef<OrderedPlanSummary>[] = [
  {
    accessorKey: 'id',
    header: 'PLAN ID',
    cell: info => h('span', { class: 'text-sm title-bold' }, String(info.getValue() ?? '')),
    size: 140,
  },
  {
    accessorKey: 'insurancePlanId',
    header: 'INSURANCE PLAN ID',
    cell: info => h('span', { class: 'text-sm title-bold' }, String(info.getValue() ?? '')),
    size: 160,
  },
  {
    accessorKey: 'status',
    header: 'STATUS',
    cell: info =>
      h(
        'span',
        { class: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs title-bold bg-slate-100 text-slate-700' },
        String(info.getValue() ?? '-')
      ),
    size: 120,
  },
  {
    accessorKey: 'expiredDate',
    header: 'EXPIRED DATE',
    cell: info => h('span', { class: 'text-sm title-bold' }, formatLocalDate(String(info.getValue() ?? '')) || '-'),
    size: 160,
  },
  {
    accessorKey: 'claimsCount',
    header: 'CLAIMS COUNT',
    cell: info => h('span', { class: 'text-sm title-bold' }, String(info.getValue() ?? 0)),
    size: 120,
  },
  {
    id: 'actions',
    header: 'ACTIONS',
    cell: info => {
      const item = info.row.original;
      return h(
        VButton,
        { variant: 'outline-blue', size: 'sm', onClick: () => router.push(`/ordered-plan/${item.id}`) },
        { default: () => 'View Detail' }
      );
    },
    size: 150,
  },
];

onMounted(fetchPolicy);
</script>

<template>
  <main class="w-full min-h-screen">
    <div class="px-8 py-8">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 title-bold">Policy Details</h1>
          <p class="text-gray-600 mt-1">Policy ID: {{ policy?.id }}</p>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <VButton
            v-if="canPay"
            :loading="isPaying"
            :disabled="isPaying || isLoading"
            variant="outline-green"
            size="lg"
            @click="openPayConfirm"
          >
            Pay
          </VButton>
          <span
            v-else
            class="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-400 text-white text-sm section-bold pointer-events-none select-none"
          >
            Already Paid
          </span>
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
            <VFieldDisplay label="Policy ID" :value="policy?.id" />
            <VFieldDisplay label="Booking ID" :value="policy?.bookingId" />
            <VFieldDisplay label="User ID" :value="policy?.userId" />
            <!-- Service dibirukan (seperti Total Coverage) -->
            <VFieldDisplay
              label="Service"
              :value="policy?.service ? (serviceLabels[String(policy?.service)] ?? formatService(String(policy?.service))) : null"
              variant="info"
            />
          </div>
        </section>

        <!-- Status & Financial -->
        <section>
          <h3 class="text-l font-black text-gray-900 section-bold">Status & Financial Information</h3>
          <hr class="border-gray-200 custom-margin2" />
          <div class="grid grid-cols-1 gap-4">
            <!-- Status boxed -->
            <VFieldDisplay
              label="Status"
              :value="policy?.status || null"
              :variant="(policy?.status ?? '').toUpperCase() === 'PAID' ? 'success' : 'warning'"
            />
            <VFieldDisplay label="Total Price" :value="policy?.totalPrice" format="currency" variant="success" currency="IDR" />
            <VFieldDisplay label="Total Coverage" :value="policy?.totalCoverage" format="currency" variant="info" currency="IDR" />
            <VFieldDisplay label="Plan Amount" :value="planAmount ? `${planAmount} plan(s)` : null" />
          </div>
        </section>
      </div>

      <!-- Dates in one row, smaller text -->
      <hr class="border-gray-200 custom-margin2" />
      <section>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <VFieldDisplay label="Start Date" :value="policy?.startDate ? formatLocalDate(policy?.startDate) : null" />
          <VFieldDisplay label="Created Date" :value="policy?.createdAt ? formatDateTime(policy?.createdAt) : null" />
          <VFieldDisplay label="Last Updated" :value="policy?.updatedAt ? formatDateTime(policy?.updatedAt) : null" />
        </div>
      </section>

      <hr class="border-gray-200 custom-margin2" />

      <!-- Ordered Plans (VDataTable) -->
      <section>
        <h3 class="text-l font-black text-gray-900 section-bold">Ordered Plans ({{ planAmount }})</h3>
        <hr class="border-gray-200 custom-margin2" />
        <VDataTable
          :data="orderedPlans"
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

    <!-- Confirm Payment Modal -->
    <div v-if="isConfirmOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60" @click="closePayConfirm"></div>
      <div
        class="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <div class="flex items-center justify-between mb-6">
          <h3 id="confirm-title" class="text-lg font-bold text-gray-900 flex-1 text-center section-bold">Confirm Payment</h3>
          <button class="text-gray-400 hover:text-gray-600 p-1 ml-4" @click="closePayConfirm" :disabled="isPaying" aria-label="Close">✕</button>
        </div>

        <p class="text-sm text-gray-600 mb-6 text-center">
          Are you sure you want to process the payment for this policy?
        </p>

        <hr class="border-gray-100 custom-margin2" />
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-5 mb-6">
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm text-slate-500 soft-bold">Policy ID:</span>
              <span class="font-semibold text-slate-900 field-bold">{{ policy?.id }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-slate-500 soft-bold">Total Amount:</span>
              <span class="font-bold text-emerald-600 section-bold">
                {{ formatCurrency(policy?.totalPrice ?? 0, 'IDR') }}
              </span>
            </div>
          </div>
        </div>

        <hr class="border-gray-100 custom-margin2" />
        <div class="flex justify-center gap-3">
          <VButton variant="secondary" size="md" @click="closePayConfirm" :disabled="isPaying">Cancel</VButton>
          <VButton variant="outline-green" size="md" :loading="isPaying" @click="confirmPay">Continue Payment</VButton>
        </div>
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
