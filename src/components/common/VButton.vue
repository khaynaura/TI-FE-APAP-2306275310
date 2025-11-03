<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  type?: 'submit' | 'button' | 'reset';
  // solid, outline, ghost, soft (chip), link
  variant?:
    | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'gray'
    | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-danger' | 'outline-warning' | 'outline-info' | 'outline-gray'
    | 'ghost-primary' | 'ghost-secondary' | 'ghost-success' | 'ghost-danger' | 'ghost-warning' | 'ghost-info' | 'ghost-gray'
    | 'soft-primary' | 'soft-success' | 'soft-warning' | 'soft-danger' | 'soft-info' | 'soft-gray'
    | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  pill?: boolean;      // rounded-full
  block?: boolean;     // w-full
  icon?: boolean;      // icon-only
  loading?: boolean;   // spinner
  disabled?: boolean;
}>();

const sizeClass = computed(() => {
  if (props.icon) {
    switch (props.size) {
      case 'xs': return 'h-7 w-7';
      case 'sm': return 'h-8 w-8';
      case 'lg': return 'h-11 w-11';
      default:   return 'h-10 w-10';
    }
  }
  switch (props.size) {
    case 'xs': return 'h-7 px-2 text-xs';
    case 'sm': return 'h-8 px-3 text-xs';
    case 'lg': return 'h-11 px-5 text-base';
    default:   return 'h-10 px-4 text-sm';
  }
});

const shapeClass = computed(() => props.pill ? 'rounded-full' : 'rounded-lg');

const variantClass = computed(() => {
  const base = 'inline-flex items-center gap-2 font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors duration-200';
  const disabled = 'disabled:opacity-50 disabled:cursor-not-allowed';
  const map: Record<string, string> = {
    // solid
    primary:  'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary:'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400',
    success:  'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    danger:   'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    warning:  'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-400',
    info:     'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500',
    gray:     'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    // outline
    'outline-primary':  'border border-blue-600 text-blue-700 hover:bg-blue-50 focus:ring-blue-400',
    'outline-secondary':'border border-gray-400 text-gray-700 hover:bg-gray-50 focus:ring-gray-300',
    'outline-success':  'border border-green-600 text-green-700 hover:bg-green-50 focus:ring-green-400',
    'outline-danger':   'border border-red-600 text-red-700 hover:bg-red-50 focus:ring-red-400',
    'outline-warning':  'border border-amber-500 text-amber-700 hover:bg-amber-50 focus:ring-amber-400',
    'outline-info':     'border border-sky-600 text-sky-700 hover:bg-sky-50 focus:ring-sky-400',
    'outline-gray':     'border border-gray-500 text-gray-700 hover:bg-gray-50 focus:ring-gray-400',
    // ghost
    'ghost-primary':  'text-blue-700 hover:bg-blue-50 focus:ring-blue-400',
    'ghost-secondary':'text-gray-700 hover:bg-gray-50 focus:ring-gray-300',
    'ghost-success':  'text-green-700 hover:bg-green-50 focus:ring-green-400',
    'ghost-danger':   'text-red-700 hover:bg-red-50 focus:ring-red-400',
    'ghost-warning':  'text-amber-700 hover:bg-amber-50 focus:ring-amber-400',
    'ghost-info':     'text-sky-700 hover:bg-sky-50 focus:ring-sky-400',
    'ghost-gray':     'text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
    // soft (chip)
    'soft-primary':  'rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-300',
    'soft-success':  'rounded-full bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-300',
    'soft-warning':  'rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 focus:ring-amber-300',
    'soft-danger':   'rounded-full bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-300',
    'soft-info':     'rounded-full bg-sky-100 text-sky-700 hover:bg-sky-200 focus:ring-sky-300',
    'soft-gray':     'rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300',
    // link
    link: 'p-0 h-auto text-blue-600 hover:underline focus:ring-transparent',
  };
  const cls = map[props.variant || 'primary'] || map.primary;
  return [base, disabled, cls].join(' ');
});

const finalClass = computed(() => {
  const parts = [variantClass.value];
  if (!(props.variant === 'link')) parts.push(sizeClass.value, shapeClass.value);
  if (props.block) parts.push('w-full justify-center');
  return parts.join(' ');
});
</script>

<template>
  <button
    :type="type || 'button'"
    :class="finalClass"
    :disabled="disabled || loading"
    :aria-busy="loading ? 'true' : 'false'"
  >
    <svg
      v-if="loading"
      class="animate-spin h-4 w-4 text-current"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"/>
    </svg>
    <slot />
  </button>
</template>
