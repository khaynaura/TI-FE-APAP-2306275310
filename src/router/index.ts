import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import InsuranceView from '@/views/insurances/InsurancePlanList.vue'
import CreateInsuranceView from '@/views/insurances/CreateInsuranceView.vue'
import ReadInsuranceDetailView from '@/views/insurances/ReadInsuranceDetail.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView // Halaman dashboard [Image 11]
    },
    {
      path: '/insurance-plan',
      name: 'insurance-plan-list',
      component: InsuranceView
    },
    {
      path: '/insurance-plan/create',
      name: 'insurance-plan-create',
      component: CreateInsuranceView
    },
    {
      path: '/insurance-plan/:id',
      name: 'insurance-plan-detail',
      component: ReadInsuranceDetailView
    },
    // // Rute lain untuk Policy, Claim, dll. akan ditambahkan di sini
    // {
    //   path: '/policy',
    //   name: 'policy-list',
    //   component: () => import('../views/policy/PolicyList.vue')
    // },
    // {
    //   path: '/claim',
    //   name: 'claim-list',
    //   component: () => import('../views/claim/ClaimList.vue')
    // },
    // {
    //   path: '/statistics',
    //   name: 'statistics',
    //   component: () => import('../views/StatisticsView.vue')
    // }
  ]
})

export default router
