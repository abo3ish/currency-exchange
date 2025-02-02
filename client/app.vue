<template>
  <NuxtPage />
</template>

<script setup>
useSeoMeta({
  htmlAttrs: {
    'data-theme': 'light'
  }
})
</script>

<style>
/* Remove the custom theme definition and only keep component styles */
.bg-gradient {
  background: linear-gradient(135deg, hsl(0 0% 100%), hsl(0 0% 98%));
}

.card {
  background: hsl(0 0% 100%);
  box-shadow: var(--shadow-md);
  border: 1px solid hsl(0 0% 98%);
}

.stats {
  background: hsl(0 0% 100%);
  border: 1px solid hsl(210 20% 98%);
}

/* Enhanced transitions */
.transition-all {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Card hover effects */
.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

/* Input styles */
.input-bordered {
  border-color: hsl(210 20% 90%);
}

.input-bordered:focus {
  border-color: hsl(var(--p));
  box-shadow: 0 0 0 1px hsl(var(--p) / 0.2);
}

/* Button styles */
.btn-primary {
  background: linear-gradient(to right, hsl(var(--p)), hsl(var(--pf)));
}

.btn-outline {
  border-width: 1.5px;
}
</style>