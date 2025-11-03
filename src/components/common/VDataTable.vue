<script setup lang="ts" generic="T">
import { ref, computed } from 'vue';
import VButton from './VButton.vue';

// Ketik props generic
const props = defineProps<{
  items: T[];
  perPageOptions?: number[];
  tableTitle: string;
  headers?: string[];
  loading: boolean;
}>();

// Ketik slot agar parent menerima items: T[]
defineSlots<{
  header?: (props: object) => unknown;
  body?: (props: { items: T[] }) => unknown;
}>();

const emit = defineEmits<{
  (e: 'update:search', search: string): void;
}>();

const searchTerm = ref('');
const itemsPerPage = ref(props.perPageOptions ? props.perPageOptions[0] : 10);

const handleSearch = () => {
  emit('update:search', searchTerm.value);
};

// Logika sederhana untuk menampilkan status data
const displayMessage = computed(() => {
  if (props.loading) {
    return 'Memuat data...';
  }
  if (!props.items || props.items.length === 0) {
    return 'Tidak ada data yang ditemukan.';
  }
  return null;
});
</script>

<template>
  <div class="bg-white p-6 rounded-xl shadow-lg">
    <!-- Header Tabel dan Fitur Search Bar -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
      <h3 class="text-xl font-bold text-gray-800">{{ tableTitle }}</h3>

      <!-- Kontrol dan Search -->
      <div class="flex items-center gap-4 w-full md:w-auto">
        <div v-if="perPageOptions && perPageOptions.length > 1" class="flex items-center text-sm text-gray-600">
          <span class="mr-2">Tampilkan</span>
          <select v-model="itemsPerPage" class="p-1 border rounded-md focus:ring-blue-500 focus:border-blue-500">
            <option v-for="option in perPageOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
          <span class="ml-2">data per halaman</span>
        </div>

        <div class="relative w-full md:w-64">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Cari..."
            class="w-full pl-3 pr-10 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            @keyup.enter="handleSearch"
          />
          <VButton variant="link" class="absolute right-0 top-0 mt-2 mr-2 p-0 text-gray-400 hover:text-gray-600" @click="handleSearch">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </VButton>
        </div>
      </div>
    </div>

    <div class="overflow-x-auto border rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <slot name="header">
              <th v-for="header in headers" :key="header" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ header }}
              </th>
            </slot>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <slot name="body" :items="items">
          </slot>

          <tr v-if="displayMessage">
            <td :colspan="headers?.length || 1" class="px-6 py-4 text-center text-sm text-gray-500">
              {{ displayMessage }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!loading && items.length > 0" class="mt-4 flex justify-between items-center text-sm text-gray-600">
      <span>Menampilkan 1 sampai {{ itemsPerPage }} dari {{ items.length }} data</span>
    </div>
  </div>
</template>
