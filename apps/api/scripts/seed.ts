/**
 * Seed script for development data
 * Run with: pnpm seed
 */

const API_BASE = 'http://localhost:8787/api';

// Random data generators
const PREFIXES = ['Misty', 'Foggy', 'Blur', 'Clear', 'Sharp', 'Hazy', 'Dim', 'Bright', 'Soft', 'Deep'];
const SUFFIXES = ['Lens', 'Frame', 'Glass', 'Vision', 'Sight', 'Focus', 'View', 'Eye', 'Spec', 'Optic'];

function randomName(): string {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}${suffix}-${num}`;
}

const SAMPLE_POSTS = [
  '今日は曇りだった。窓の外を見ても、自分の眼鏡が曇っているのか空が曇っているのかわからない。',
  '本を読んでいたら、気づいたら夜だった。時間の感覚がなくなるのは良いことなのか悪いことなのか。',
  '映画を観た。主人公が眼鏡をかけていた。それだけで少し親近感が湧いた。',
  '誰とも話さない日が続いている。でも、ここに書くことで、誰かの目に触れるかもしれないと思うと、少し救われる。',
  '夢を見た。内容は覚えていないけど、眼鏡をかけていなかった気がする。',
  '雨の日は好きだ。外に出なくていい理由ができるから。',
  'コーヒーを淹れた。湯気で眼鏡が曇った。毎回曇るとわかっているのに、学習しない自分がいる。',
  '古い本屋を見つけた。埃っぽい匂いがした。何も買わなかったけど、良い時間だった。',
  '深夜のコンビニは落ち着く。蛍光灯の白さが、なぜか安心する。',
  '何もしない日だった。何もしないことが、こんなに疲れるとは思わなかった。',
  '音楽を聴いていた。歌詞の意味がわからない外国語の曲が好きだ。意味を考えなくていいから。',
  '散歩した。誰ともすれ違わなかった。',
  '昔の写真を見つけた。眼鏡が違った。あの頃の自分は、今の自分を想像できただろうか。',
  '猫を見かけた。こっちを見ていた気がしたけど、多分気のせいだ。',
  '寝る前に天井を見ていた。特に何も考えていなかった。',
];

async function request(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  return response.json();
}

async function createUser(): Promise<string> {
  const result = await request('/users', { method: 'POST', body: JSON.stringify({}) });
  return result.id;
}

async function createGlasses(userId: string): Promise<{ id: string; name: string }> {
  const result = await request('/glasses', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
  return { id: result.id, name: result.name };
}

async function createPost(glassesId: string, content: string): Promise<void> {
  await request('/posts', {
    method: 'POST',
    body: JSON.stringify({ glassesId, content, isDraft: false }),
  });
}

async function seed() {
  console.log('Seeding development data...\n');

  const NPC_COUNT = 10;
  const POSTS_PER_NPC = 3;
  const npcs: { userId: string; glassesId: string; glassesName: string }[] = [];

  // Create NPCs
  console.log(`Creating ${NPC_COUNT} NPCs...`);
  for (let i = 0; i < NPC_COUNT; i++) {
    try {
      const userId = await createUser();
      const glasses = await createGlasses(userId);
      npcs.push({ userId, glassesId: glasses.id, glassesName: glasses.name });
      console.log(`  Created: ${glasses.name}`);
    } catch (error) {
      console.error(`  Failed to create NPC ${i + 1}:`, error);
    }
  }

  console.log(`\nCreating posts...`);
  // Create posts for each NPC
  for (const npc of npcs) {
    const shuffledPosts = [...SAMPLE_POSTS].sort(() => Math.random() - 0.5);
    for (let i = 0; i < POSTS_PER_NPC; i++) {
      try {
        await createPost(npc.glassesId, shuffledPosts[i]);
        // Add small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`  Failed to create post for ${npc.glassesName}:`, error);
      }
    }
    console.log(`  ${npc.glassesName}: ${POSTS_PER_NPC} posts`);
  }

  console.log('\n--- Seed Summary ---');
  console.log(`NPCs created: ${npcs.length}`);
  console.log(`Posts created: ${npcs.length * POSTS_PER_NPC}`);
  console.log('\nDone!');
}

seed().catch(console.error);
