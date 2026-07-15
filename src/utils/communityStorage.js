// 초보자를 위한 한글 주석 포함: 로컬스토리지에 익명 커뮤니티 게시글을 저장/관리하는 유틸
// 로컬스토리지 키: busanPickPosts

const STORAGE_KEY = 'busanPickPosts';

// 로컬스토리지에서 전체 게시글을 불러옵니다.
// 데이터가 없거나 파싱 오류가 발생하면 빈 배열을 반환합니다.
export function getPosts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // JSON 파싱 실패 시 빈 배열 반환
    return [];
  }
}

// 전체 게시글을 로컬스토리지에 저장합니다.
// posts는 배열 형태여야 합니다.
export function savePosts(posts) {
  try {
    const toSave = Array.isArray(posts) ? posts : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    return true;
  } catch {
    return false;
  }
}

// id로 게시글 한 개를 찾습니다. 없으면 null 반환.
// id 비교는 문자열/숫자 모두 허용되도록 처리합니다.
export function getPostById(id) {
  const posts = getPosts();
  const strId = String(id);
  const found = posts.find((p) => String(p.id) === strId);
  return found || null;
}

// 새 게시글 생성
// postData는 작성자가 입력한 값들을 포함합니다.
// id가 없으면 내부에서 고유 id를 생성합니다.
export function createPost(postData) {
  const posts = getPosts();

  // 간단한 고유 id 생성 (타임스탬프 + 랜덤)
  const newId = postData && postData.id !== undefined ? String(postData.id) : `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  const now = new Date().toISOString();

  const newPost = {
    id: newId,
    authorType: postData.authorType || '',
    nickname: postData.nickname || '',
    title: postData.title || '',
    content: postData.content || '',
    password: postData.password || '',
    places: Array.isArray(postData.places) ? postData.places : [],
    createdAt: now,
    updatedAt: now,
  };

  posts.push(newPost);
  savePosts(posts);
  return newPost;
}

// 게시글 수정: id와 createdAt은 유지하고, updatedAt만 갱신합니다.
// 존재하지 않으면 null 반환.
export function updatePost(id, updatedData) {
  const posts = getPosts();
  const strId = String(id);
  const idx = posts.findIndex((p) => String(p.id) === strId);
  if (idx === -1) return null;

  const existing = posts[idx];

  // id와 createdAt은 유지
  const updated = {
    ...existing,
    ...updatedData,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  posts[idx] = updated;
  savePosts(posts);
  return updated;
}

// 게시글 삭제: id로 찾아 제거합니다. 삭제 성공 시 true, 없으면 false.
export function deletePost(id) {
  const posts = getPosts();
  const strId = String(id);
  const filtered = posts.filter((p) => String(p.id) !== strId);
  if (filtered.length === posts.length) return false; // 삭제된 항목 없음
  savePosts(filtered);
  return true;
}

// 비밀번호 확인: 게시글이 존재하면 입력된 비밀번호와 비교합니다.
// 타입 차이로 인한 비교 문제를 막기 위해 문자열로 비교합니다.
export function checkPassword(id, inputPassword) {
  const post = getPostById(id);
  if (!post) return false;
  return String(post.password) === String(inputPassword);
}

// 편리한 기본 export (named export도 사용 가능)
const communityStorage = {
  getPosts,
  savePosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  checkPassword,
};

export default communityStorage;
