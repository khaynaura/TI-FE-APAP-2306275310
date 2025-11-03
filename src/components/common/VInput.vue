<script setup lang="ts">
withDefaults(defineProps<{
  id: string;
  label?: string | null;
  type?: string;
  name?: string;
  modelValue: string;
  placeholder?: string;
  min?: string;
}>(), {
  type: 'text',
  modelValue: '',
  placeholder: '',
});

const emit = defineEmits(['update:modelValue'])
const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target) {
    emit('update:modelValue', target.value);
  }
}
</script>

<template>
  <div class="flex flex-col gap-1 w-full">
    <label :for="id" v-if="label">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :name="name"
      :placeholder="placeholder"
      :min="min"
      class="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      @input="handleInput"
    />
  </div>
</template>
