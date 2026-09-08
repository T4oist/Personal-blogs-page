<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
declare global { interface Window { __theme?: { getTheme: () => string; setTheme: (theme: 'dark' | 'light') => void } } }
const isDark = ref(false);
const sync = () => { isDark.value = document.documentElement.classList.contains('dark'); };
const toggle = () => window.__theme?.setTheme(isDark.value ? 'light' : 'dark');
onMounted(() => { sync(); window.addEventListener('theme-change', sync); });
onBeforeUnmount(() => window.removeEventListener('theme-change', sync));
</script>
<template>
  <button class="icon-button theme-toggle" @click="toggle" :aria-label="isDark ? '切换浅色主题' : '切换深色主题'" :title="isDark ? '切换浅色主题' : '切换深色主题'"><span class="contrast-symbol" aria-hidden="true"></span></button>
</template>
