<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

declare global {
  interface Window {
    __theme?: {
      getTheme: () => 'dark' | 'light' | string
      setTheme: (theme: 'dark' | 'light') => void
    }
  }
}

const isDark = ref(true)

const syncTheme = () => {
  isDark.value = document.documentElement.classList.contains('dark')
}

onMounted(() => {
  syncTheme()
  window.addEventListener('theme-change', syncTheme)
  document.addEventListener('astro:after-swap', syncTheme)
})

onBeforeUnmount(() => {
  window.removeEventListener('theme-change', syncTheme)
  document.removeEventListener('astro:after-swap', syncTheme)
})

const toggleTheme = () => {
  const nextTheme = isDark.value ? 'light' : 'dark'

  if (window.__theme) {
    window.__theme.setTheme(nextTheme)
  } else {
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
    localStorage.setItem('theme', nextTheme)
  }

  isDark.value = nextTheme === 'dark'
}
</script>

<template>
  <button
    @click="toggleTheme"
    class="theme-toggle fixed bottom-6 right-6 p-3 rounded-full shadow-lg z-50"
    :style="{
      backgroundColor: 'var(--c-bg-soft)',
      border: '1px solid var(--c-border)',
      color: isDark ? '#fbbf24' : '#6b7280'
    }"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <svg
      v-if="isDark"
      class="w-5 h-5"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fill-rule="evenodd"
        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
        clip-rule="evenodd"
      />
    </svg>
    <svg
      v-else
      class="w-5 h-5"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
      />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  transition:
    transform var(--motion-duration-base) var(--motion-ease-pop),
    background-color var(--motion-duration-base) var(--motion-ease),
    border-color var(--motion-duration-base) var(--motion-ease),
    color var(--motion-duration-base) var(--motion-ease),
    box-shadow var(--motion-duration-base) var(--motion-ease);
}

.theme-toggle:hover {
  transform: translateY(-4px) rotate(10deg) scale(1.06);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14), 0 0 22px var(--motion-glow);
}
</style>
