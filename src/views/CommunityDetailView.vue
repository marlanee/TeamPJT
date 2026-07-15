<template>
  <div class="page">
    <div class="wrap">
      <div v-if="!loaded">
        <p class="empty">게시글을 불러오는 중입니다...</p>
      </div>

      <div v-else>
        <div v-if="!post">
          <p class="empty">게시글을 찾을 수 없습니다.</p>
        </div>

        <article v-else class="card">
          <div class="card-top">
            <span class="badge" :class="post.authorType === 'resident' ? 'resident' : 'traveler'">
              {{ post.authorType === 'resident' ? '주민' : '여행객' }}
            </span>
            <h1 class="title">{{ post.title }}</h1>
          </div>

          <div class="meta">
            <span class="nick">{{ post.nickname || '익명' }}</span>
            <span class="dot">•</span>
            <time>작성: {{ formatDate(post.createdAt) }}</time>
            <span v-if="post.updatedAt"> <span class="dot">•</span> 수정: {{ formatDate(post.updatedAt) }}</span>
          </div>

          <div class="content">
            <p v-if="post.content">{{ post.content }}</p>
            <p v-else class="muted">내용이 없습니다.</p>
          </div>

          <section class="places">
            <h2>선택한 장소</h2>
            <ul>
              <li v-for="(p, idx) in sortedPlaces" :key="p.contentid" class="place-item">
                <div class="order">{{ idx + 1 }}</div>

                <div class="thumb">
                  <img v-if="p.firstimage" :src="p.firstimage" alt="place" />
                  <div v-else class="noimg">이미지 없음</div>
                </div>

                <div class="info">
                  <div class="p-title">{{ p.title }}</div>
                  <div class="addr">{{ p.addr1 || '주소 정보 없음' }}</div>
                </div>
              </li>
            </ul>
          </section>

          <div class="actions">
            <RouterLink to="/community" class="btn">목록으로</RouterLink>
            <button class="btn" @click="onEdit">수정</button>
            <button class="btn danger" @click="onShowDelete">삭제</button>
          </div>

          <div v-if="showPwd" class="delete-box">
            <label>비밀번호를 입력하세요</label>
            <input v-model="inputPwd" maxlength="4" placeholder="숫자 4자리" />
            <div class="del-actions">
              <button class="btn danger" @click="confirmDelete">삭제 진행</button>
              <button class="btn" @click="cancelDelete">취소</button>
            </div>
            <p v-if="pwdError" class="error">{{ pwdError }}</p>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
// 게시글 조회/삭제/비밀번호 확인 유틸 임포트
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPostById, deletePost, checkPassword } from '../utils/communityStorage.js';

// 라우트에서 id를 읽어와 해당 게시글을 불러옵니다.
const route = useRoute();
const router = useRouter();
const id = route.params.id;

const post = ref(null);
const loaded = ref(false);

// 삭제 관련 상태
const showPwd = ref(false);
const inputPwd = ref('');
const pwdError = ref('');

// 컴포넌트가 마운트될 때 게시글 로드
onMounted(() => {
  loaded.value = false;
  post.value = getPostById(id);
  loaded.value = true;
});

// 선택된 장소를 order 기준으로 정렬
const sortedPlaces = computed(() => {
  if (!post.value || !Array.isArray(post.value.places)) return [];
  return [...post.value.places].sort((a, b) => (Number(a.order || 0) - Number(b.order || 0)));
});

// 날짜 포맷 헬퍼
function formatDate(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleString(); } catch { return iso }
}

// 수정 버튼: /community/:id/edit 로 이동
function onEdit() {
  router.push(`/community/${id}/edit`);
}

// 삭제 플로우: 비밀번호 입력창 표시
function onShowDelete() {
  showPwd.value = true;
  inputPwd.value = '';
  pwdError.value = '';
}

function cancelDelete() {
  showPwd.value = false;
  inputPwd.value = '';
  pwdError.value = '';
}

// 삭제 확인: 비밀번호 체크 후 확인 다이얼로그 표시
function confirmDelete() {
  pwdError.value = '';
  if (!/^[0-9]{4}$/.test(String(inputPwd.value))) {
    pwdError.value = '비밀번호는 숫자 4자리만 허용됩니다.';
    return;
  }

  // 비밀번호 비교
  const ok = checkPassword(id, inputPwd.value);
  if (!ok) {
    pwdError.value = '비밀번호가 일치하지 않습니다.';
    return;
  }

  // 사용자 확인
  if (!confirm('정말 삭제하시겠습니까?')) return;

  const deleted = deletePost(id);
  if (deleted) {
    router.push('/community');
  } else {
    pwdError.value = '삭제에 실패했습니다.';
  }
}
</script>

<style scoped>
/* 기본 페이지 레이아웃 */
.page { background: #fbfbfc; min-height: 100vh; padding: 20px 12px; box-sizing: border-box }
.wrap { max-width: 1200px; margin: 0 auto }
.empty { text-align: center; padding: 40px; color: #6b7280 }

.card { background: #fff; border: 1px solid #e6e6e6; border-radius: 10px; padding: 16px }
.card-top { display: flex; align-items: center; gap: 12px }
.badge { padding: 6px 8px; border-radius: 999px; color: #fff }
.badge.resident { background: #0b63d6 }
.badge.traveler { background: #f97316 }
.title { margin: 0; font-size: 1.3rem }

.meta { margin-top: 8px; color: #6b7280; font-size: 0.95rem }
.content { margin-top: 14px; color: #374151 }

/* 장소 리스트 스타일 - 가로 카드 형태로 정렬 */
.places { margin-top: 16px }
.places ul { list-style: none; padding: 0; margin: 0 }
.place-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
  width: 100%;
  box-sizing: border-box;
}

/* 순서 번호 (왼쪽) */
.order { width:34px; height:34px; border-radius:50%; background:#0b63d6; color:#fff; display:flex; align-items:center; justify-content:center; flex: 0 0 34px }

/* 썸네일 이미지 (왼쪽 옆) */
.thumb { flex: 0 0 auto }
.thumb img { width: 140px; height: 90px; object-fit: cover; border-radius: 8px; display:block }
.noimg { width: 140px; height: 90px; display:flex; align-items:center; justify-content:center; background:#f3f4f6; color:#6b7280; border-radius:8px }

/* 텍스트 영역 (이미지 오른쪽) */
.info { display: flex; flex-direction: column; gap: 6px; min-width: 0; flex: 1 1 auto }
.p-title { font-weight:700; color:#111827; overflow: hidden; text-overflow: ellipsis; white-space: nowrap }
.addr { color:#6b7280; font-size: 0.95rem; }

/* 액션 버튼 등 기존 스타일 유지 */
.actions { display:flex; gap:8px; margin-top:16px }
.btn { padding:8px 12px; border-radius:8px; border:1px solid #e6e6e6; background:white; cursor:pointer }
.btn.danger { background:#ef4444; color:white; border-color:transparent }

.delete-box { margin-top:12px; display:flex; flex-direction:column; gap:8px }
.delete-box input { width:160px; padding:8px; border-radius:6px; border:1px solid #d1d5db }
.del-actions { display:flex; gap:8px }
.error { color:#b91c1c }

/* 반응형: 모바일에서는 이미지가 위, 텍스트가 아래로 내려가도록 처리 */
@media (max-width: 700px) {
  .place-item { flex-direction: column; align-items: flex-start; gap: 10px }
  .order { margin-bottom: 6px }
  .thumb img, .noimg { width: 100%; height: 160px }
  .info { width: 100% }
}
</style>