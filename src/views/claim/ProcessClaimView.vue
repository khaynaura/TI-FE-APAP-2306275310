<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import VButton from '@/components/common/VButton.vue'
import VFieldDisplay from '@/components/common/VFieldDisplay.vue'
import VTextArea from '@/components/common/VTextArea.vue'
import { useClaimStore } from '@/stores/claim/claim.stores'

type Decision = '' | 'ACCEPT' | 'REJECT'

const route = useRoute()
const router = useRouter()
const claimId = String(route.params.id ?? '')

const claimStore = useClaimStore()

const isLoading = ref(false)
const isSubmitting = ref(false)

// form state
const decision = ref<Decision>('')
const acceptedNote = ref('')
const rejectionReason = ref('')
const rejectionDescription = ref('')

// errors
const decisionErr = ref('')
const acceptedNoteErr = ref('')
const rejectionReasonErr = ref('')
const rejectionDescriptionErr = ref('')

// options
const rejectionReasonOptions = [
  { label: 'Incomplete Document', value: 'INCOMPLETE_DOCUMENT' },
  { label: 'Not Covered by Policy', value: 'NOT_COVERED' },
  { label: 'Fraud Suspected', value: 'FRAUD_SUSPECTED' },
  { label: 'Other', value: 'OTHER' },
]

// helpers: keep button enabled; validate on click
const canSubmit = computed(() => !isLoading.value && !isSubmitting.value && !!claimStore.detail)

const clearErrors = () => {
  decisionErr.value = ''
  acceptedNoteErr.value = ''
  rejectionReasonErr.value = ''
  rejectionDescriptionErr.value = ''
}

watch(decision, () => {
  // clear opposite fields when switching decision
  clearErrors()
  if (decision.value === 'ACCEPT') {
    rejectionReason.value = ''
    rejectionDescription.value = ''
  } else if (decision.value === 'REJECT') {
    acceptedNote.value = ''
  }
})

// clear field-level error while typing
watch(acceptedNote, (v) => { if (v.trim()) acceptedNoteErr.value = '' })
watch(rejectionReason, (v) => { if (v.trim()) rejectionReasonErr.value = '' })
watch(rejectionDescription, (v) => { if (v.trim()) rejectionDescriptionErr.value = '' })

const validate = () => {
  clearErrors()
  if (!decision.value) {
    decisionErr.value = 'Decision is required'
    return false
  }
  if (decision.value === 'ACCEPT') {
    if (!acceptedNote.value.trim()) acceptedNoteErr.value = 'Acceptance note is required'
  } else if (decision.value === 'REJECT') {
    if (!rejectionReason.value.trim()) rejectionReasonErr.value = 'Rejection reason is required'
    if (!rejectionDescription.value.trim()) rejectionDescriptionErr.value = 'Rejection description is required'
  }
  return !(decisionErr.value || acceptedNoteErr.value || rejectionReasonErr.value || rejectionDescriptionErr.value)
}

const fetchClaim = async () => {
  if (!claimId) {
    router.replace('/claim')
    return
  }
  isLoading.value = true
  try {
    const data = await claimStore.getById(claimId)
    if (!data) router.replace('/claim')
  } finally {
    isLoading.value = false
  }
}

const cancel = () => {
  router.back()
}

const process = async () => {
  if (!validate() || !canSubmit.value) return
  if (!claimStore.detail) return

  const confirmMsg =
    decision.value === 'ACCEPT'
      ? 'Confirm accepting this claim?'
      : 'Confirm rejecting this claim?'
  if (!window.confirm(confirmMsg)) return

  isSubmitting.value = true
  try {
    const payload =
      decision.value === 'ACCEPT'
        ? { isAccepted: true, acceptedNote: acceptedNote.value.trim() }
        : {
            isAccepted: false,
            rejectionReason: rejectionReason.value.trim(),
            rejectionDescription: rejectionDescription.value.trim(),
          }

    const res = await claimStore.processClaim(claimId, payload)
    if (res) router.push('/claim')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchClaim)
</script>

<template>
  <main class="w-full min-h-screen">
    <div class="px-8 py-8">
      <div class="mb-2">
        <h1 class="text-3xl font-extrabold text-gray-900 title-bold">Process Claim</h1>
        <p class="text-gray-600 mt-1">Review and make a decision on the submitted claim</p>
      </div>

      <hr class="border-gray-200 custom-margin" />

      <div class="rounded-xl border border-slate-200 bg-white">
        <div class="p-5">
          <div class="grid grid-cols-1 gap-4">
            <div>
              <VFieldDisplay label="Claim ID *" :value="claimStore.detail?.id || '-'" />
              <p class="text-xs text-gray-500 mt-1">This field is automatically filled and cannot be changed.</p>
            </div>

            <div>
              <VFieldDisplay
                label="Claim Proof"
                :value="claimStore.detail?.proof || '-'"
                variant="info"
              />
              <p class="text-xs text-gray-500 mt-1">This is the proof submitted by the claimant for review.</p>
            </div>

            <div>
              <label for="decision" class="block text-sm font-semibold text-gray-800 mb-1">Decision *</label>
              <select
                id="decision"
                v-model="decision"
                class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
                :disabled="isLoading || isSubmitting"
              >
                <option value="" disabled>Select a decision</option>
                <option value="ACCEPT">Accept Claim</option>
                <option value="REJECT">Reject Claim</option>
              </select>
              <p v-if="decisionErr" class="text-xs text-red-600 mt-1">{{ decisionErr }}</p>
            </div>

            <div v-if="decision === 'ACCEPT'">
              <VTextArea
                id="acceptedNote"
                label="Acceptance Note *"
                v-model="acceptedNote"
                :rows="5"
                placeholder="Add notes about the claim acceptance..."
                :error-message="acceptedNoteErr || null"
              />
            </div>

            <div v-if="decision === 'REJECT'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="rejectionReason" class="block text-sm font-semibold text-gray-800 mb-1">
                  Rejection Reason *
                </label>
                <select
                  id="rejectionReason"
                  v-model="rejectionReason"
                  class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
                  :disabled="isSubmitting"
                >
                  <option value="" disabled>Select a reason</option>
                  <option v-for="opt in rejectionReasonOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
                <p v-if="rejectionReasonErr" class="text-xs text-red-600 mt-1">{{ rejectionReasonErr }}</p>
              </div>

              <div>
                <VTextArea
                  id="rejectionDescription"
                  label="Rejection Description *"
                  v-model="rejectionDescription"
                  :rows="5"
                  placeholder="Provide detailed explanation for the rejection..."
                  :error-message="rejectionDescriptionErr || null"
                />
              </div>
            </div>
          </div>

          <hr class="border-gray-200 custom-margin" />

          <div class="flex justify-end gap-3 mt-6">
            <VButton variant="secondary" size="md" :disabled="isSubmitting" @click="cancel">Cancel</VButton>
            <VButton
              variant="orange"
              size="md"
              :disabled="!canSubmit"
              :loading="isSubmitting"
              @click="process"
            >
              Process Claim
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
