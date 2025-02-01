<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
    <div class="card w-full max-w-lg bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold text-center mb-6">Currency Exchange</h2>
        
        <div class="form-control">
          <label class="label">
            <span class="label-text">Amount</span>
          </label>
          <input 
            type="number" 
            v-model="amount" 
            class="input input-bordered w-full" 
            placeholder="Enter amount"
          />
        </div>

        <div class="grid grid-cols-2 gap-4 my-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">From</span>
            </label>
            <select v-model="fromCurrency" class="select select-bordered w-full">
              <option v-for="currency in currencies" :key="currency" :value="currency">
                {{ currency }}
              </option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">To</span>
            </label>
            <select v-model="toCurrency" class="select select-bordered w-full">
              <option v-for="currency in currencies" :key="currency" :value="currency">
                {{ currency }}
              </option>
            </select>
          </div>
        </div>

        <button 
          @click="convertCurrency" 
          class="btn btn-primary mt-4"
          :disabled="!amount || !fromCurrency || !toCurrency"
        >
          Convert
        </button>

        <div v-if="result" class="mt-6 p-4 bg-base-200 rounded-box text-center">
          <p class="text-lg">
            {{ amount }} {{ fromCurrency }} = 
            <span class="font-bold">{{ result }} {{ toCurrency }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const amount = ref('')
const fromCurrency = ref('')
const toCurrency = ref('')
const result = ref(null)

const currencies = [
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'
]

const convertCurrency = async () => {
  try {
    const runtimeConfig = useRuntimeConfig();
    const response = await fetch(`${runtimeConfig.public.API_URL}/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount.value,
        from: fromCurrency.value,
        to: toCurrency.value,
      }),
    })
    const data = await response.json()
    result.value = data.result
  } catch (error) {
    console.error('Error converting currency:', error)
  }
}
</script>