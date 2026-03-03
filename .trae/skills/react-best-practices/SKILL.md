---
name: react-best-practices
description: Comprehensive React and Next.js performance optimization guide with 40+ rules for eliminating waterfalls, optimizing bundles, and improving rendering. Use when optimizing React apps, reviewing performance, or refactoring components.
---

# React Best Practices - Performance Optimization

Comprehensive performance optimization guide for React and Next.js applications with 40+ rules organized by impact level. Designed to help developers eliminate performance bottlenecks and follow best practices.

## When to use this skill

**Use React Best Practices when:**
- Optimizing React or Next.js application performance
- Reviewing code for performance improvements
- Refactoring existing components for better performance
- Implementing new features with performance in mind
- Debugging slow rendering or loading issues
- Reducing bundle size
- Eliminating request waterfalls

## Critical Priorities

1. **Defer await until needed**: Move awaits into branches where they're used.
2. **Use Promise.all()**: Parallelize independent async operations.
3. **Avoid barrel imports**: Import directly from source files.
4. **Dynamic imports**: Lazy-load heavy components.
5. **Strategic Suspense**: Stream content while showing layout.

## Common Patterns

### Parallel Data Fetching
```typescript
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments()
])
```

### Direct Imports
```tsx
// ❌ Loads entire library
import { Check } from 'lucide-react'

// ✅ Loads only what you need
import Check from 'lucide-react/dist/esm/icons/check'
```

### Dynamic Components
```tsx
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(
  () => import('./monaco-editor'),
  { ssr: false }
)
```

## Categories Overview

### 1. Eliminating Waterfalls (CRITICAL)
- Defer await until needed
- Dependency-based parallelization
- Promise.all() for independent operations
- Strategic Suspense boundaries

### 2. Bundle Size Optimization (CRITICAL)
- Avoid barrel file imports
- Conditional module loading
- Dynamic imports for heavy components

### 3. Server-Side Performance (HIGH)
- Cross-request LRU caching
- Minimize serialization at RSC boundaries
- Parallel data fetching with component composition
- Per-request deduplication with `React.cache()`

### 4. Re-render Optimization (MEDIUM)
- Defer state reads to usage point
- Extract to memoized components
- Narrow effect dependencies
- Use lazy state initialization
- Use transitions for non-urgent updates
