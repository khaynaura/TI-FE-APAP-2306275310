import { defineStore } from 'pinia';
import axios from 'axios';
import { toast } from 'vue-sonner';
import type { CommonResponseInterface } from '@/interfaces/common.response.interface';
import type {
  ClaimSummaryResponse,
  ClaimDetailResponse,
  CreateClaimRequest,
  ProcessClaimRequest,
} from '@/interfaces/claim.interface';
import { getApiErrorMessage } from '@/utils/api-error';

const baseClaimUrl = `${import.meta.env.VITE_API_URL}/claim`;

export const useClaimStore = defineStore('claim', {
  state: () => ({
    list: [] as ClaimSummaryResponse[],
    detail: null as ClaimDetailResponse | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchAllFiltered(params?: { status?: string; planId?: string }): Promise<ClaimSummaryResponse[]> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.get<CommonResponseInterface<ClaimSummaryResponse[]>>(baseClaimUrl, {
          params: {
            status: params?.status?.trim() || undefined,
            planId: params?.planId?.trim() || undefined,
          },
        });
        this.list = res.data.data ?? [];
        if (this.list.length === 0) {
          toast.warning('Tidak ada claim sesuai filter');
        } else {
          toast.success('Data Claim dimuat');
        }
        return this.list;
      } catch (e: unknown) {
        const msg = getApiErrorMessage(e);
        this.error = msg;
        toast.error(msg);
        return [];
      } finally {
        this.loading = false;
      }
    },

    async getById(id: string): Promise<ClaimDetailResponse | null> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.get<CommonResponseInterface<ClaimDetailResponse>>(`${baseClaimUrl}/${id}`);
        this.detail = res.data.data ?? null;
        if (this.detail) {
          toast.success('Detail Claim dimuat');
        } else {
          toast.warning('Claim tidak ditemukan');
        }
        return this.detail;
      } catch (e: unknown) {
        const msg = getApiErrorMessage(e);
        this.error = msg;
        if (axios.isAxiosError(e) && e.response?.status === 404) {
          toast.warning(msg || 'Claim tidak ditemukan');
        } else {
          toast.error(msg);
        }
        this.detail = null;
        return null;
      } finally {
        this.loading = false;
      }
    },

    async submitClaim(orderedPlanId: string, payload: CreateClaimRequest): Promise<ClaimDetailResponse | null> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.post<CommonResponseInterface<ClaimDetailResponse>>(
          `${baseClaimUrl}/submit/${orderedPlanId}`,
          payload
        );
        if (res.status === 201) {
          this.detail = res.data.data ?? null;
          toast.success('Claim berhasil diajukan');
          return this.detail;
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

    async processClaim(claimId: string, payload: ProcessClaimRequest): Promise<ClaimDetailResponse | null> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.put<CommonResponseInterface<ClaimDetailResponse>>(
          `${baseClaimUrl}/process/${claimId}`,
          payload
        );
        if (res.status === 200) {
          this.detail = res.data.data ?? null;
          toast.success('Claim berhasil diproses');
          return this.detail;
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

    reset() {
      this.list = [];
      this.detail = null;
      this.loading = false;
      this.error = null;
    },
  },
});
