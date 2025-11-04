<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import VPolicyForm from '@/components/policy/VPolicyForm.vue';
import { usePolicyStore } from '@/stores/policy/policy.stores';
import type { CreatePolicyRequest } from '@/interfaces/policy.interface';
import type { ServiceEnum } from '@/stores/enums.stores';

const router = useRouter();
const policyStore = usePolicyStore();

const model = ref<CreatePolicyRequest>({
  userId: '',
  bookingId: '',
  service: '' as unknown as ServiceEnum, // wajib dipilih user
  insurancePlanIds: [],
});

const onCreate = async (payload: CreatePolicyRequest) => {
  const created = await policyStore.createPolicy(payload);
  if (created?.id) {
    toast.success('Policy berhasil dibuat. Mengalihkan ke detail...');
    router.push(`/policy/${created.id}`);
  }
};
</script>

<template>
  <div class="w-full min-h-screen bg-white">
    <div class="px-6 md:px-8 py-6">
      <div class="mb-6">
        <h1 class="text-3xl text-gray-800 title-bold">Create Policy</h1>
        <p class="text-md text-gray-600 font-semibold">Add a new policy to the system</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <VPolicyForm :action="onCreate" :policyModel="model" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.title-bold {
  font-weight: 800;
}

.custom-margin {
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>
