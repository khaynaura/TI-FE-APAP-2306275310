<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  id: string;
  label?: string | null;
  type?: string;
  name?: string;
  modelValue: string;
  placeholder?: string;
  min?: string;
  required?: boolean;
  disabled?: boolean; // Tambahkan prop disabled
  errorMessage?: string | null;
  validate?: (value: string) => string | null;
}>(), {
  type: 'text',
  modelValue: '',
  placeholder: '',
  required: false,
  disabled: false, // Default value false
  errorMessage: null,
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'blur', ev: FocusEvent): void
}>()

const touched = ref(false)

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target) emit('update:modelValue', target.value)
}

const handleBlur = (e: FocusEvent) => {
  touched.value = true
  emit('blur', e)
}

const computedError = computed(() => {
  if (props.errorMessage) return props.errorMessage
  const val = (props.modelValue ?? '').toString().trim()
  if (props.required && touched.value && val === '') return ''
  if (props.validate && touched.value) {
    const msg = props.validate(props.modelValue ?? '')
    if (msg) return msg
  }
  return null
})

const inputClasses = computed(() => {
  const base = 'rounded-md border px-3 py-2 text-gray-900 text-sm field-bold focus:outline-none'
  const normalBg = 'bg-white'
  const disabledBg = 'bg-gray-100 cursor-not-allowed'
  const ok = 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  const err = 'border-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500'
  const disabledBorder = 'border-gray-300'

  const bgClass = props.disabled ? disabledBg : normalBg
  const borderClass = props.disabled ? disabledBorder : (computedError.value ? err : ok)

  return [base, bgClass, borderClass].join(' ')
})

const formattedLabel = computed(() =>
  (props.label ?? '').replace(/\*/g, '<span class="text-red-600">*</span>')
)
</script>

<template>
  <div class="flex flex-col gap-1 w-full">
    <label
      :for="id"
      v-if="label"
      class="block text-sm text-gray-700 mb-1 title-bold"
      v-html="formattedLabel"
    />
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :name="name"
      :placeholder="placeholder"
      :min="min"
      :required="required"
      :disabled="disabled"
      :aria-invalid="!!computedError"
      :aria-describedby="computedError ? `${id}-error` : undefined"
      :class="inputClasses"
      @input="handleInput"
      @blur="handleBlur"
    />
    <p v-if="computedError" :id="`${id}-error`" class="text-xs text-red-600 mt-0.5">
      {{ computedError }}
    </p>
  </div>
</template>

<style scoped>
.section-bold { font-weight: 700; }
.field-bold { font-weight: 450; }
.title-bold { font-weight: 550; }
</style>
