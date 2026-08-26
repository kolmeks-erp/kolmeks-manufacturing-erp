import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, Calendar, ArrowRight } from 'lucide-react';
import { ArticleData } from '../../pages/public/NewsPage';

export interface NewsCardProps {
  article: ArticleData;
  className?: string;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, className = '' }) => {
  return (
    <div className={`bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-blue-600 transition-colors flex flex-col justify-between ${className}`}>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-500">
          <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
            <Tag className="w-3 h-3" /> {article.category}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {article.date}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 leading-snug">
          {article.title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {article.excerpt}
        </p>
      </div>

      <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
        <span className="text-xs font-mono text-slate-400">{article.readTime}</span>
        <Link
          to={`/news/${article.slug}`}
          className="inline-flex items-center text-xs font-bold text-blue-700 hover:text-blue-900 gap-1"
        >
          Read Article <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
