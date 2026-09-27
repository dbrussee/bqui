/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref } from 'vue';
import { appProspectStore } from '@/stores/ProspectStore'

// Reference to the actual native HTML element
const popRef = ref<HTMLDialogElement | null>(null);

export function useNewProspectPopup() {
  function openNewProspect() {
    popRef.value?.showModal()
  }
  function closeNewProspect() {
    popRef.value?.close()
  }
  async function saveNewProspect(data:any):Promise<void> {
    if (appProspectStore().prospWorking != null) return
    await appProspectStore().createProspect(data).then(() => {
      closeNewProspect()
    });
  }

  return {
    popRef,
    openNewProspect, closeNewProspect, saveNewProspect
  }
}
