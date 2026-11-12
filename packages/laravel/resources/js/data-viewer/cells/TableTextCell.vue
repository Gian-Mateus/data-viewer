<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue';
import { computed, ref } from 'vue';
import { Check, Copy } from '@lucide/vue';
import { toast } from 'vue-sonner';
import { cn } from '@/lib/utils';
import { useLabels } from '../config';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface TableTextCellProps {
  value?: string | number | null;
  description?: string | null;
  descriptionAbove?: string | null;
  clamp?: number;
  expandable?: boolean;
  copyable?: boolean;
  prefix?: string;
  suffix?: string;
  icon?: Component | object | string;
  tooltip?: string;
  class?: HTMLAttributes['class'];
}

const labels = useLabels();

const props = withDefaults(defineProps<TableTextCellProps>(), {
  value: undefined,
  description: undefined,
  descriptionAbove: undefined,
  clamp: undefined,
  expandable: false,
  copyable: false,
  prefix: undefined,
  suffix: undefined,
  icon: undefined,
  tooltip: undefined,
  class: undefined,
});

const isExpanded = ref(false);
const copied = ref(false);

const hasValue = computed(() => {
  return props.value !== null && props.value !== undefined && props.value !== '';
});

const displayValue = computed(() => {
    if (!hasValue.value) return labels.noValue;

    let value = String(props.value);

    if (!clamp.value) return value;
    if (value.length <= clamp.value || clamp.value == 0) return value;

    return value.slice(0, clamp.value);
});

const clamp = computed(() => {
  if (!props.clamp || isExpanded.value) return 0;
  const map: Record<number, number> = {
    1: 50,
    2: 100,
    3: 150,
    4: 200,
    5: 250,
    6: 300,
  };
  return map[props.clamp] ?? 50;
});

const handleCopy = async () => {
  if (!hasValue.value) return;

  try {
    await navigator.clipboard.writeText(String(props.value));
    copied.value = true;
    toast.success(labels.copied);
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    toast.error(labels.copyError);
  }
};
</script>

<template>
  <div :class="cn('flex flex-col min-w-0 max-w-full text-sm leading-normal', props.class)">
    <!-- Subtítulo acima -->
    <span
      v-if="descriptionAbove"
      class="text-xs text-muted-foreground truncate leading-tight mb-0.5"
    >
      {{ descriptionAbove }}
    </span>

    <!-- Conteúdo principal -->
    <div class="flex items-center min-w-0">
      <!-- Ícone à esquerda -->
      <component
        :is="icon"
        v-if="icon"
        class="size-4 shrink-0 text-muted-foreground"
      />

      <!-- Prefixo -->
      <span
        v-if="prefix && hasValue"
        class="text-muted-foreground text-xs shrink-0 select-none"
      >
        {{ prefix }}
      </span>

      <!-- Texto com Tooltip opcional -->
      <TooltipProvider
        v-if="tooltip && hasValue"
        :delay-duration="200"
      >
        <Tooltip>
          <TooltipTrigger as-child>
            <span
              :class="cn(
                'min-w-0 wrap-break-word font-normal text-foreground',
                !hasValue && 'text-muted-foreground',
              )"
            >
              {{ displayValue }}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{{ tooltip }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <!-- Texto direto sem tooltip -->
      <span
        v-else
        :class="cn(
          'min-w-0 wrap-break-word font-normal text-foreground',
          !hasValue && 'text-muted-foreground',
        )"
      >
        <slot>{{ displayValue }}</slot>

        <!-- Botão expandir/recolher -->
        <button
          v-if="expandable && hasValue"
          type="button"
          class="shrink-0 text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded px-0.5"
          @click.stop="isExpanded = !isExpanded"
        >
          {{ isExpanded ? labels.collapse : '...' }}
        </button>
      </span>

      <!-- Sufixo -->
      <span
        v-if="suffix && hasValue"
        class="text-muted-foreground text-xs shrink-0 select-none"
      >
        {{ suffix }}
      </span>


      <!-- Botão discreto de copiar -->
      <button
        v-if="copyable && hasValue"
        type="button"
        class="shrink-0 inline-flex size-5 items-center justify-center rounded text-muted-foreground opacity-60 transition-opacity hover:opacity-100 hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        :title="labels.copy"
        @click.stop="handleCopy"
      >
        <Check
          v-if="copied"
          class="size-3 text-emerald-500"
        />
        <Copy
          v-else
          class="size-3"
        />
      </button>
    </div>

    <!-- Subtítulo abaixo -->
    <span
      v-if="description"
      class="text-xs text-muted-foreground truncate leading-tight mt-0.5"
    >
      {{ description }}
    </span>
  </div>
</template>
