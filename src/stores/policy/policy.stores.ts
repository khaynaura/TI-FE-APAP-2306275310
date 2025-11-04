/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia';
import axios from 'axios';
import { toast } from 'vue-sonner';
import type { CommonResponseInterface } from '@/interfaces/common.response.interface';
import type { Policy, CreatePolicyRequest } from '@/interfaces/policy.interface'; 

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
        if (axios.isAxiosError(e)) {
          const message = (e.response?.data as any)?.message ?? e.message;
          this.error = message;
          toast.error(`Gagal memuat Policy: ${message}`);
        } else {
          this.error = e instanceof Error ? e.message : 'Unknown error';
          toast.error(`Gagal memuat Policy: ${this.error}`);
        }
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
        if (axios.isAxiosError(e)) {
          const status = e.response?.status;
          const message = (e.response?.data as any)?.message ?? e.message;
          if (status === 404) {
            toast.warning('Policy tidak ditemukan');
          } else {
            toast.error(`Gagal memuat detail Policy: ${message}`);
          }
          this.error = message;
        } else {
          this.error = e instanceof Error ? e.message : 'Unknown error';
          toast.error(`Gagal memuat detail Policy: ${this.error}`);
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
          const created = res.data.data;
          if (created) this.policies.push(created);
          toast.success('Policy berhasil dibuat');
          return created ?? null;
        }
        // Secara default axios akan throw untuk 4xx/5xx, jadi kondisi ini jarang tercapai
        return null;
      } catch (e: unknown) {
        if (axios.isAxiosError(e)) {
          const status = e.response?.status;
          const message = (e.response?.data as any)?.message ?? e.message;
          if (status === 400) {
            toast.warning(message ?? 'Gagal membuat Policy: Data tidak valid');
          } else {
            toast.error(`Gagal membuat Policy: ${message}`);
          }
          this.error = message;
        } else {
          this.error = e instanceof Error ? e.message : 'Unknown error';
          toast.error(`Gagal membuat Policy: ${this.error}`);
        }
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
        const updated = res.data.data;
        if (updated) {
          const idx = this.policies.findIndex(p => p.id === updated.id);
          if (idx !== -1) this.policies[idx] = updated;
          toast.success('Pembayaran policy berhasil');
          return updated;
        }
        toast.warning('Policy tidak ditemukan');
        return null;
      } catch (e: unknown) {
        if (axios.isAxiosError(e)) {
          const status = e.response?.status;
          const message = (e.response?.data as any)?.message ?? e.message;
          if (status === 400) {
            toast.warning(message ?? 'Gagal melakukan pembayaran policy');
          } else if (status === 404) {
            toast.warning('Policy tidak ditemukan');
          } else {
            toast.error(`Gagal melakukan pembayaran policy: ${message}`);
          }
          this.error = message;
        } else {
          this.error = e instanceof Error ? e.message : 'Unknown error';
          toast.error(`Gagal melakukan pembayaran policy: ${this.error}`);
        }
        return null;
      } finally {
        this.loading = false;
      }
    },
  },
});
