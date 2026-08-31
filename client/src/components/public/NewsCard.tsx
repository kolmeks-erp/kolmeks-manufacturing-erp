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
    <div className={`bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs hover:border-blue-600 dark:hover:border-blue-500 transition-colors flex flex-col justify-between text-slate-900 dark:text-slate-100 ${className}`}>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1 font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/20 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-500/30">
            <Tag className="w-3 h-3" /> {article.category}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {article.date}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
          {article.title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {article.excerpt}
        </p>
      </div>

      <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between">
        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{article.readTime}</span>
        <Link
          to={`/news/${article.slug}`}
          className="inline-flex items-center text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-white gap-1"
        >
          Read Article <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
