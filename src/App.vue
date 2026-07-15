<script setup>
// 공통 헤더 컴포넌트를 가져옵니다.
import AppHeader from './components/AppHeader.vue'

// 현재 주소에 연결된 화면을 표시하기 위해 가져옵니다.
import { RouterView } from 'vue-router'
</script>

<template>
  <!-- 페이지 최상단에 공통 헤더를 표시합니다. -->
  <AppHeader />

  <!-- 라우터에 연결된 화면이 이 위치에 표시됩니다. -->
  <main>
    <RouterView />
  </main>
</template>

<style scoped>
main {
  padding: 16px;
}
</style>