<template>
  <!-- 전체 헤더: 흰 배경과 아래쪽 연한 회색 테두리 -->
  <header class="app-header">
    <div class="container">
      <!-- 왼쪽 로고 텍스트 -->
      <div class="logo">Busan Pick</div>

      <!-- 오른쪽 메뉴: RouterLink 사용 -->
      <nav class="nav">
        <RouterLink
          to="/"
          class="nav-item"
          :class="{ active: route.path === '/' }"
          >홈</RouterLink
        >
        <RouterLink
          to="/community"
          class="nav-item"
          :class="{ active: route.path.startsWith('/community') }"
          >커뮤니티</RouterLink
        >
        <RouterLink
          to="/chatbot"
          class="nav-item"
          :class="{ active: route.path === '/chatbot' }"
          >AI 추천</RouterLink
        >
      </nav>
    </div>
  </header>
</template>

<script setup>
// Vue Router의 현재 경로를 사용하기 위해 useRoute를 가져옵니다.
// script setup 문법을 사용해 간결하게 구성합니다.
import { useRoute } from 'vue-router';

// 현재 라우트 정보를 담습니다. 메뉴의 활성 상태를 판단할 때 사용됩니다.
const route = useRoute();
</script>

<style scoped>
/* 헤더 전체 스타일: 흰 배경과 아래 테두리 */
.app-header {
  background: #ffffff; /* 흰색 배경 */
  border-bottom: 1px solid #e6e6e6; /* 연한 회색 테두리 */
  /* 화면 상단에 가로 배치되도록 기본 레이아웃 제공 */
}

.container {
  max-width: 1200px; /* 최대 너비 1200px */
  margin: 0 auto; /* 가운데 정렬 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px; /* 좌우 여백 */
  box-sizing: border-box;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.nav {
  display: flex;
  gap: 28px; /* 메뉴 간 간격 (데스크탑) */
  align-items: center;
}

.nav-item {
  color: #333333;
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.15s ease;
}

.nav-item:hover {
  color: #0b63d6; /* hover 시 파란색 계열 */
}

/* 현재 선택된 메뉴는 파란색으로 표시 */
.nav-item.active {
  color: #0b63d6;
  font-weight: 600;
}

/* 모바일: 메뉴 간격 줄이기 */
@media (max-width: 600px) {
  .container {
    padding: 10px 12px;
  }
  .nav {
    gap: 12px; /* 모바일에서 간격 감소 */
  }
  .logo {
    font-size: 1rem;
  }
  .nav-item {
    font-size: 0.95rem;
  }
}
</style>
