import 'dotenv/config'; // 이 줄을 맨 위에 추가!
import { supabase } from './lib/supabaseClient';

async function testInsert() {
  console.log("데이터 삽입 시작...");
  
  const { data, error } = await supabase
    .from('news_articles')
    .insert([
      { 
        title: '테스트 뉴스 기사',
        content: '이것은 데이터베이스 연결 확인용 테스트입니다.',
        summary: '연결 성공!',
        sentiment_score: 0.5 
      },
    ]);

  if (error) {
    console.error('데이터 삽입 실패:', error);
  } else {
    console.log('데이터 삽입 성공!');
  }
}

testInsert();