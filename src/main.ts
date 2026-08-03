import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'


const app = createApp(App)
app.config.globalProperties.$ts = (d: string) => {
  if (!d) return ""
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: 'numeric',
    // fractionalSecondDigits: 3,
  }).format(new Date(d).getTime())
};
app.use(createPinia())
app.mount('#app')

