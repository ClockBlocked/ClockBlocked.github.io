import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/main.css'
import { initDB } from './db/init'

// Initialize IndexedDB
initDB().then(() => {
  console.log('Database initialized')
})

const app = createApp(App)
app.use(createPinia())
app.use(router)

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
  })
}

app.mount('#app')
