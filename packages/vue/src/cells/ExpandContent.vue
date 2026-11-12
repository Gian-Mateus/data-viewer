<script setup lang="ts">
import { computed } from 'vue';
import { useToggle } from '@vueuse/core'; // Exemplo

const props = defineProps<{ content: string }>();
const [expand, toggle] = useToggle(false);

const displayedContent = computed(() => {
  // Se o texto for menor que o limite, exibe inteiro
  if (props.content.length <= 50) return props.content;

  // Se estiver expandido, mostra completo. Se não, corta.
  return expand.value ? props.content : props.content.slice(0, 50);
});
</script>

<template>
  <div>
    {{ displayedContent }}
    <button
      v-if="content.length > 50"
      class="text-primary underline cursor-pointer"
      @click.stop="toggle()"
    >
      <span>{{ expand ? '(menos)' : '(...)' }}</span>
    </button>
  </div>
</template>
