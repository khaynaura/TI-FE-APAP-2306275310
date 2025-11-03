<script setup lang="ts">
withDefaults(defineProps<{
  id: string;
  label?: string | null;
  name?: string;
  modelValue: string;
  placeholder?: string;
}>(), {
  modelValue: '',
  placeholder: '',
});

const emit = defineEmits(['update:modelValue'])
const handleInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  if (target) {
    emit('update:modelValue', target.value);
  }
}
</script>

<template>
  <div class="flex flex-col gap-1 w-full">
    <label :for="id" v-if="label">{{ label }}</label>
    <textarea
      :id="id"
      :name="name"
      :value="modelValue"
      :placeholder="placeholder"
      class="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-y"
      @input="handleInput"
    />
  </div>
</template>
