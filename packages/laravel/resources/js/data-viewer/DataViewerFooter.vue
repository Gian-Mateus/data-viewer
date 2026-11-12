<script setup lang="ts">
import { computed } from 'vue';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Paginated } from './types';
import { useLabels } from './config';

const labels = useLabels();

const props = defineProps<{
  pagination: Paginated<any>;
  shown: number;
  perPageOptions: number[];
  loading: boolean;
}>();

const emit = defineEmits<{
  page: [page: number];
  perPage: [perPage: number];
  loadMore: [];
}>();

// Se o usuário já carregou mais registros acumulados na tela além da página inicial,
// não faz sentido exibir o seletor "por página", pois a lista está em modo append contínuo.
const isAppended = computed(() => props.shown > props.pagination.per_page);
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4 text-sm">
    <div class="flex items-center gap-4 text-muted-foreground">
      <span>{{ labels.shown(shown, pagination.total) }}</span>

      <!-- Seletor de quantidade por página: ocultado quando a lista está em modo infinito/acumulado -->
      <div
        v-if="!isAppended"
        class="flex items-center gap-2"
      >
        <span class="text-sm">{{ labels.perPage }}</span>
        <Select
          :model-value="pagination.per_page"
          @update:model-value="(value) => emit('perPage', Number(value))"
        >
          <SelectTrigger
            size="sm"
            class="h-8 w-20"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="option in perPageOptions"
              :key="option"
              :value="option"
            >
              {{ option }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Botão carregar mais: exibido apenas se houver próximas páginas -->
    <Button
      v-if="pagination.current_page < pagination.last_page"
      variant="outline"
      size="sm"
      :disabled="loading"
      @click="emit('loadMore')"
    >
      {{ labels.loadMore }}
    </Button>

    <Pagination
      v-slot="{ page }"
      :page="pagination.current_page"
      :items-per-page="pagination.per_page"
      :total="pagination.total"
      :sibling-count="1"
      show-edges
      class="m-0 w-auto"
      @update:page="(page) => emit('page', page)"
    >
      <PaginationContent v-slot="{ items }">
        <PaginationPrevious />
        <template
          v-for="(item, index) in items"
          :key="index"
        >
          <PaginationItem
            v-if="item.type === 'page'"
            :value="item.value"
            :is-active="item.value === page"
          >
            {{ item.value }}
          </PaginationItem>
          <PaginationEllipsis
            v-else
            :index="index"
          />
        </template>
        <PaginationNext />
      </PaginationContent>
    </Pagination>
  </div>
</template>
