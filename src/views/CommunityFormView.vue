<template>
  <div class="page">
    <div class="wrap">
      <header class="page-header">
        <h1>{{ pageTitle }}</h1>
        <p class="lead">최소 2개, 최대 5개의 장소를 선택하여 후기를 남겨보세요.</p>
      </header>

      <div class="form-grid">
        <!-- 입력 폼 영역 -->
        <section class="form-section">
          <div class="field">
            <label class="field-label">작성자 유형</label>
            <div class="radio-group">
              <label class="radio-item">
                <input type="radio" value="resident" v-model="form.authorType" />
                <span class="radio-text">지역주민</span>
              </label>
              <label class="radio-item">
                <input type="radio" value="traveler" v-model="form.authorType" />
                <span class="radio-text">여행객</span>
              </label>
            </div>
          </div>

          <div class="field">
            <label>닉네임</label>
            <input v-model="form.nickname" placeholder="닉네임을 입력하세요" />
          </div>

          <div class="field">
            <label>제목</label>
            <input v-model="form.title" placeholder="제목을 입력하세요" />
          </div>

          <div class="field">
            <label>후기 내용</label>
            <textarea v-model="form.content" rows="6" placeholder="자세한 후기를 작성하세요"></textarea>
          </div>

          <div class="field">
            <label>비밀번호 (숫자 4자리)</label>
            <input v-model="form.password" placeholder="1234" maxlength="4" />
          </div>

          <div class="actions">
            <button class="submit-btn" @click="handleSubmit">{{ submitText }}</button>
            <button class="cancel-btn" @click="handleCancel">취소</button>
          </div>

          <p v-if="error" class="error">{{ error }}</p>
        </section>

        <!-- 장소 검색 및 선택 영역 -->
        <aside class="places-section">
          <div class="search">
            <input v-model="query" placeholder="장소 검색 (제목 기준)" @input="onSearch" />
          </div>

          <div class="results">
            <p v-if="loading">장소 로드 중...</p>
            <p v-else-if="displayed.length === 0">검색 결과가 없습니다.</p>

            <ul class="results-list">
              <li v-for="item in displayed" :key="item.contentid" class="result-item">
                <div class="result-grid">
                  <div class="img-wrap">
                    <img v-if="item.firstimage" :src="item.firstimage" alt="thumb" />
                    <div v-else class="noimg">이미지 없음</div>
                  </div>

                  <div class="text-wrap">
                    <div class="title">{{ item.title }}</div>
                    <div class="addr">{{ item.addr1 || '주소 정보 없음' }}</div>
                  </div>

                  <div class="btn-wrap">
                    <button
                      class="select-btn"
                      @click="selectPlace(item)"
                      :disabled="isSelected(item) || selectedPlaces.length >= 5"
                    >
                      선택
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div class="selected">
            <h3>선택된 장소 ({{ selectedPlaces.length }} / 5)</h3>
            <p class="hint">최소 2개 이상 선택해야 등록할 수 있습니다.</p>
            <ul>
              <li v-for="(p, idx) in selectedPlaces" :key="p.contentid" class="sel-item">
                <div class="sel-left">
                  <div class="sel-order">{{ idx + 1 }}</div>
                  <div class="sel-title">{{ p.title }}</div>
                </div>
                <div class="sel-actions">
                  <button @click="moveUp(idx)" :disabled="idx === 0">위로</button>
                  <button @click="moveDown(idx)" :disabled="idx === selectedPlaces.length -1">아래</button>
                  <button @click="removePlace(idx)">삭제</button>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
// Vue에서 필요한 기능을 가져옵니다.
import { computed, onMounted, ref } from 'vue'

// 페이지 이동과 현재 주소 확인을 위해 가져옵니다.
import { useRoute, useRouter } from 'vue-router'

// 게시글 생성·조회·수정·비밀번호 확인 함수를 가져옵니다.
import {
  checkPassword,
  createPost,
  getPostById,
  updatePost,
} from '../utils/communityStorage.js'

// 부산 장소 데이터 파일 목록입니다.
const DATA_FILES = [
  '/data/부산_관광지.json',
  '/data/부산_레포츠.json',
  '/data/부산_문화시설.json',
  '/data/부산_쇼핑.json',
  '/data/부산_숙박.json',
  '/data/부산_여행코스.json',
  '/data/부산_축제공연행사.json',
]

// 작성 폼에 입력되는 값입니다.
const form = ref({
  authorType: 'resident',
  nickname: '',
  title: '',
  content: '',
  password: '',
})

