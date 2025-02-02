<template>
  <NuxtPage />
</template>

<script setup>
useSeoMeta({
  htmlAttrs: {
    'data-theme': 'professionalTheme'
  }
})
</script>

<style>
:root [data-theme="professionalTheme"] {
  /* Modern professional color palette */
  --p: 212 100% 45%;      /* Primary: Deep Blue */
  --pf: 212 100% 40%;     /* Primary Focus */
  --pc: 0 0% 100%;        /* Primary Content */
  
  --s: 200 65% 92%;       /* Secondary: Soft Blue */
  --sf: 200 65% 88%;      /* Secondary Focus */
  --sc: 212 100% 45%;     /* Secondary Content */
  
  --a: 152 60% 52%;       /* Accent: Mint Green */
  --af: 152 60% 48%;      /* Accent Focus */
  --ac: 0 0% 100%;        /* Accent Content */
  
  --n: 220 14% 24%;       /* Neutral */
  --nf: 220 14% 20%;      /* Neutral Focus */
  --nc: 0 0% 100%;        /* Neutral Content */
  
  --b1: 0 0% 100%;        /* Base-100: Pure White */
  --b2: 210 20% 98%;      /* Base-200: Soft Gray */
  --b3: 210 20% 96%;      /* Base-300: Light Gray */
  --bc: 220 14% 24%;      /* Base Content */

  /* Custom shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

/* Refined gradients */
.bg-gradient {
  background: linear-gradient(135deg, hsl(212 100% 97%), hsl(212 100% 94%));
}

.card {
  background: hsl(0 0% 100%);
  box-shadow: var(--shadow-md);
  border: 1px solid hsl(210 20% 98%);
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