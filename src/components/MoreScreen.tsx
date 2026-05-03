import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface LiveUpdate {
  id: string;
  content: string;
  youtube_link: string;
  created_at: string;
}

interface Ad {
  id: string;
  business_name: string;
  image_url: string;
  category: string;
  target_url: string;
}

interface MoreScreenProps {
}

function MoreScreen({}: MoreScreenProps) {
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryAds, setCategoryAds] = useState<Ad[]>([]);
  const [loadingAds, setLoadingAds] = useState(false);

  const categories = [
    { name: 'Shop', icon: '🛍️' },
    { name: 'Rent', icon: '🏠' },
    { name: 'Job', icon: '💼' },
    { name: 'Travel', icon: '✈️' },
    { name: 'Education', icon: '📚' },
    { name: 'Food', icon: '🍔' },
    { name: 'Other', icon: '📌' },
  ];

  const fetchLiveUpdates = async () => {
    const { data } = await supabase
      .from('live_updates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (data) setLiveUpdates(data);
  };

  const fetchCategoryAds = async (category: string) => {
    setLoadingAds(true);
    const { data } = await supabase
      .from('ads')
      .select('*')
      .eq('category', category.toLowerCase())
      .order('created_at', { ascending: false });
    if (data) {
      setCategoryAds(data);
    } else {
      setCategoryAds([]);
    }
    setLoadingAds(false);
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    fetchCategoryAds(categoryName);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCategoryAds([]);
  };

  useEffect(() => {
    fetchLiveUpdates();

    // Refresh every 10 seconds
    const interval = setInterval(() => {
      fetchLiveUpdates();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // If a category is selected, show category ads
  if (selectedCategory) {
    return (
      <div style={{ paddingBottom: '70px' }}>
        {/* Back Button */}
        <div style={{ padding: '12px' }}>
          <button
            onClick={handleBackToCategories}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#ef4444',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '8px 0',
            }}
          >
            ← Back to Categories
          </button>
        </div>

        {/* Category Title */}
        <div style={{ padding: '0 12px 12px 12px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a' }}>
            {selectedCategory} Ads
          </h2>
        </div>

        {/* Ads Grid */}
        {loadingAds ? (
          <div className="loader-container">
            <div className="loader-spinner"></div>
          </div>
        ) : categoryAds.length === 0 ? (
          <div className="empty-state"></div>
        ) : (
          <div style={{ padding: '12px' }}>
            {categoryAds.map((ad) => (
              <div
                key={ad.id}
                className="ad-card"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (ad.target_url) {
                    window.open(ad.target_url, '_blank');
                  }
                }}
              >
                <img
                  src={ad.image_url}
                  alt={ad.business_name}
                  className="ad-image-banner"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default More Screen with Live Board and Categories
  return (
    <div style={{ paddingBottom: '70px' }}>
      {/* Live Board - Preserves Text Formatting */}
      {liveUpdates.length > 0 && (
        <div
          style={{
            background: '#ffffff',
            margin: '12px',
            borderRadius: '16px',
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              background: '#fafafa',
              borderBottom: '1px solid #e0e0e0',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                animation: 'pulse 1.5s infinite',
              }}
            ></span>
            <span
              style={{
                fontWeight: '700',
                fontSize: '13px',
                color: '#1a1a1a',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              LIVE UPDATES
            </span>
          </div>

          {/* Content - Preserves line breaks */}
          <div style={{ padding: '16px' }}>
            {liveUpdates.map((update, index) => (
              <div
                key={update.id}
                style={{
                  marginBottom: index < liveUpdates.length - 1 ? '20px' : 0,
                }}
              >
                <div
                  style={{
                    color: '#333',
                    fontSize: '14px',
                    textAlign: 'left',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap', // Preserves spaces and line breaks
                    wordBreak: 'break-word', // Prevents overflow
                    fontFamily: 'inherit',
                  }}
                >
                  {update.content.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < update.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                {update.youtube_link && (
                  <a
                    href={update.youtube_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#ef4444',
                      fontSize: '12px',
                      fontWeight: '500',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'none',
                      marginTop: '8px',
                    }}
                  >
                    ▶ Watch Video
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div style={{ padding: '12px' }}>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: '700',
            marginBottom: '12px',
            color: '#1a1a1a',
          }}
        >
          Categories
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
          }}
        >
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              style={{
                background: '#ffffff',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <span
                style={{
                  fontSize: '28px',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                {cat.icon}
              </span>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                }}
              >
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MoreScreen;