// 페이지 이동에 사용합니다.
const router = useRouter()

// 현재 주소의 게시글 id를 확인할 때 사용합니다.
const route = useRoute()

// 주소에 게시글 id가 있으면 수정 모드입니다.
const isEditMode = computed(() => Boolean(route.params.id))

// 작성 모드와 수정 모드에 따라 제목을 변경합니다.
const pageTitle = computed(() =>
  isEditMode.value
    ? '게시글 수정'
    : '글쓰기 - 부산 루트 공유',
)

// 작성 모드와 수정 모드에 따라 버튼 글자를 변경합니다.
const submitText = computed(() =>
  isEditMode.value
    ? '수정 완료'
    : '등록',
)

// 모든 부산 장소를 저장합니다.
const allPlaces = ref([])

// 화면에 보여줄 검색 결과입니다.
const displayed = ref([])

// 장소 데이터를 불러오는 중인지 확인합니다.
const loading = ref(false)

// 장소 검색어입니다.
const query = ref('')

// 사용자가 선택한 장소 목록입니다.
const selectedPlaces = ref([])

// 오류 메시지입니다.
const error = ref('')

// 화면이 처음 열렸을 때 부산 장소 데이터를 불러옵니다.
onMounted(async () => {
  loading.value = true

  try {
    // 7개 JSON 파일을 동시에 불러옵니다.
    const requests = DATA_FILES.map((path) =>
      fetch(encodeURI(path))
        .then((response) => {
          if (!response.ok) {
            throw new Error('장소 데이터를 불러오지 못했습니다.')
          }

          return response.json()
        })
        .catch(() => null),
    )

    const results = await Promise.all(requests)
    const mergedPlaces = []

    // 각 JSON 파일의 items 배열을 하나로 합칩니다.
    results.forEach((result) => {
      if (result && Array.isArray(result.items)) {
        mergedPlaces.push(...result.items)
      }
    })

    // 지도 좌표는 문자열일 수 있으므로 숫자로 변환합니다.
    allPlaces.value = mergedPlaces.map((place) => ({
      ...place,
      mapx:
        place.mapx !== undefined && place.mapx !== ''
          ? Number(place.mapx)
          : null,
      mapy:
        place.mapy !== undefined && place.mapy !== ''
          ? Number(place.mapy)
          : null,
    }))

    displayed.value = allPlaces.value
  } catch {
    // 데이터를 불러오지 못했을 때 빈 배열로 처리합니다.
    allPlaces.value = []
    displayed.value = []
    error.value = '장소 데이터를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }

  // 수정 모드라면 기존 게시글을 불러옵니다.
  if (isEditMode.value) {
    loadPostForEdit()
  }
})

// 수정할 기존 게시글을 불러와 폼에 채웁니다.
function loadPostForEdit() {
  const postId = route.params.id
  const post = getPostById(postId)

  if (!post) {
    error.value = '게시글을 찾을 수 없습니다.'
    return
  }

  form.value.authorType = post.authorType || 'resident'
  form.value.nickname = post.nickname || ''
  form.value.title = post.title || ''
  form.value.content = post.content || ''
  form.value.password = post.password || ''

  if (!Array.isArray(post.places)) {
    selectedPlaces.value = []
    return
  }

  selectedPlaces.value = post.places.map((place, index) => ({
    contentid: place.contentid,
    contenttypeid: place.contenttypeid,
    title: place.title,
    addr1: place.addr1 || '',
    firstimage: place.firstimage || '',
    mapx:
      place.mapx !== undefined && place.mapx !== ''
        ? Number(place.mapx)
        : null,
    mapy:
      place.mapy !== undefined && place.mapy !== ''
        ? Number(place.mapy)
        : null,
    order:
      place.order !== undefined
        ? Number(place.order)
        : index + 1,
  }))

  reassignOrders()
}

// 검색어를 기준으로 장소 이름을 검색합니다.
function onSearch() {
  const searchWord = query.value.trim().toLowerCase()

  if (!searchWord) {
    displayed.value = allPlaces.value
    return
  }

  displayed.value = allPlaces.value.filter((place) =>
    String(place.title || '')
      .toLowerCase()
      .includes(searchWord),
  )
}

// 이미 선택된 장소인지 확인합니다.
function isSelected(item) {
  return selectedPlaces.value.some(
    (place) =>
      String(place.contentid) === String(item.contentid),
  )
}

// 장소를 선택 목록에 추가합니다.
function selectPlace(item) {
  // 이미 선택된 장소는 추가하지 않습니다.
  if (isSelected(item)) {
    return
  }

  // 장소는 최대 5개까지만 선택할 수 있습니다.
  if (selectedPlaces.value.length >= 5) {
    error.value = '장소는 최대 5개까지 선택할 수 있습니다.'
    return
  }

  const newPlace = {
    contentid: item.contentid,
    contenttypeid: item.contenttypeid,
    title: item.title,
    addr1: item.addr1 || '',
    firstimage: item.firstimage || '',
    mapx:
      item.mapx !== undefined && item.mapx !== ''
        ? Number(item.mapx)
        : null,
    mapy:
      item.mapy !== undefined && item.mapy !== ''
        ? Number(item.mapy)
        : null,
    order: selectedPlaces.value.length + 1,
  }

  selectedPlaces.value.push(newPlace)
  error.value = ''
}

// 선택한 장소를 삭제합니다.
function removePlace(index) {
  selectedPlaces.value.splice(index, 1)
  reassignOrders()
}

// 선택한 장소를 한 칸 위로 이동합니다.
function moveUp(index) {
  if (index <= 0) {
    return
  }

  const places = selectedPlaces.value

  // 현재 장소와 바로 위 장소를 서로 바꿉니다.
  const temporaryPlace = places[index - 1]
  places[index - 1] = places[index]
  places[index] = temporaryPlace

  reassignOrders()
}

// 선택한 장소를 한 칸 아래로 이동합니다.
function moveDown(index) {
  const places = selectedPlaces.value

  if (index >= places.length - 1) {
    return
  }

  // 현재 장소와 바로 아래 장소를 서로 바꿉니다.
  const temporaryPlace = places[index + 1]
  places[index + 1] = places[index]
  places[index] = temporaryPlace

  reassignOrders()
}

// 선택된 장소의 방문 순서를 1부터 다시 지정합니다.
function reassignOrders() {
  selectedPlaces.value.forEach((place, index) => {
    place.order = index + 1
  })
}

// 작성 폼의 입력값을 검사합니다.
function validate() {
  error.value = ''

  if (
    !['resident', 'traveler'].includes(
      form.value.authorType,
    )
  ) {
    error.value = '작성자 유형을 선택하세요.'
    return false
  }

  if (!form.value.nickname.trim()) {
    error.value = '닉네임을 입력하세요.'
    return false
  }

  if (!form.value.title.trim()) {
    error.value = '제목을 입력하세요.'
    return false
  }

  if (!form.value.content.trim()) {
    error.value = '후기 내용을 입력하세요.'
    return false
  }

  // 비밀번호는 숫자 4자리만 허용합니다.
  if (!/^[0-9]{4}$/.test(String(form.value.password))) {
    error.value = '비밀번호는 숫자 4자리만 허용됩니다.'
    return false
  }

  if (selectedPlaces.value.length < 2) {
    error.value = '장소를 최소 2개 이상 선택해야 합니다.'
    return false
  }

  if (selectedPlaces.value.length > 5) {
    error.value = '장소는 최대 5개까지 선택할 수 있습니다.'
    return false
  }

  return true
}

// 등록 또는 수정 버튼을 눌렀을 때 실행합니다.
function handleSubmit() {
  if (!validate()) {
    return
  }

  const postData = {
    authorType: form.value.authorType,
    nickname: form.value.nickname.trim(),
    title: form.value.title.trim(),
    content: form.value.content.trim(),
    password: String(form.value.password),
    places: selectedPlaces.value.map((place) => ({
      contentid: place.contentid,
      contenttypeid: place.contenttypeid,
      title: place.title,
      addr1: place.addr1,
      firstimage: place.firstimage,
      mapx: place.mapx === null ? null : Number(place.mapx),
      mapy: place.mapy === null ? null : Number(place.mapy),
      order: Number(place.order),
    })),
  }

  try {
    // 수정 모드
    if (isEditMode.value) {
      const postId = route.params.id

      // 기존 비밀번호와 입력한 비밀번호를 비교합니다.
      const isCorrectPassword = checkPassword(
        postId,
        postData.password,
      )

      if (!isCorrectPassword) {
        error.value = '비밀번호가 일치하지 않습니다.'
        return
      }

      const updatedPost = updatePost(postId, postData)

      if (!updatedPost) {
        error.value = '수정 중 오류가 발생했습니다.'
        return
      }

      router.push(`/community/${postId}`)
      return
    }

    // 새 게시글 작성 모드
    createPost(postData)
    router.push('/community')
  } catch {
    error.value = isEditMode.value
      ? '수정 중 오류가 발생했습니다.'
      : '등록 중 오류가 발생했습니다.'
  }
}

// 취소 버튼을 눌렀을 때 이전 화면으로 이동합니다.
function handleCancel() {
  if (isEditMode.value && route.params.id) {
    router.push(`/community/${route.params.id}`)
    return
  }

  router.push('/community')
}
</script>

<style scoped>
/* 기본 레이아웃 */
.page { background: #fbfbfc; min-height: 100vh; padding: 20px 12px; box-sizing: border-box }
.wrap { max-width: 1200px; margin: 0 auto }
.page-header h1 { margin: 0 0 6px 0 }
.lead { margin: 0 0 12px 0; color: #6b7280 }

.form-grid { display: grid; grid-template-columns: 1fr 420px; gap: 18px }

.form-section { background: #fff; padding: 14px; border-radius: 10px; border: 1px solid #e6e6e6 }
.field { margin-bottom: 12px }
.field-label { display: block; margin-bottom: 6px; font-weight: 600 }
.field input, .field textarea { width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 8px }

/* 작성자 유형 라디오 레이아웃 */
.radio-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.radio-item input {
  margin: 0;
  width: 16px;
  height: 16px;
}
.radio-text { line-height: 1 }

/* 기존 라디오-group label margin removed */
/* 기타 기존 스타일s */
.actions { display: flex; gap: 10px; margin-top: 8px }
.submit-btn { background: #0b63d6; color: white; padding: 8px 14px; border-radius: 8px; border: none; cursor: pointer }
.cancel-btn { background: #f3f4f6; color: #111827; padding: 8px 14px; border-radius: 8px; border: 1px solid #e6e6e6; cursor: pointer }
.error { color: #b91c1c; margin-top: 10px }

/* 장소 검색 결과 - 한 줄 레이아웃 */
/* 리스트 reset */
.results-list { list-style: none; padding: 0; margin: 0; }

/* 항목 통일 높이 및 여백 */
.result-item {
  padding: 10px 8px;
  border-bottom: 1px solid #f3f4f6;
  box-sizing: border-box;
}

/* 그리드 - 이미지(고정) / 텍스트(유동) / 버튼(고정) */
.result-grid {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 이미지 영역 고정 너비 64px, 높이 48px */
.img-wrap { flex: 0 0 64px; width: 64px; }
.img-wrap img,
.img-wrap .noimg {
  width: 64px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  display: block;
}

/* 텍스트는 남은 공간 사용 */
.text-wrap {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 장소명 한 줄 말줄임 */
.title {
  font-weight: 600;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 주소는 최대 2줄 표시, 넘치면 숨김 */
.addr {
  color: #6b7280;
  font-size: 0.92rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: normal;
}

/* 버튼 영역 고정 너비, 버튼 크기 통일 */
.btn-wrap { flex: 0 0 80px; display: flex; justify-content: flex-end; }
.select-btn {
  width: 72px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: white;
  cursor: pointer;
  white-space: nowrap;
}

/* 비활성화 스타일 유지 */
.select-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* 선택된 장소 박스 (기존 스타일 유지) */
.places-section .results {}

/* 선택된 장소 리스트 (기존) */
.selected { background:#fff; border:1px solid #e6e6e6; border-radius:10px; padding:8px }
.sel-item { display:flex; justify-content:space-between; align-items:center; padding:8px; border-bottom:1px dashed #eee }
.sel-item:last-child { border-bottom:none }
.sel-left { display:flex; align-items:center; gap:8px }
.sel-order { width:28px; height:28px; border-radius:50%; background:#0b63d6; color:#fff; display:flex; align-items:center; justify-content:center }
.sel-title { font-weight:600 }
.sel-actions button { margin-left:6px; padding:6px 8px; border-radius:6px; border:1px solid #e6e6e6; background:white; cursor:pointer }

/* 반응형: 모바일에서는 버튼이 아래로 내려가도 되도록 처리 */
@media (max-width: 900px) {
  .result-grid {
    flex-direction: column;
    align-items: flex-start;
  }
  .img-wrap { width: 100%; flex: 0 0 auto; }
  .img-wrap img, .img-wrap .noimg { width: 100%; height: 140px; }
  .btn-wrap { width: 100%; margin-top: 8px; justify-content: flex-start; }
  .select-btn { width: 100%; }
}

/* 반응형: 전체 레이아웃 */
@media (max-width: 900px) {
  .form-grid { grid-template-columns: 1fr }
}
</style>