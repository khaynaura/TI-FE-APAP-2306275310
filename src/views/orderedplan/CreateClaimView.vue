<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import VButton from '@/components/common/VButton.vue';
import VFieldDisplay from '@/components/common/VFieldDisplay.vue';
import VTextarea from '@/components/common/VTextarea.vue'; // <-- add
import { useOrderedPlanStore } from '@/stores/orderedplan/orderedplan.stores';
import { useClaimStore } from '@/stores/claim/claim.stores';

// Route/init
const route = useRoute();
const router = useRouter();
const orderedPlanId = String(route.params.id ?? '');

// Stores
const orderedPlanStore = useOrderedPlanStore();
const claimStore = useClaimStore();

// State
const isLoading = ref(false);
const isSubmitting = ref(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const plan = ref<any | null>(null);

const proof = ref('');
const proofError = ref('');

// Helpers
const formatTitleCase = (s?: string | null) =>
  String(s ?? '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());

const canSubmit = computed(
  () => !isLoading.value && !isSubmitting.value && !!plan.value && proof.value.trim().length > 0
);

// Load ordered plan
const fetchPlan = async () => {
  isLoading.value = true;
  try {
    const data = await orderedPlanStore.getOrderedPlanById(orderedPlanId);
    plan.value = data;
    if (!plan.value) router.replace('/policy');
  } finally {
    isLoading.value = false;
  }
};

// Actions
const cancel = () => {
  router.push(`/ordered-plan/${orderedPlanId}`);
};

const submit = async () => {
  proofError.value = '';
  if (!proof.value.trim()) {
    proofError.value = 'Proof is required';
    return;
  }
  if (!plan.value) return;

  isSubmitting.value = true;
  try {
    const res = await claimStore.submitClaim(orderedPlanId, { proof: proof.value.trim() });
    if (res) {
      router.push(`/ordered-plan/${orderedPlanId}`);
    }
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(fetchPlan);
</script>

<template>
  <main class="w-full min-h-screen">
    <div class="px-8 py-8">
      <!-- Title -->
      <div class="mb-2">
        <h1 class="text-3xl font-extrabold text-gray-900 title-bold">Claim Ordered Plan</h1>
        <p class="text-gray-600 mt-1">Submit a claim for your ordered insurance plan</p>
      </div>

      <hr class="border-gray-200 custom-margin" />

      <div class="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 mb-6">
        <h3 class="text-lg font-extrabold text-blue-800 mb-2 field-bold">Ordered Plan Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-y-2 text-sm">
          <div class="justify-self-start text-center md:text-left">
            <span class="text-blue-700 mr-2 field-bold">Plan ID: </span>
            <span class="text-blue-900 field-bold">{{ plan?.id || '-' }}</span>
          </div>
          <div class="justify-self-center text-center">
            <span class="text-blue-700 font-semibold mr-2 field-bold">Insurance Plan ID: </span>
            <span class="text-blue-900 field-bold">{{ plan?.insurancePlanId || '-' }}</span>
          </div>
          <div class="justify-self-end text-center md:text-right">
            <span class="text-blue-700 font-semibold mr-2 field-bold">Status: </span>
            <span class="text-blue-900 field-bold">{{ formatTitleCase(plan?.status) || '-' }}</span>
          </div>
        </div>
      </div>

      <hr class="border-gray-200 custom-margin" />

      <!-- Form -->
      <div class="rounded-xl border border-slate-200 bg-white">
        <div class="p-5">
          <div class="grid grid-cols-1 gap-4">
            <div>
              <VFieldDisplay label="Ordered Plan ID *" :value="plan?.id || '-'" />
              <p class="text-xs text-gray-500 mt-1">This field is automatically filled and cannot be changed.</p>
            </div>

            <div>
              <VTextarea
                id="proof"
                label="Proof *"
                v-model="proof"
                :rows="6"
                placeholder="Enter your proof of claim (e.g., receipts, documents, incident description...)"
                :required="true"
                :error-message="proofError || null"
                @blur="() => { if (!proof.trim()) proofError = 'Proof is required' }"
              />
              <p v-if="!proofError" class="text-xs text-gray-500 mt-1">
                Provide detailed evidence to support your claim.
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <VButton variant="secondary" size="md" :disabled="isSubmitting" @click="cancel">Cancel</VButton>
            <VButton variant="orange" size="md" :disabled="!canSubmit" :loading="isSubmitting" @click="submit">
              Submit Claim
            </VButton>
          </div>
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
