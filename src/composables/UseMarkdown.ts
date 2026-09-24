// useMarkdown.ts
import { computed, isRef, type Ref } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

export function useMarkdown(source: string | Ref<string>) {
  const htmlContent = computed(() => {
    // Handle both raw strings and reactive refs
    const rawMarkdown = isRef(source) ? source.value : source

    // Parse markdown to HTML
    const rawHtml = marked.parse(rawMarkdown, { async: false }) as string

    // Sanitize to prevent XSS attacks
    return DOMPurify.sanitize(rawHtml)
  })

  return {
    htmlContent
  }
}
