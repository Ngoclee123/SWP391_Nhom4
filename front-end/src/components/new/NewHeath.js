<<<<<<< HEAD
import React from "react";
import { Link, useParams } from "react-router-dom";
import { Heart, Calendar, User, ArrowLeft, Clock, Share2, BookmarkPlus, Eye, ThumbsUp } from 'lucide-react';
import { healthArticles } from '../data/articlesData';

// Component NewsCard với thiết kế hiện đại
function NewsCard({ title, date, excerpt, image, category, readTime, views, likes, id }) {
  return (
    <div 
      className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-3 hover:scale-105"
    >
      <div className="relative overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
            {category}
          </span>
        </div>
        
        {/* Floating heart */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="bg-white/90 backdrop-blur-md rounded-full p-3 shadow-lg">
            <Heart className="w-5 h-5 text-red-500" />
          </div>
        </div>
        
        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
      
      <div className="p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 leading-tight group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </h3>
        
        <div className="flex items-center text-gray-500 text-sm mb-4 space-x-6">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            {date}
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            {readTime}
          </div>
        </div>
        
        <p className="text-gray-600 mb-6 leading-relaxed line-height-loose">
          {excerpt}
        </p>
        
        {/* Stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {views}
            </div>
            <div className="flex items-center">
              <ThumbsUp className="w-4 h-4 mr-1" />
              {likes}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700 block">Tác giả</span>
              <span className="text-xs text-gray-500">Chuyên gia y tế</span>
            </div>
          </div>
          
          <a 
            href={`/news/article/${id}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
          >
            Đọc thêm
          </a>
        </div>
      </div>
    </div>
  );
}

function News() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* News Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">
              Bài Viết Nổi Bật
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Những thông tin y khoa quan trọng và hữu ích nhất cho sức khỏe gia đình bạn
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
            {healthArticles.map(article => (
              <NewsCard
                key={article.id}
                id={article.id}
                title={article.title}
                date={article.date}
                excerpt={article.excerpt}
                image={article.image}
                category={article.category}
                readTime={article.readTime}
                views={article.views}
                likes={article.likes}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// Component ArticleDetail với thiết kế sang trọng
export function ArticleDetail() {
  const { id } = useParams();
  const article = healthArticles.find(a => a.id === parseInt(id));
  const relatedArticles = healthArticles.filter(a => a.id !== parseInt(id)).slice(0, 3);

  if (!article) {
    return <div className="container mx-auto px-4 py-12">Bài viết không tồn tại.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Header */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-ping"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="p-6 bg-white/20 rounded-full backdrop-blur-md shadow-2xl">
                <Heart className="w-16 h-16 text-white animate-pulse" />
              </div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
              Tin Tức
              <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-white bg-clip-text text-transparent animate-pulse">
                Sức Khỏe
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              Khám phá những thông tin y khoa mới nhất và lời khuyên sức khỏe từ các chuyên gia hàng đầu
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/20 backdrop-blur-md rounded-full px-8 py-4 text-white font-semibold shadow-lg">
                <span>✨ Cập nhật hàng ngày</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-full px-8 py-4 text-white font-semibold shadow-lg">
                <span>🏥 Từ chuyên gia</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-full px-8 py-4 text-white font-semibold shadow-lg">
                <span>📱 Dễ hiểu</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Sticky Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link 
            to="/news"
            className="flex items-center text-blue-600 hover:text-blue-800 font-bold transition-all duration-300 transform hover:scale-105 hover:-translate-x-2"
          >
            <ArrowLeft className="w-6 h-6 mr-3" />
            <span className="text-lg">Quay lại danh sách</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Article Header */}
        <div className="mb-12">
          <div className="mb-6">
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg">
              {article.category}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black text-gray-800 mb-8 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex items-center justify-between mb-8 flex-wrap gap-6">
            <div className="flex items-center space-x-8 text-gray-600">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="font-bold text-lg text-gray-800 block">{article.author}</span>
                  <span className="text-sm text-gray-500">Chuyên gia y tế</span>
                </div>
              </div>
              
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                <span className="font-semibold">{article.date}</span>
              </div>
              
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <Clock className="w-5 h-5 mr-2 text-purple-500" />
                <span className="font-semibold">{article.readTime}</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button className="p-4 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-all duration-300 transform hover:scale-110 shadow-lg">
                <Share2 className="w-6 h-6" />
              </button>
              <button className="p-4 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-all duration-300 transform hover:scale-110 shadow-lg">
                <BookmarkPlus className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl relative group">
          <img 
            src={article.image} 
            alt={article.title} 
            className="w-full h-96 md:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Article Content */}
        <div className="bg-white rounded-3xl shadow-xl p-10 md:p-12 mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30 -translate-y-32 translate-x-32"></div>
          <div className="relative z-10">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
              style={{
                lineHeight: '2',
                fontSize: '18px',
                color: '#374151'
              }}
            />
          </div>
        </div>

        {/* Related Articles */}
        <div className="bg-white rounded-3xl shadow-xl p-10 md:p-12">
          <h3 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-10">
            Bài Viết Liên Quan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedArticles.map(relatedArticle => (
              <a 
                key={relatedArticle.id} 
                href={`/news/article/${relatedArticle.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              >
                <img 
                  src={relatedArticle.image} 
                  alt={relatedArticle.title}
                  className="w-full h-40 object-cover rounded-xl mb-4 transition-transform duration-300 group-hover:scale-105"
                />
                <h4 className="font-bold text-gray-800 mb-3 text-lg group-hover:text-blue-600 transition-colors">
                  {relatedArticle.title}
                </h4>
                <p className="text-gray-500 text-sm mb-3">
                  {relatedArticle.date}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {relatedArticle.excerpt}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

=======
import React from "react";
import { Link, useParams } from "react-router-dom";
import { Heart, Calendar, User, ArrowLeft, Clock, Share2, BookmarkPlus, Eye, ThumbsUp } from 'lucide-react';
import { healthArticles } from '../data/articlesData';

// Component NewsCard với thiết kế hiện đại
function NewsCard({ title, date, excerpt, image, category, readTime, views, likes, id }) {
  return (
    <div 
      className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-3 hover:scale-105"
    >
      <div className="relative overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
            {category}
          </span>
        </div>
        
        {/* Floating heart */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="bg-white/90 backdrop-blur-md rounded-full p-3 shadow-lg">
            <Heart className="w-5 h-5 text-red-500" />
          </div>
        </div>
        
        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
      
      <div className="p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 leading-tight group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </h3>
        
        <div className="flex items-center text-gray-500 text-sm mb-4 space-x-6">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            {date}
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            {readTime}
          </div>
        </div>
        
        <p className="text-gray-600 mb-6 leading-relaxed line-height-loose">
          {excerpt}
        </p>
        
        {/* Stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {views}
            </div>
            <div className="flex items-center">
              <ThumbsUp className="w-4 h-4 mr-1" />
              {likes}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700 block">Tác giả</span>
              <span className="text-xs text-gray-500">Chuyên gia y tế</span>
            </div>
          </div>
          
          <a 
            href={`/news/article/${id}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
          >
            Đọc thêm
          </a>
        </div>
      </div>
    </div>
  );
}

function News() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* News Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">
              Bài Viết Nổi Bật
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Những thông tin y khoa quan trọng và hữu ích nhất cho sức khỏe gia đình bạn
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
            {healthArticles.map(article => (
              <NewsCard
                key={article.id}
                id={article.id}
                title={article.title}
                date={article.date}
                excerpt={article.excerpt}
                image={article.image}
                category={article.category}
                readTime={article.readTime}
                views={article.views}
                likes={article.likes}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// Component ArticleDetail với thiết kế sang trọng
export function ArticleDetail() {
  const { id } = useParams();
  const article = healthArticles.find(a => a.id === parseInt(id));
  const relatedArticles = healthArticles.filter(a => a.id !== parseInt(id)).slice(0, 3);

  if (!article) {
    return <div className="container mx-auto px-4 py-12">Bài viết không tồn tại.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Header */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-ping"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="p-6 bg-white/20 rounded-full backdrop-blur-md shadow-2xl">
                <Heart className="w-16 h-16 text-white animate-pulse" />
              </div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
              Tin Tức
              <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-white bg-clip-text text-transparent animate-pulse">
                Sức Khỏe
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              Khám phá những thông tin y khoa mới nhất và lời khuyên sức khỏe từ các chuyên gia hàng đầu
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/20 backdrop-blur-md rounded-full px-8 py-4 text-white font-semibold shadow-lg">
                <span>✨ Cập nhật hàng ngày</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-full px-8 py-4 text-white font-semibold shadow-lg">
                <span>🏥 Từ chuyên gia</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-full px-8 py-4 text-white font-semibold shadow-lg">
                <span>📱 Dễ hiểu</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Sticky Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link 
            to="/news"
            className="flex items-center text-blue-600 hover:text-blue-800 font-bold transition-all duration-300 transform hover:scale-105 hover:-translate-x-2"
          >
            <ArrowLeft className="w-6 h-6 mr-3" />
            <span className="text-lg">Quay lại danh sách</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Article Header */}
        <div className="mb-12">
          <div className="mb-6">
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg">
              {article.category}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black text-gray-800 mb-8 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex items-center justify-between mb-8 flex-wrap gap-6">
            <div className="flex items-center space-x-8 text-gray-600">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="font-bold text-lg text-gray-800 block">{article.author}</span>
                  <span className="text-sm text-gray-500">Chuyên gia y tế</span>
                </div>
              </div>
              
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                <span className="font-semibold">{article.date}</span>
              </div>
              
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <Clock className="w-5 h-5 mr-2 text-purple-500" />
                <span className="font-semibold">{article.readTime}</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button className="p-4 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-all duration-300 transform hover:scale-110 shadow-lg">
                <Share2 className="w-6 h-6" />
              </button>
              <button className="p-4 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-all duration-300 transform hover:scale-110 shadow-lg">
                <BookmarkPlus className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl relative group">
          <img 
            src={article.image} 
            alt={article.title} 
            className="w-full h-96 md:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Article Content */}
        <div className="bg-white rounded-3xl shadow-xl p-10 md:p-12 mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30 -translate-y-32 translate-x-32"></div>
          <div className="relative z-10">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
              style={{
                lineHeight: '2',
                fontSize: '18px',
                color: '#374151'
              }}
            />
          </div>
        </div>

        {/* Related Articles */}
        <div className="bg-white rounded-3xl shadow-xl p-10 md:p-12">
          <h3 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-10">
            Bài Viết Liên Quan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedArticles.map(relatedArticle => (
              <a 
                key={relatedArticle.id} 
                href={`/news/article/${relatedArticle.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              >
                <img 
                  src={relatedArticle.image} 
                  alt={relatedArticle.title}
                  className="w-full h-40 object-cover rounded-xl mb-4 transition-transform duration-300 group-hover:scale-105"
                />
                <h4 className="font-bold text-gray-800 mb-3 text-lg group-hover:text-blue-600 transition-colors">
                  {relatedArticle.title}
                </h4>
                <p className="text-gray-500 text-sm mb-3">
                  {relatedArticle.date}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {relatedArticle.excerpt}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

>>>>>>> ngocle_new
export default News;