<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { computed, ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { Loader2, Search } from '@lucide/vue';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '.';

const props = withDefaults(
  defineProps<{
    modelValue?: any;
    options?: any[];
    valueKey?: string;
    labelKey?: string;
    searchable?: boolean;
    endpoint?: string;
    excludeValues?: Array<string | number>;
    multiple?: boolean;
    disabled?: boolean;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    class?: HTMLAttributes['class'];
  }>(),
  {
    options: () => [],
    valueKey: 'value',
    labelKey: 'label',
    searchable: true,
    excludeValues: () => [],
    multiple: false,
    disabled: false,
    placeholder: 'Selecione...',
    searchPlaceholder: 'Pesquisar...',
    emptyText: 'Nenhum resultado encontrado.',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: any];
  select: [item: any];
  results: [items: any[]];
}>();

const searchQuery = ref('');
const isLoading = ref(false);
const remoteItems = ref<any[]>([]);

const getVal = (item: any): string => String(item?.[props.valueKey] ?? item?.value ?? item?.ulid ?? item?.id ?? '');
const getLabel = (item: any): string => String(item?.[props.labelKey] ?? item?.label ?? item?.name ?? '');

const fetchEndpoint = async (search: string) => {
  if (!props.endpoint) return;
  isLoading.value = true;

  try {
    const url = new URL(props.endpoint, window.location.origin);
    if (search.trim()) {
      url.searchParams.set('search', search.trim());
    }

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    });

    if (res.ok) {
      const json = await res.json();
      const data = Array.isArray(json) ? json : (json.data ?? []);
      remoteItems.value = data;
      emit('results', data);
    }
  } finally {
    isLoading.value = false;
  }
};

const debouncedFetch = useDebounceFn((q: string) => fetchEndpoint(q), 300);

watch(searchQuery, (q) => {
  if (props.endpoint) {
    debouncedFetch(q);
  }
});

const allItems = computed(() => {
  const excluded = new Set((props.excludeValues ?? []).map(String));
  const source = props.endpoint && remoteItems.value.length > 0
    ? [...remoteItems.value, ...props.options.filter(o => !remoteItems.value.some(r => getVal(r) === getVal(o)))]
    : props.options;

  return source.filter(item => !excluded.has(getVal(item)));
});

const matchesSearch = (item: any): boolean => {
  if (props.endpoint || !searchQuery.value.trim()) return true;
  const q = searchQuery.value.trim().toLowerCase();
  const labelMatch = getLabel(item).toLowerCase().includes(q);
  const emailMatch = typeof item?.email === 'string' && item.email.toLowerCase().includes(q);
  return labelMatch || emailMatch;
};

const hasVisibleItems = computed(() => allItems.value.some(matchesSearch));

const onOpenChange = (open: boolean) => {
  if (!open) {
    searchQuery.value = '';
  } else if (props.endpoint && remoteItems.value.length === 0) {
    fetchEndpoint('');
  }
};

const onValueChange = (val: any) => {
  emit('update:modelValue', val);
  if (!props.multiple) {
    const found = allItems.value.find(item => getVal(item) === String(val));
    if (found) emit('select', found);
  }
};
</script>

<template>
  <Select
    :model-value="modelValue"
    :multiple="multiple"
    :disabled="disabled"
    @update:model-value="onValueChange"
    @update:open="onOpenChange"
  >
    <SelectTrigger :class="cn('w-full', props.class)">
      <SelectValue :placeholder="placeholder" />
    </SelectTrigger>

    <SelectContent>
      <div
        v-if="searchable || endpoint"
        class="sticky top-0 z-10 flex items-center gap-2 border-b bg-popover px-2.5 py-2"
        @keydown.stop
      >
        <Search class="size-4 shrink-0 text-muted-foreground" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="searchPlaceholder"
          class="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        >
        <Loader2
          v-if="isLoading"
          class="size-3.5 shrink-0 animate-spin text-muted-foreground"
        />
      </div>

      <SelectItem
        v-for="item in allItems"
        v-show="matchesSearch(item)"
        :key="getVal(item)"
        :value="getVal(item)"
      >
        <slot
          name="item"
          :item="item"
        >
          {{ getLabel(item) }}
        </slot>
      </SelectItem>

      <div
        v-if="!isLoading && !hasVisibleItems"
        class="py-6 text-center text-xs text-muted-foreground"
      >
        {{ emptyText }}
      </div>
    </SelectContent>
  </Select>
</template>
