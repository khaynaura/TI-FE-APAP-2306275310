import { defineStore } from 'pinia';
import axios from 'axios';
import { toast } from 'vue-sonner';
import type { InsurancePlan, InsurancePlanRequest } from '@/interfaces/insurances.interface';
import type { CommonResponseInterface } from '@/interfaces/common.response.interface';
import { getApiErrorMessage } from '@/utils/api-error';

const baseInsurancePlanUrl = `${import.meta.env.VITE_API_URL}/insurance-plan`;

export const useInsurancePlanStore = defineStore('insurancePlan', {
  state: () => ({
    plans: [] as InsurancePlan[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchPlans(search?: string): Promise<InsurancePlan[]> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.get<CommonResponseInterface<InsurancePlan[]>>(baseInsurancePlanUrl, {
          params: search?.trim() ? { search: search.trim() } : undefined,
        });
        this.plans = res.data.data ?? [];
        const isSearch = !!search?.trim();
        if (this.plans.length === 0) {
          toast.warning(isSearch ? 'Tidak ada hasil pencarian' : 'Data Insurance Plan kosong');
        } else {
          toast.success(isSearch ? 'Hasil pencarian Insurance Plan dimuat' : 'Data Insurance Plan dimuat');
        }
        return this.plans;
      } catch (e) {
        const msg = getApiErrorMessage(e);
        this.error = msg;
        toast.error(`Gagal memuat Insurance Plan${search ? ` (search="${search}")` : ''}: ${msg}`);
        return [];
      } finally {
        this.loading = false;
      }
    },

    async getPlanById(id: string): Promise<InsurancePlan | null> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.get<CommonResponseInterface<InsurancePlan>>(`${baseInsurancePlanUrl}/${id}`);
        return res.data.data ?? null;
      } catch (e) {
        const msg = getApiErrorMessage(e);
        this.error = msg;
        toast.error(`Gagal memuat plan: ${msg}`);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async createPlan(payload: InsurancePlanRequest): Promise<InsurancePlan | null> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.post<CommonResponseInterface<InsurancePlan>>(
          `${baseInsurancePlanUrl}/create`,
          payload
        );
        if (res.status === 201) {
          const created = res.data.data;
          this.plans.push(created);
          toast.success('Insurance Plan berhasil dibuat');
          return created;
        }
        return null;
      } catch (e) {
        const msg = getApiErrorMessage(e);
        this.error = msg;
        toast.error(msg);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async updatePlan(payload: InsurancePlanRequest): Promise<InsurancePlan | null> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.put<CommonResponseInterface<InsurancePlan>>(
          `${baseInsurancePlanUrl}/update`,
          payload
        );
        if (res.status === 200) {
          const updated = res.data.data;
          const idx = this.plans.findIndex(p => p.id === updated.id);
          if (idx !== -1) this.plans[idx] = updated;
          toast.success('Insurance Plan berhasil diperbarui');
          return updated;
        }
        return null;
      } catch (e) {
        const msg = getApiErrorMessage(e);
        this.error = msg;
        toast.error(msg);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async deletePlan(id: string): Promise<boolean> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.delete<CommonResponseInterface<InsurancePlan>>(
          `${baseInsurancePlanUrl}/delete/${id}`
        );
        if (res.status === 200) {
          await this.fetchPlans();
          toast.success('Insurance Plan berhasil dihapus');
          return true;
        }
        return false;
      } catch (e) {
        const msg = getApiErrorMessage(e);
        this.error = msg;
        toast.error(msg);
        return false;
      } finally {
        this.loading = false;
      }
    },

    async fetchPlansByService(service: string): Promise<InsurancePlan[]> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.get<CommonResponseInterface<InsurancePlan[]>>(
          `${baseInsurancePlanUrl}/by-service`,
          { params: { service } }
        );
        this.plans = res.data.data ?? [];
        if (this.plans.length === 0) {
          toast.warning(`Tidak ada plan untuk layanan ${service}`);
        } else {
          toast.success(`Plan untuk layanan ${service} dimuat`);
        }
        return this.plans;
      } catch (e: unknown) {
        const msg = getApiErrorMessage(e);
        this.error = msg;
        toast.error(`Gagal memuat plan by service: ${msg}`);
        return [];
      } finally {
        this.loading = false;
      }
    },

  },
});
