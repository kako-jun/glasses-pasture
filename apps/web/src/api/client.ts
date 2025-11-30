const API_BASE = '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'An error occurred' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
}

// Users
export const usersApi = {
  createOrGet: (userId?: string) =>
    request<{
      id: string;
      screeningPassed: boolean;
      screeningLockUntil: string | null;
      lastAccessAt: string;
      createdAt: string;
    }>('/users', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  get: (userId: string) =>
    request<{
      id: string;
      screeningPassed: boolean;
      screeningLockUntil: string | null;
      lastAccessAt: string;
      createdAt: string;
    }>(`/users/${userId}`),
};

// Screening
export const screeningApi = {
  getQuestions: () =>
    request<{
      questions: Array<{ id: number }>;
      total: number;
      requiredCorrect: number;
    }>('/screening/questions'),

  submit: (userId: string, answers: Array<{ questionId: number; answer: 'A' | 'B' }>) =>
    request<{
      passed: boolean;
      locked?: boolean;
      lockUntil?: string;
      alreadyPassed?: boolean;
    }>('/screening/submit', {
      method: 'POST',
      body: JSON.stringify({ userId, answers }),
    }),

  getStatus: (userId: string) =>
    request<{
      passed: boolean;
      locked: boolean;
      lockUntil: string | null;
    }>(`/screening/status/${userId}`),
};

// Glasses
export const glassesApi = {
  create: (userId: string) =>
    request<{
      id: string;
      name: string;
      degree: number;
      frameColor: string;
      lensState: string;
      rarity: string;
      friendshipPoints: number;
      energy: number;
      lastActiveAt: string;
      createdAt: string;
    }>('/glasses', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  getByUser: (userId: string) =>
    request<{
      id: string;
      name: string;
      degree: number;
      frameColor: string;
      lensState: string;
      rarity: string;
      friendshipPoints: number;
      energy: number;
      lastActiveAt: string;
      createdAt: string;
    }>(`/glasses/user/${userId}`),

  rename: (glassesId: string, name: string) =>
    request<{ id: string; name: string }>(`/glasses/${glassesId}/rename`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),

  getGambits: (glassesId: string) =>
    request<{
      gambits: Array<{
        id: string;
        glassesId: string;
        condition: { type: string; threshold?: number };
        action: { type: string };
        probability: number;
        enabled: boolean;
        priority: number;
      }>;
    }>(`/glasses/${glassesId}/gambits`),

  updateGambit: (
    glassesId: string,
    gambitId: string,
    data: { probability?: number; enabled?: boolean; priority?: number }
  ) =>
    request<{ success: boolean }>(`/glasses/${glassesId}/gambits/${gambitId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Posts
export const postsApi = {
  create: (glassesId: string, content: string, isDraft = false) =>
    request<{
      id: string;
      glassesId: string;
      glassesName: string;
      content: string;
      postedAt: string;
      isDraft: boolean;
      isDeleted: boolean;
    }>('/posts', {
      method: 'POST',
      body: JSON.stringify({ glassesId, content, isDraft }),
    }),

  getByGlasses: (glassesId: string, includeDrafts = false) =>
    request<{
      posts: Array<{
        id: string;
        glassesId: string;
        glassesName: string;
        content: string;
        postedAt: string;
        isDraft: boolean;
        isDeleted: boolean;
      }>;
      count: number;
    }>(`/posts/glasses/${glassesId}?includeDrafts=${includeDrafts}`),

  get: (postId: string) =>
    request<{
      id: string;
      glassesId: string;
      glassesName: string;
      content: string;
      postedAt: string;
      isDraft: boolean;
      isDeleted: boolean;
    }>(`/posts/${postId}`),

  update: (postId: string, data: { content?: string; isDraft?: boolean }) =>
    request<{ success: boolean }>(`/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (postId: string) =>
    request<{ success: boolean }>(`/posts/${postId}`, {
      method: 'DELETE',
    }),
};

// Board
export const boardApi = {
  getByDate: (date: string) =>
    request<{
      date: string;
      posts: Array<{
        id: string;
        glassesId: string;
        glassesName: string;
        content: string;
        postedAt: string;
      }>;
      count: number;
    }>(`/board/date/${date}`),

  getDates: () =>
    request<{
      dates: Array<{
        date: string;
        postCount: number;
      }>;
    }>('/board/dates'),
};

// Interactions
export const interactionsApi = {
  getByGlasses: (glassesId: string, limit = 50, offset = 0) =>
    request<{
      logs: Array<{
        id: string;
        timestamp: string;
        actorGlassesId: string;
        actorGlassesName: string;
        targetGlassesId: string;
        targetGlassesName: string;
        actionType: string;
        friendshipDelta: number;
      }>;
      count: number;
      offset: number;
      limit: number;
    }>(`/interactions/glasses/${glassesId}?limit=${limit}&offset=${offset}`),

  getRecent: (limit = 20) =>
    request<{
      logs: Array<{
        id: string;
        timestamp: string;
        actorGlassesId: string;
        actorGlassesName: string;
        targetGlassesId: string;
        targetGlassesName: string;
        actionType: string;
        friendshipDelta: number;
      }>;
      count: number;
    }>(`/interactions/recent?limit=${limit}`),
};
