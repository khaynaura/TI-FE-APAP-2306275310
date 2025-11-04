import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import InsuranceView from '@/views/insurances/InsurancePlanView.vue'
import CreateInsuranceView from '@/views/insurances/CreateInsuranceView.vue'
import ReadInsuranceDetailView from '@/views/insurances/ReadInsuranceDetailView.vue'
import EditInsuranceView from '@/views/insurances/EditInsuranceView.vue'
import PolicyView from '@/views/policy/PolicyView.vue'
import CreatePolicyView from '@/views/policy/CreatePolicyView.vue'
import ReadPolicyDetailView from '@/views/policy/ReadPolicyDetailView.vue'
import ReadOrderedPlanDetail from '@/views/orderedplan/ReadOrderedPlanDetail.vue'
import CreateClaimView from '@/views/orderedplan/CreateClaimView.vue'
import ReadAllClaimView from '@/views/claim/ReadAllClaimView.vue'
import ProcessClaimView from '@/views/claim/ProcessClaimView.vue'
import StatisticsView from '@/views/statistics/StatisticsView.vue'

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
      name: 'insurance-plan-viewall',
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
    {
      path: '/insurance-plan/update/:id',
      name: 'insurance-plan-edit',
      component: EditInsuranceView
    },
    {
      path: '/policy',
      name: 'policy-viewall',
      component: PolicyView
    },
    {
      path: '/policy/create',
      name: 'policy-create',
      component: CreatePolicyView
    },
    {
      path: '/policy/:id',
      name: 'policy-detail',
      component: ReadPolicyDetailView
    },
    {
      path: '/ordered-plan/:id',
      name: 'ordered-plan-detail',
      component: ReadOrderedPlanDetail
    },
    {
      path: '/claim/add/:id',
      name: 'claim-add',
      component: CreateClaimView
    },
    {
      path: '/claim',
      name: 'claim-viewall',
      component: ReadAllClaimView
    },
    {
      path: '/claim/process/:id',
      name: 'claim-process',
      component: ProcessClaimView
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: StatisticsView
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
