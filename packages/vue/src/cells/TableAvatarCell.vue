<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { computed } from 'vue';
import { cn } from '../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export type TableAvatarSize = 'sm' | 'md' | 'lg';
export type TableAvatarShape = 'circle' | 'rounded';

export interface TableAvatarCellProps {
  src?: string | null;
  name?: string | null;
  subtitle?: string | null;
  size?: TableAvatarSize;
  shape?: TableAvatarShape;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<TableAvatarCellProps>(), {
  src: undefined,
  name: undefined,
  subtitle: undefined,
  size: 'md',
  shape: 'circle',
  class: undefined,
});

const sizeMap: Record<TableAvatarSize, { avatar: string; text: string; gap: string }> = {
  sm: {
    avatar: 'size-7 text-xs',
    text: 'text-xs',
    gap: 'gap-2',
  },
  md: {
    avatar: 'size-9 text-xs font-semibold',
    text: 'text-sm',
    gap: 'gap-2.5',
  },
  lg: {
    avatar: 'size-11 text-sm font-semibold',
    text: 'text-base',
    gap: 'gap-3',
  },
};

const shapeMap: Record<TableAvatarShape, string> = {
  circle: 'rounded-full',
  rounded: 'rounded-md',
};

const initials = computed<string>(() => {
  if (!props.name) return '';
  const parts = props.name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
});
</script>

<template>
  <div :class="cn('flex items-center min-w-0 max-w-full', sizeMap[props.size].gap, props.class)">
    <Avatar
      :class="cn(
        'shrink-0',
        sizeMap[props.size].avatar,
        shapeMap[props.shape],
      )"
    >
      <AvatarImage
        v-if="src"
        :src="src"
        :alt="name ?? 'Avatar'"
        class="object-cover"
      />
      <AvatarFallback :class="cn('uppercase font-medium text-muted-foreground', shapeMap[props.shape])">
        {{ initials || '?' }}
      </AvatarFallback>
    </Avatar>

    <!-- Nome e Subtítulo -->
    <div
      v-if="name || subtitle"
      class="flex flex-col min-w-0 overflow-hidden"
    >
      <span
        v-if="name"
        :class="cn('font-medium text-foreground truncate leading-tight', sizeMap[props.size].text)"
      >
        {{ name }}
      </span>
      <span
        v-if="subtitle"
        class="text-xs text-muted-foreground truncate leading-tight mt-0.5"
      >
        {{ subtitle }}
      </span>
    </div>
  </div>
</template>
