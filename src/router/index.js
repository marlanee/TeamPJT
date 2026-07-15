import { createRouter, createWebHistory } from 'vue-router'
// 커뮤니티 관련 뷰 import
import CommunityListView from '../views/CommunityListView.vue'
import CommunityFormView from '../views/CommunityFormView.vue'
import CommunityDetailView from '../views/CommunityDetailView.vue'

// 라우터 인스턴스 생성: 기존 설정(히스토리 모드)은 유지
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 글쓰기 라우트는 상세(/community/:id)보다 위에 배치해야 합니다.
    // 여기서는 목록보다 먼저 정의하여 우선순위를 보장합니다.
    { path: '/community/write', name: 'CommunityWrite', component: CommunityFormView },

    // /community 경로로 접속 시 CommunityListView를 렌더링
    { path: '/community', name: 'CommunityList', component: CommunityListView },

    // 편집 라우트는 상세 라우트보다 위에 배치해야 정확히 매칭됩니다.
    { path: '/community/:id/edit', name: 'CommunityEdit', component: CommunityFormView },

    // 상세 페이지 라우트
    { path: '/community/:id', name: 'CommunityDetail', component: CommunityDetailView },
  ],
})

export default router
