<script setup>
import { ref, onMounted } from 'vue'

const places = ref([])

onMounted(async () => {
  const res = await fetch('/data/부산_숙박.json')
  places.value = await res.json()
})
</script>

<template>
  <div>
    <h1>숙박 목록</h1>
    <ul>
      <li v-for="p in places" :key="p.id">{{ p.name }}</li>
    </ul>
  </div>
</template>