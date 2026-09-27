import { ref } from 'vue';
import { appProspectStore } from '@/stores/ProspectStore';

// Reference to the actual native HTML element
const popRef = ref<HTMLDialogElement | null>(null);

export function useSearchProspectPopup() {
  function openSearch() {
    popRef.value?.showModal()
  }
  function closeSearch() {
    popRef.value?.close()
  }
  async function loadProspect(pid:string):Promise<void> {
    appProspectStore().getProspect(pid, true)
    closeSearch()
  }

  return {
    popRef,
    openSearch, closeSearch,
    loadProspect
  }
}
