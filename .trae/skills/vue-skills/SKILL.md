---
name: vue-skills
description: Expert guidance for Vue 3 development (Composition API). Invoke when building Vue applications, managing state with Pinia, or optimizing component structure.
---

# Vue Skills - Best Practices

Specialized skills for AI agents to enhance their capabilities in Vue 3 development, derived from real-world issues and best practices.

## Core Best Practices

### 1. TypeScript & Tooling
- **Strict Template Checking**: Use `vue-tsc` with `strictTemplates` enabled.
- **Component Typing**: Properly extract and define component props using `defineProps<Props>()`.
- **Volar Integration**: Stay updated with the latest Volar/Vue Official extension features.
- **@vue-ignore**: Use directives to handle edge cases in templates when necessary.

### 2. Composition API Patterns
- **Script Setup**: Prefer `<script setup>` for more concise and performant code.
- **Reactivity Essentials**: Understanding when to use `ref()` vs `reactive()`.
- **Custom Composables**: Extracting logic into reusable `use...` functions.
- **Watchers & Effects**: Using `watch` and `watchEffect` correctly to avoid memory leaks.

### 3. State Management (Pinia)
- **Store Mocking**: Best practices for testing Pinia stores.
- **Setup Stores**: Using the function syntax for `defineStore` to leverage the Composition API.
- **HMR in SSR**: Handling Hot Module Replacement correctly in Server-Side Rendering environments.

### 4. Testing
- **Vitest**: Recommended testing framework for Vue 3 applications.
- **Vue Test Utils**: Standard library for component unit testing.

## Example: Type-Safe Component with Composition API

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  title: string
  initialCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialCount: 0
})

const emit = defineEmits<{
  (e: 'update', value: number): void
}>()

const count = ref(props.initialCount)
const doubleCount = computed(() => count.value * 2)

const increment = () => {
  count.value++
  emit('update', count.value)
}
</script>

<template>
  <div class="counter">
    <h1>{{ title }}</h1>
    <p>Count: {{ count }} (Double: {{ doubleCount }})</p>
    <button @click="increment">Increment</button>
  </div>
</template>
```

## Methodology
Every skill in this guide is verified through:
1. **Real-World Issue Collection**: Sourced from actual production pain points.
2. **Multi-Model Verification**: Tested across different LLMs to ensure effectiveness.
3. **Evidence-Based**: Rules are only kept if they significantly improve AI output quality.
