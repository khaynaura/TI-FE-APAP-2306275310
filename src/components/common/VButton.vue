<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'outline-green' | 'outline-blue' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md'
})
</script>

<template>
  <button
    class="v-button"
    :class="[
      `v-button--${variant}`,
      `v-button--${size}`
    ]"
  >
    <slot></slot>
  </button>
</template>

<style scoped>
@reference "@/assets/main.css";

.v-button {
  @apply font-semibold rounded-lg transition-colors duration-200 inline-flex items-center justify-center;
}

/* Variants */
.v-button--primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.v-button--outline-green {
  @apply bg-green-500 text-white hover:bg-green-600;
}

.v-button--outline-blue {
  @apply bg-blue-500 text-white hover:bg-blue-600;
}

.v-button--secondary {
  @apply bg-gray-500 text-white hover:bg-gray-600;
}

.v-button--danger {
  @apply bg-red-600 text-white hover:bg-red-700;
}

/* Sizes */
.v-button--sm {
  @apply px-3 py-1 text-sm;
}

.v-button--md {
  @apply px-4 py-2 text-base;
}

.v-button--lg {
  @apply px-6 py-2 text-base;
}
</style>
