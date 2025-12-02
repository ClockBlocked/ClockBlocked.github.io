<template>
  <div id="app" class="bg-[#0d1117] text-[#c9d1d9] min-h-screen">
    <ProgressBar v-if="isLoading" />
    <AppHeader />
    <main class="container mx-auto px-4 py-6">
      <RouterView v-slot="{ Component }">
        <Suspense>
          <template #default>
            <component :is="Component" />
          </template>
          <template #fallback>
            <LoadingSpinner />
          </template>
        </Suspense>
      </RouterView>
    </main>
    <AppFooter />
    <ToastNotifications />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import ProgressBar from './components/ui/ProgressBar.vue'
import LoadingSpinner from './components/ui/LoadingSpinner.vue'
import ToastNotifications from './components/ui/ToastNotifications.vue'
import { useUIStore } from './stores/ui'

const uiStore = useUIStore()
const isLoading = ref(true)

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})
</script>
