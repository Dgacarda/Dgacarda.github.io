<template>
    <transition name="toast">
        <div v-if="show" class="toast" role="status" aria-live="polite">
            <div class="toast__content">
                <div class="toast__title">{{ title }}</div>
                <div class="toast__msg">{{ message }}</div>
            </div>

            <button class="toast__close" @click="$emit('close')" aria-label="Закрыть">
                ✕
            </button>
        </div>
    </transition>
</template>

<script setup lang="ts">
defineProps<{
    show: boolean
    title: string
    message: string
}>()

defineEmits<{
    (e: 'close'): void
}>()
</script>
