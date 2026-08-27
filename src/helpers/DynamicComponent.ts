/* eslint-disable @typescript-eslint/no-explicit-any */
import { createVNode, render, getCurrentInstance, type Component } from 'vue'

export function useDynamicComponent() {
  // Capture the current app context if called inside a setup() lifecycle
  const { appContext } = getCurrentInstance() || {}

  const mountComponent = (component:Component, props:any, targetElement:HTMLElement) => {
    // 1. Create the Virtual DOM node with optional props
    const vnode = createVNode(component, props)

    // 2. Inherit the application context (keeps stores, routers, etc. active)
    if (appContext) {
      vnode.appContext = appContext
    }

    // 3. Render the VNode into the target DOM container
    render(vnode, targetElement)

    // Return a cleanup method to manually destroy the component later
    const unmount = () => {
      render(null, targetElement)
    }

    return { unmount }
  }

  return { mountComponent }
}
