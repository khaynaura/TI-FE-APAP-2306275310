import { defineStore } from 'pinia';
import axios from 'axios';
import { toast } from 'vue-sonner';
import type { CommonResponseInterface } from '@/interfaces/common.response.interface';
import type { OrderedPlanDetailResponse } from '@/interfaces/orderedplan.interface';
import { getApiErrorMessage } from '@/utils/api-error';

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
        const msg = getApiErrorMessage(e);
        this.error = msg;
        if (axios.isAxiosError(e) && e.response?.status === 404) {
          toast.warning(msg || 'Ordered Plan tidak ditemukan');
        } else {
          toast.error(msg); // tampilkan persis pesan backend
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
