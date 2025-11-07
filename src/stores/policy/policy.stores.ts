import { defineStore } from 'pinia';
import axios from 'axios';
import { toast } from 'vue-sonner';
import type { CommonResponseInterface } from '@/interfaces/common.response.interface';
import type { Policy, CreatePolicyRequest } from '@/interfaces/policy.interface';
import { getApiErrorMessage } from '@/utils/api-error';

const basePolicyUrl = `${import.meta.env.VITE_API_URL}/policy`;

export const usePolicyStore = defineStore('policy', {
  state: () => ({
    policies: [] as Policy[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchPolicies(): Promise<Policy[]> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.get<CommonResponseInterface<Policy[]>>(basePolicyUrl);
        this.policies = res.data.data ?? [];
        if (this.policies.length === 0) {
          toast.warning('Data Policy kosong');
        } else {
          toast.success('Data Policy dimuat');
        }
        return this.policies;
      } catch (e: unknown) {
        const msg = getApiErrorMessage(e);
        this.error = msg;
        toast.error(msg);
        return [];
      } finally {
        this.loading = false;
      }
    },

    async getPolicyById(id: string): Promise<Policy | null> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.get<CommonResponseInterface<Policy>>(`${basePolicyUrl}/${id}`);
        const policy = res.data.data ?? null;
        if (policy) {
          toast.success('Detail Policy dimuat');
        } else {
          toast.warning('Policy tidak ditemukan');
        }
        return policy;
      } catch (e: unknown) {
        const msg = getApiErrorMessage(e);
        this.error = msg;
        if (axios.isAxiosError(e) && e.response?.status === 404) {
          toast.warning(msg || 'Policy tidak ditemukan');
        } else {
          toast.error(msg);
        }
        return null;
      } finally {
        this.loading = false;
      }
    },

    async createPolicy(payload: CreatePolicyRequest): Promise<Policy | null> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.post<CommonResponseInterface<Policy>>(
          `${basePolicyUrl}/create`,
          payload
        );
        if (res.status === 201) {
          const created = res.data.data ?? null;
          if (created) this.policies.push(created);
          toast.success('Policy berhasil dibuat');
          return created;
        }
        return null;
      } catch (e: unknown) {
        const msg = getApiErrorMessage(e);
        this.error = msg;
        toast.error(msg);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async payPolicy(id: string): Promise<Policy | null> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.put<CommonResponseInterface<Policy>>(`${basePolicyUrl}/pay/${id}`);
        const updated = res.data.data ?? null;
        if (updated) {
          const idx = this.policies.findIndex(p => p.id === updated.id);
          if (idx !== -1) this.policies[idx] = updated;
          toast.success('Pembayaran policy berhasil');
          return updated;
        }
        toast.warning('Policy tidak ditemukan');
        return null;
      } catch (e: unknown) {
        const msg = getApiErrorMessage(e);
        this.error = msg;
        if (axios.isAxiosError(e) && e.response?.status === 404) {
          toast.warning(msg || 'Policy tidak ditemukan');
        } else {
          toast.error(msg);
        }
        return null;
      } finally {
        this.loading = false;
      }
    },
  },
});
