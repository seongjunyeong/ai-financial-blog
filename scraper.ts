import 'dotenv/config';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { supabase } from './lib/supabaseClient';
import { summarizeWithGemini } from './lib/geminiService';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runAutomation() {
  const url = 'https://news.einfomax.co.kr/news/articleList.html?sc_section_code=S1N1&view_type=sm';

  try {
    console.log('🚀 파이프라인 시작: 뉴스 수집 및 AI 요약...');
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(data);
    const newsItems = $('h4.titles > a');

    for (const element of newsItems.slice(0, 5)) { // 테스트를 위해 최신 뉴스 5개만 진행
      const title = $(element).text().trim();
      const link = 'https://news.einfomax.co.kr' + $(element).attr('href');

      if (!title || title.length < 5) continue;

      console.log(`\n📰 수집 중: ${title}`);
      
      // 1. Gemini AI 요약 호출
      console.log('🤖 AI 요약 생성 중...');
      const aiResult = await summarizeWithGemini(title);
      if (aiResult.quotaExceeded) {
        console.warn('⏸️ Gemini 쿼터 초과로 저장을 건너뛰고 작업을 중단합니다.');
        break;
      }

      // 2. Supabase 저장
      const { error } = await supabase.from('news_articles').insert([
        { 
          title, 
          original_url: link, 
          summary: aiResult.summary, 
          sentiment_score: aiResult.score,
          content: '본문 수집 대기 중' 
        }
      ]);

      if (error) console.error(`❌ 저장 실패: ${error.message}`);
      else console.log(`✅ 저장 완료! (점수: ${aiResult.score})`);

      // API 과호출을 피하기 위해 기사 간 간격을 둡니다.
      await sleep(1200);
    }

    console.log('\n✨ 오늘의 모든 뉴스 처리 완료!');
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

runAutomation();