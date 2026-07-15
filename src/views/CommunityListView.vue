<template>
  <!-- 페이지 배경과 가운데 정렬 컨테이너 -->
  <div class="page">
    <div class="wrap">
      <!-- 제목과 설명 -->
      <header class="page-header">
        <h1>부산 루트 커뮤니티</h1>
        <p class="lead">부산에서 함께한 루트를 공유하고 추천을 받아보세요.</p>
      </header>

      <!-- 상단 바: 필터와 글쓰기 버튼 -->
      <div class="topbar">
        <div class="filters">
          <button
            class="filter-btn"
            :class="{ selected: currentFilter === 'all' }"
            @click="setFilter('all')"
          >전체</button>
          <button
            class="filter-btn"
            :class="{ selected: currentFilter === 'resident' }"
            @click="setFilter('resident')"
          >지역주민</button>
          <button
            class="filter-btn"
            :class="{ selected: currentFilter === 'traveler' }"
            @click="setFilter('traveler')"
          >여행객</button>
        </div>

        <RouterLink to="/community/write" class="write-btn">+ 루트 공유하기</RouterLink>
      </div>

      <!-- 게시글 목록 또는 비어있음 메시지 -->
      <section class="list">
        <p v-if="filteredPosts.length === 0" class="empty">아직 등록된 게시글이 없습니다.</p>

        <ul class="cards">
          <li v-for="post in filteredPosts" :key="post.id">
            <RouterLink :to="`/community/${post.id}`" class="card-link">
              <article class="card">
                <div class="card-inner">
                  <div class="rep-thumb">
                    <template v-if="post.places && post.places.length && post.places[0].firstimage">
                      <img :src="post.places[0].firstimage" alt="대표 이미지" />
                    </template>
                    <div v-else class="noimg">이미지 없음</div>
                  </div>

                  <div class="card-content">
                    <div class="card-top">
                      <span class="badge" :class="post.authorType === 'resident' ? 'resident' : 'traveler'">
                        {{ post.authorType === 'resident' ? '주민' : '여행객' }}
                      </span>
                      <h2 class="title">{{ post.title }}</h2>
                    </div>

                    <div class="meta">
                      <span class="nick">{{ post.nickname || '익명' }}</span>
                      <span class="dot">•</span>
                      <time class="date">{{ formatDate(post.createdAt) }}</time>
                      <span class="dot">•</span>
                      <span class="place-count">총 {{ (post.places || []).length }}개 장소</span>
                    </div>

                    <p class="places" v-if="post.places && post.places.length">
                      {{ formatPlaces(post.places) }}
                    </p>
                    <p class="places muted" v-else>선택한 장소가 없습니다.</p>
                  </div>
                </div>
              </article>
            </RouterLink>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
// 로컬스토리지에서 게시글을 불러오는 유틸을 가져옵니다.
import { ref, onMounted, computed } from 'vue';
import { getPosts } from '../utils/communityStorage.js';

// 현재 필터 상태: all | resident | traveler
const currentFilter = ref('all');

// posts 배열을 담는 반응형 참조
const posts = ref([]);

// 컴포넌트가 마운트될 때 로컬스토리지에서 게시글을 불러옵니다.
onMounted(() => {
  posts.value = getPosts();
});

// 필터 설정 함수
function setFilter(f) {
  currentFilter.value = f;
}

// 필터링된 게시글을 계산합니다.
const filteredPosts = computed(() => {
  if (currentFilter.value === 'all') return posts.value;
  return posts.value.filter((p) => String(p.authorType) === String(currentFilter.value));
});

// 날짜 포맷 도우미 (간단히 처리)
function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

// 장소 배열을 방문 순서(order)에 따라 정렬한 뒤 이름을 ' → ' 로 연결
function formatPlaces(places) {
  if (!Array.isArray(places) || places.length === 0) return '선택한 장소가 없습니다.';
  // order 필드가 있을 수 있으니 숫자순으로 정렬
  const sorted = [...places].sort((a, b) => {
    const oa = a.order !== undefined ? Number(a.order) : 0;
    const ob = b.order !== undefined ? Number(b.order) : 0;
    return oa - ob;
  });
  // 각 장소의 title을 사용하여 연결
  return sorted.map((p) => p.title || p.placeName || '이름 없음').join(' → ');
}
</script>

<style scoped>
/* 페이지 배경과 가운데 정렬 */
.page {
  background: #f5f7fa;
  min-height: 100vh;
  padding: 24px 12px;
  box-sizing: border-box;
}
.wrap {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header h1 {
  margin: 0 0 6px 0;
  font-size: 1.5rem;
}
.lead {
  margin: 0 0 18px 0;
  color: #6b7280;
}

/* 상단 바: 필터와 글쓰기 버튼 */
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  background: transparent;
  color: #111827;
  border-radius: 8px;
  cursor: pointer;
}
.filter-btn.selected {
  background: #0b63d6;
  color: #ffffff;
  border-color: transparent;
}

.write-btn {
  display: inline-block;
  background: #0b63d6;
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  text-decoration: none;
}

/* 게시글 목록 영역 */
.list .empty {
  color: #6b7280;
  padding: 28px;
  text-align: center;
}

.cards {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.card-link {
  text-decoration: none;
  color: inherit;
}

/* 카드 스타일: 흰 배경, 둥근 모서리, 연한 그림자 */
.card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(16,24,40,0.06);
  padding: 16px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  border: 1px solid rgba(16,24,40,0.04);
}
.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 30px rgba(16,24,40,0.12);
}

/* 카드 내부 레이아웃: 썸네일(왼쪽) / 내용(오른쪽) */
.card-inner {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* 대표 이미지 영역 - 조정된 크기 150x96 */
.rep-thumb {
  flex: 0 0 150px;
  width: 150px;
  height: 96px;
  overflow: hidden;
  border-radius: 8px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rep-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.rep-thumb .noimg {
  color: #6b7280;
  font-size: 0.95rem;
}

/* 카드 내용 영역 */
.card-content {
  flex: 1 1 auto;
  min-width: 0;
}
.card-top {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.badge {
  display: inline-block;
  padding: 6px 8px;
  border-radius: 999px;
  font-size: 0.8rem;
  color: white;
}
.badge.resident { background: #0b63d6; }
.badge.traveler { background: #f97316; }

.title {
  margin: 0;
  font-size: 1.05rem;
  color: #0f172a;
  line-height: 1.2;
}

/* 메타 정보 및 장소 경로 */
.meta {
  margin-top: 8px;
  color: #6b7280;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.nick { font-weight: 600; color: #0f172a; }
.dot { color: #c4c4c4; }
.place-count { font-weight: 500; color: #374151; }

/* 장소 경로는 한 줄 말줄임 처리 */
.places {
  margin-top: 10px;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 작은 보조 텍스트 스타일 */
.muted { color: #6b7280; }

/* 모바일: 이미지가 위, 텍스트가 아래로 배치 */
@media (max-width: 800px) {
  .card-inner {
    flex-direction: column;
    gap: 10px;
  }
  .rep-thumb {
    width: 100%;
    height: 180px;
  }
  .card {
    padding: 12px;
  }
  .places { white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
}

/* 반응형: 모바일에서 상단 버튼 간격 조정 */
@media (max-width: 600px) {
  .filters { gap: 8px }
  .filter-btn { padding: 6px 10px }
  .write-btn { padding: 8px 10px }
}
</style>