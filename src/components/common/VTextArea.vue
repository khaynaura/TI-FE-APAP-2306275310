<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  id: string;
  label?: string | null;
  name?: string;
  modelValue: string;
  placeholder?: string;
  required?: boolean;
  errorMessage?: string | null;
  validate?: (value: string) => string | null;
}>(), {
  modelValue: '',
  placeholder: '',
  required: false,
  errorMessage: null,
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'blur', ev: FocusEvent): void
}>()

const touched = ref(false)

const handleInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  if (target) emit('update:modelValue', target.value)
}

const handleBlur = (e: FocusEvent) => {
  touched.value = true
  emit('blur', e)
}

const computedError = computed(() => {
  if (props.errorMessage) return props.errorMessage
  const val = (props.modelValue ?? '').toString().trim()
  if (props.required && touched.value && val === '') return 
  if (props.validate && touched.value) {
    const msg = props.validate(props.modelValue ?? '')
    if (msg) return msg
  }
  return null
})

const textareaClasses = computed(() => {
  const base = 'rounded-md border px-3 py-2 bg-white text-gray-900 text-sm field-bold min-h-[100px] resize-y focus:outline-none'
  const ok = 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  const err = 'border-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500'
  return [base, computedError.value ? err : ok].join(' ')
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
    <textarea
      :id="id"
      :name="name"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :aria-invalid="!!computedError"
      :aria-describedby="computedError ? `${id}-error` : undefined"
      :class="textareaClasses"
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
