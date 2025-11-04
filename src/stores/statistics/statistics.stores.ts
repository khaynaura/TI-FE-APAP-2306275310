import { defineStore } from 'pinia'
import axios from 'axios'
import { toast } from 'vue-sonner'
import type { CommonResponseInterface } from '@/interfaces/common.response.interface'
import type { HomeSummary, ChartData } from '@/interfaces/statistics.interafce'

const baseStatisticsUrl = `${import.meta.env.VITE_API_URL}/statistics`

export const useStatisticsStore = defineStore('statistics', {
    state: () => ({
        summary: null as HomeSummary | null,
        loading: false,
        error: null as string | null,
        chartDataCache: {} as Record<string, ChartData>,
        chartLoading: false,
        chartError: null as string | null,
    }),

    actions: {
        async fetchHomeSummary(force = false): Promise<HomeSummary | null> {
            if (this.summary && !this.error && !force) return this.summary

            this.loading = true
            this.error = null

            try {
                const response = await axios.get<CommonResponseInterface<HomeSummary>>(
                    `${baseStatisticsUrl}/summary`
                )

                this.summary = response.data.data

                if (this.summary) {
                    toast.success('Statistik Beranda berhasil dimuat')
                } else {
                    toast.warning('Data statistik kosong')
                }

                return this.summary
            } catch (err: unknown) {
                let msg = 'Unknown error'

                if (axios.isAxiosError(err)) {
                    const resp = err.response?.data as Partial<CommonResponseInterface<unknown>> | undefined
                    msg = (resp?.message as string) ?? err.message ?? msg
                } else if (err instanceof Error) {
                    msg = err.message
                }

                this.error = msg
                this.summary = null
                toast.error(`Error saat memuat statistik: ${this.error}`)
                return null
            } finally {
                this.loading = false
            }
        },


        async fetchChartData(
          period: number,
          service: string,
          force = false
      ): Promise<ChartData | null> {
          const key = `${service}::${period}`
          if (this.chartDataCache[key] && !this.chartError && !force) {
              return this.chartDataCache[key]
          }

          this.chartLoading = true
          this.chartError = null

          try {
              const response = await axios.get<CommonResponseInterface<ChartData>>(
                  `${baseStatisticsUrl}/chart`,
                  { params: { period, service } }
              )

              const data = response.data.data

              if (data) {
                  this.chartDataCache[key] = data
                  toast.success('Data chart berhasil dimuat')
                  return data
              } else {
                  toast.warning('Data chart kosong')
                  return null
              }
          } catch (err: unknown) {
              let msg = 'Unknown error'

              if (axios.isAxiosError(err)) {
                  const resp = err.response?.data as Partial<CommonResponseInterface<unknown>> | undefined
                  msg = (resp?.message as string) ?? err.message ?? msg
              } else if (err instanceof Error) {
                  msg = err.message
              }

              this.chartError = msg
              toast.error(`Error saat memuat data chart: ${this.chartError}`)
              return null
          } finally {
              this.chartLoading = false
          }
      },
    },
})
