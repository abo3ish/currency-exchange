<template>
  <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full">
    <div class="v-select-container" :class="{ 'is-source': !readonly }">
      <v-select
        v-model="modelCurrency"
        :options="currencyOptions"
        :searchable="true"
        :clearable="false"
        class="style-chooser w-full sm:flex-1 min-w-[200px]"
        :class="{ 'source-select': !readonly, 'target-select': readonly }"
        :get-option-label="(option) => `${getFlag(option.code)} ${option.code} - ${option.name}`"
      >
        <template #option="{ code, name }">
          <span>{{ getFlag(code) }} {{ code }} - {{ name }}</span>
        </template>
      </v-select>
    </div>
    <div class="flex gap-2 items-center w-full sm:flex-1 relative z-10">
      <input 
        type="number"
        v-model="modelAmount"
        @input="$emit('amountChange')"
        class="input input-bordered flex-1 bg-base-100"
        :placeholder="placeholder"
        :readonly="readonly"
      />
      <button 
        v-if="showRemove"
        @click="$emit('remove')" 
        class="btn btn-ghost btn-circle btn-sm text-error hover:bg-error hover:text-error-content"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import { getCountryCode } from '../utils/countryCodes'

interface Currency {
  code: string;
  name: string;
}

const props = defineProps<{
  currencyOptions: Currency[];
  currency: Currency;
  amount: string;
  placeholder?: string;
  readonly?: boolean;
  showRemove?: boolean;
  index?: number; // Add index prop
}>()

const emit = defineEmits<{
  'update:currency': [value: Currency];
  'update:amount': [value: string];
  'amountChange': [];
  'remove': [];
}>()

const modelCurrency = computed({
  get: () => props.currency,
  set: (value) => emit('update:currency', value)
})

const modelAmount = computed({
  get: () => props.amount,
  set: (value) => emit('update:amount', value)
})

const getFlag = (currencyCode: string) => {
  const code = getCountryCode(currencyCode.toUpperCase())
  if (!code) return ''
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1A5 + c.charCodeAt()))
}
</script>

<style scoped>
.v-select-container {
  position: relative;
  z-index: 20;
}

.v-select-container.is-source {
  z-index: 100;
}

.source-select :deep(.vs__dropdown-menu) {
  z-index: 101;
}

.target-select :deep(.vs__dropdown-menu) {
  z-index: 51;
}
</style>
