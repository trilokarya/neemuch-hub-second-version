import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Sidebar from './Sidebar';
import ArticleDetail from './ArticleDetail';
import MoreScreen from './MoreScreen';
import {
  Home as HomeIcon,
  Bookmark as Bookmark,
  Newspaper as NewspaperIcon,
} from 'lucide-react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

interface Article {
  id: string;
  headline: string;
  thumbnail_url: string;
  youtube_link: string;
  detail: string;
  created_at: string;
}

interface Ad {
  id: string;
  business_name: string;
  image_url: string;
  created_at?: string;
}

interface SliderAd {
  id: string;
  image_url: string;
  title: string;
  link_url: string;
  slide_order: number;
}

interface HomeProps {
  user: any;
  onLogout: () => void;
}

function Home({ user, onLogout }: HomeProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [sliderAds, setSliderAds] = useState<SliderAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'more' | 'saved'>('home');
  const [adRotation, setAdRotation] = useState<Ad[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`saved_articles_${user.id}`);
    if (saved) {
      setSavedArticles(JSON.parse(saved));
    }
    fetchArticles();
    fetchAds();
    fetchSliderAds();
  }, []);

  useEffect(() => {
    const handleBackButton = () => {
      if (selectedArticle) {
        setSelectedArticle(null);
        return true;
      } else if (activeTab !== 'home') {
        setActiveTab('home');
        return true;
      }
      return false;
    };

    window.history.pushState(null, '', window.location.href);

    const onPopState = () => {
      const handled = handleBackButton();
      if (handled) {
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [selectedArticle, activeTab]);

  useEffect(() => {
    // Pre-calculate ad rotation when ads change
    if (ads.length > 0) {
      const rotation: Ad[] = [];
      let lastAdId: string | null = null;

      for (let i = 0; i < 20; i++) {
        const availableAds = ads.filter((ad) => ad.id !== lastAdId);
        if (availableAds.length === 0) {
          availableAds.push(...ads);
        }
        const randomIndex = Math.floor(Math.random() * availableAds.length);
        const selectedAd = availableAds[randomIndex];
        rotation.push(selectedAd);
        lastAdId = selectedAd.id;
      }
      setAdRotation(rotation);
    }
  }, [ads]);

  const fetchArticles = async () => {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setArticles(data);
    setLoading(false);
    setRefreshing(false);
  };

  const fetchAds = async () => {
    const { data } = await supabase
      .from('ads')
      .select('*')
      .neq('category', 'other')
      .order('created_at', { ascending: false });
    if (data) setAds(data);
  };

  const fetchSliderAds = async () => {
    const { data } = await supabase
      .from('slider_ads')
      .select('*')
      .eq('is_active', true)
      .order('slide_order', { ascending: true });
    if (data) setSliderAds(data);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchArticles();
    fetchAds();
    fetchSliderAds();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const toggleSaveArticle = (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updatedSaved: string[];
    if (savedArticles.includes(articleId)) {
      updatedSaved = savedArticles.filter((id) => id !== articleId);
    } else {
      updatedSaved = [...savedArticles, articleId];
    }
    setSavedArticles(updatedSaved);
    localStorage.setItem(
      `saved_articles_${user.id}`,
      JSON.stringify(updatedSaved)
    );
  };

  const handleShare = async (article: Article, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/article/${article.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.headline,
          text: 'Check out this article on Nimach Hub',
          url: shareUrl,
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(`${article.headline}\n\n${shareUrl}`);
      alert('Link copied to clipboard!');
    }
  };

  const getSavedArticlesData = () => {
    return articles.filter((article) => savedArticles.includes(article.id));
  };

  const getAdFrequency = () => {
    const articleCount = articles.length;
    if (articleCount >= 12) {
      return { showAfter: 4, skipFirst: 2 };
    } else if (articleCount >= 8) {
      return { showAfter: 3, skipFirst: 1 };
    } else {
      return { showAfter: 2, skipFirst: 0 };
    }
  };

  const getNextAd = (currentIndex: number) => {
    if (adRotation.length === 0) return null;
    return adRotation[currentIndex % adRotation.length];
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  if (selectedArticle) {
    const isSaved = savedArticles.includes(selectedArticle.id);
    const squareAd =
      ads.length > 0 ? ads[Math.floor(Math.random() * ads.length)] : null;

    return (
      <ArticleDetail
        article={selectedArticle}
        onBack={() => setSelectedArticle(null)}
        onSave={toggleSaveArticle}
        onShare={handleShare}
        isSaved={isSaved}
        squareAd={squareAd}
      />
    );
  }

  const adFrequency = getAdFrequency();
  let adCounter = 0;

  return (
    <div style={{ paddingBottom: '70px', width: '100%' }}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={user.name}
        onLogout={onLogout}
      />

      <div className="top-bar">
        <div className="app-title" onClick={() => setSidebarOpen(true)}>
          <span className="logo-text">NIMACH HUB</span>
        </div>
        {activeTab === 'home' && (
          <button
            onClick={handleRefresh}
            className="refresh-btn"
            disabled={refreshing}
          >
            {refreshing ? '⏳' : '🔄'}
          </button>
        )}
      </div>

      <div style={{ marginBottom: '70px' }}>
        {activeTab === 'home' && (
          <div>
            {/* Slider Ads Carousel */}
            {sliderAds.length > 0 && (
              <div
                style={{
                  margin: '12px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                }}
              >
                <Swiper
                  modules={[Autoplay, Pagination]}
                  autoplay={{ delay: 3000, disableOnInteraction: false }}
                  pagination={{ clickable: true }}
                  loop={true}
                >
                  {sliderAds.map((ad) => (
                    <SwiperSlide key={ad.id}>
                      <img
                        src={ad.image_url}
                        alt={ad.title || 'Slider Ad'}
                        style={{
                          width: '100%',
                          height: '180px',
                          objectFit: 'cover',
                        }}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}

            {articles.length === 0 ? (
              <div className="empty-state">
                <p>No articles found</p>
              </div>
            ) : (
              articles.map((article, articleIndex) => {
                let showAd = false;
                let adToShow = null;

                if (articleIndex >= adFrequency.skipFirst) {
                  const articlePosition =
                    articleIndex - adFrequency.skipFirst + 1;
                  if (articlePosition % adFrequency.showAfter === 0) {
                    showAd = true;
                    adToShow = getNextAd(adCounter);
                    adCounter++;
                  }
                }

                return (
                  <div key={article.id}>
                    <div
                      className="article-card"
                      onClick={() => setSelectedArticle(article)}
                    >
                      {article.thumbnail_url && (
                        <img
                          src={article.thumbnail_url}
                          alt={article.headline}
                          className="article-image"
                        />
                      )}
                      <div className="article-content">
                        <div className="article-date-small">
                          {formatDate(article.created_at)}
                        </div>
                        <h3 className="article-headline">{article.headline}</h3>
                        <span className="read-more">Read More →</span>
                        <div className="article-actions">
                          <button
                            className="action-btn"
                            onClick={(e) => handleShare(article, e)}
                          >
                            📤 Share
                          </button>
                          <button
                            className={`action-btn ${
                              savedArticles.includes(article.id) ? 'saved' : ''
                            }`}
                            onClick={(e) => toggleSaveArticle(article.id, e)}
                          >
                            {savedArticles.includes(article.id)
                              ? '⭐ Saved'
                              : '🔖 Save'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {showAd && adToShow && (
                      <div className="ad-card">
                        <img
                          src={adToShow.image_url}
                          alt={adToShow.business_name}
                          className="ad-image-banner"
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'more' && <MoreScreen user={user} />}

        {activeTab === 'saved' && (
          <div>
            {getSavedArticlesData().length === 0 ? (
              <div className="empty-state">
                <p>No saved articles yet</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>
                  Tap the save button on any article
                </p>
              </div>
            ) : (
              getSavedArticlesData().map((article) => (
                <div
                  key={article.id}
                  className="article-card"
                  onClick={() => setSelectedArticle(article)}
                >
                  {article.thumbnail_url && (
                    <img
                      src={article.thumbnail_url}
                      alt={article.headline}
                      className="article-image"
                    />
                  )}
                  <div className="article-content">
                    <div className="article-date-small">
                      📅 {formatDate(article.created_at)}
                    </div>
                    <h3 className="article-headline">{article.headline}</h3>
                    <span className="read-more">Read More →</span>
                    <div className="article-actions">
                      <button
                        className="action-btn"
                        onClick={(e) => handleShare(article, e)}
                      >
                        📤 Share
                      </button>
                      <button
                        className="action-btn saved"
                        onClick={(e) => toggleSaveArticle(article.id, e)}
                      >
                        ⭐ Unsave
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="bottom-nav">
        <button
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <HomeIcon
            size={22}
            strokeWidth={1.5}
            color={activeTab === 'home' ? '#ef4444' : '#1a1a1a'}
          />
          <span className="nav-label">Home</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'more' ? 'active' : ''}`}
          onClick={() => setActiveTab('more')}
        >
          <NewspaperIcon
            size={22}
            strokeWidth={1.5}
            color={activeTab === 'more' ? '#ef4444' : '#1a1a1a'}
          />
          <span className="nav-label">More</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <Bookmark
            size={22}
            strokeWidth={1.5}
            color={activeTab === 'saved' ? '#ef4444' : '#1a1a1a'}
          />
          <span className="nav-label">Saved</span>
        </button>
      </div>
    </div>
  );
}

export default Home;
