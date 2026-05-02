// app/news/page.tsx
import { supabase } from '@/lib/supabaseClient';

export default async function NewsPage() {
  // 1. Supabase에서 최신순으로 데이터 가져오기
  const { data: articles, error } = await supabase
    .from('news_articles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) return <p>데이터를 불러오는 중 오류가 발생했습니다.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">🚀 오늘의 경제 뉴스 요약</h1>
      
      <div className="grid gap-6">
        {articles?.map((article) => (
          <div key={article.id} className="border p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-xl font-semibold text-gray-800 flex-1">
                {article.title}
              </h2>
              {/* 감성 점수에 따른 배지 표시 */}
              <span className={`ml-4 px-3 py-1 rounded-full text-sm font-bold ${
                article.sentiment_score > 0 ? 'bg-blue-100 text-blue-700' : 
                article.sentiment_score < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {article.sentiment_score > 0 ? '긍정' : article.sentiment_score < 0 ? '부정' : '중립'}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4 whitespace-pre-wrap leading-relaxed">
              {article.summary}
            </p>
            
            <a 
              href={article.original_url} 
              target="_blank" 
              className="text-sm text-blue-500 hover:underline font-medium"
            >
              원문 보기 →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}