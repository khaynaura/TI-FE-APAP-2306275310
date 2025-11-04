<template>
  <div class="flex flex-col">
    <label class="block text-sm font-bold text-gray-700 mb-1 title-bold">
      {{ label }}
    </label>
    <div :class="valueClasses">
      <slot>
        {{ display }}
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { format as formatDate } from 'date-fns'

type Variant = 'neutral' | 'success' | 'info'

const props = withDefaults(defineProps<{
  label: string
  value?: string | number | Date | null
  placeholder?: string
  variant?: Variant
  format?: 'text' | 'currency' | 'date'
  dateFormat?: string
  currency?: string
  locale?: string
  multiline?: boolean
  valueClass?: string
}>(), {
  placeholder: '-',
  variant: 'neutral',
  format: 'text',
  dateFormat: "dd MMMM yyyy 'pukul' HH:mm",
  currency: 'IDR',
  locale: 'id-ID',
  multiline: false,
  valueClass: ''
})

const display = computed(() => {
  const v = props.value
  const hasValue = v !== null && v !== undefined && !(typeof v === 'string' && v.trim() === '')
  if (!hasValue) return props.placeholder

  switch (props.format) {
    case 'currency': {
      const num = typeof v === 'number' ? v : Number(v)
      if (Number.isNaN(num)) return props.placeholder
      return new Intl.NumberFormat(props.locale, { style: 'currency', currency: props.currency }).format(num)
    }
    case 'date': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = v instanceof Date ? v : new Date(v as any)
      if (isNaN(d.getTime())) return props.placeholder
      return formatDate(d, props.dateFormat)
    }
    default:
      return String(v)
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'border border-green-200 bg-green-50 text-green-800 section-bold'
    case 'info':
      return 'border border-blue-200 bg-blue-50 text-blue-800 section-bold'
    default:
      return 'border border-gray-300 bg-gray-50 text-gray-900 field-bold'
  }
})

const valueClasses = computed(() => {
  const base = 'px-3 py-2 rounded-md text-sm'
  const multi = props.multiline ? 'min-h-[100px] whitespace-pre-wrap' : ''
  return [base, variantClasses.value, multi, props.valueClass].filter(Boolean).join(' ')
})
</script>

<style scoped>

.section-bold {
  font-weight: 700;
}

.field-bold {
  font-weight: 450;
}

.title-bold {
  font-weight: 550;
}

.custom-margin {
  margin-top: 20px;
  margin-bottom: 20px;
}

.custom-margin2 {
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
