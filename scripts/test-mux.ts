import 'dotenv/config';
import Mux from '@mux/mux-node';

const tokenId = process.env.MUX_TOKEN_ID;
const tokenSecret = process.env.MUX_TOKEN_SECRET;

if (!tokenId || !tokenSecret) {
  console.error('❌ MUX_TOKEN_ID и MUX_TOKEN_SECRET должны быть установлены в .env');
  process.exit(1);
}

const mux = new Mux({ tokenId, tokenSecret });

async function testMux() {
  try {
    console.log('🔍 Проверка Mux API...');
    const upload = await mux.video.uploads.create({
      newAssetSettings: { playback_policy: 'public' },
      cors_origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    });
    console.log('✅ Mux работает!');
    console.log('📤 Upload URL:', upload.url);
    console.log('🆔 Upload ID:', upload.id);
    console.log('🎉 Все тесты пройдены успешно!');
  } catch (error) {
    console.error('❌ Ошибка Mux:', error);
    process.exit(1);
  }
}

testMux();
