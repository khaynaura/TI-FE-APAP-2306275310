import { defineStore } from 'pinia';
import axios from 'axios';
import { toast } from 'vue-sonner';
import type { CommonResponseInterface } from '@/interfaces/common.response.interface';
import type { OrderedPlanDetailResponse } from '@/interfaces/orderedplan.interface';

const baseOrderedPlanUrl = `${import.meta.env.VITE_API_URL}/ordered-plan`;

export const useOrderedPlanStore = defineStore('orderedPlan', {
  state: () => ({
    detail: null as OrderedPlanDetailResponse | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async getOrderedPlanById(id: string): Promise<OrderedPlanDetailResponse | null> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.get<CommonResponseInterface<OrderedPlanDetailResponse>>(
          `${baseOrderedPlanUrl}/${id}`
        );
        this.detail = res.data.data ?? null;
        if (this.detail) {
          toast.success('Detail Ordered Plan dimuat');
        } else {
          toast.warning('Ordered Plan tidak ditemukan');
        }
        return this.detail;
      } catch (e: unknown) {
        if (axios.isAxiosError(e)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const message = (e.response?.data as any)?.message ?? e.message;
          this.error = message;
          if (e.response?.status === 404) {
            toast.warning(message || 'Ordered Plan tidak ditemukan');
          } else {
            toast.error(`Gagal memuat Ordered Plan: ${message}`);
          }
        } else {
          this.error = e instanceof Error ? e.message : 'Unknown error';
          toast.error(`Gagal memuat Ordered Plan: ${this.error}`);
        }
        this.detail = null;
        return null;
      } finally {
        this.loading = false;
      }
    },

    reset() {
      this.detail = null;
      this.loading = false;
      this.error = null;
    },
  },
});
