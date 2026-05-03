import React from 'react';

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
}

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
  onSave?: (articleId: string, e: React.MouseEvent) => void;
  onShare?: (article: Article, e: React.MouseEvent) => void;
  isSaved?: boolean;
  squareAd?: Ad | null;
}

function ArticleDetail({
  article,
  onBack,
  onSave,
  onShare,
  isSaved,
  squareAd,
}: ArticleDetailProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const embedUrl = getYouTubeEmbedUrl(article.youtube_link);

  // Split detail into two halves
  const halfLength = Math.floor(article.detail.length / 2);
  const firstHalf = article.detail.substring(0, halfLength);
  const secondHalf = article.detail.substring(halfLength);

  return (
    <div className="detail-container">
      <button onClick={onBack} className="detail-back-btn">
        ← Back
      </button>

      {/* Full size thumbnail */}
      {article.thumbnail_url && (
        <img
          src={article.thumbnail_url}
          alt={article.headline}
          className="detail-cover"
        />
      )}

      <div className="detail-content-wrapper">
        <h1 className="detail-title">{article.headline}</h1>

        {/* Only Date - No Admin */}
        <div className="detail-date">📅 {formatDate(article.created_at)}</div>

        {/* First half of article */}
        <div className="detail-text">
          <p>{firstHalf}...</p>
        </div>

        {/* Square Ad (300x250) - In the middle */}
        {squareAd && (
          <div className="detail-ad-square">
            <img
              src={squareAd.image_url}
              alt={squareAd.business_name}
              className="ad-image-square"
            />
          </div>
        )}

        {/* Second half of article */}
        <div className="detail-text">
          <p>{secondHalf}</p>
        </div>

        {/* Share and Save at the end */}
        <div className="detail-end-actions">
          {onShare && (
            <button
              className="detail-end-btn share"
              onClick={(e) => onShare(article, e)}
            >
              📤 Share
            </button>
          )}
          {onSave && (
            <button
              className={`detail-end-btn save ${isSaved ? 'saved' : ''}`}
              onClick={(e) => onSave(article.id, e)}
            >
              {isSaved ? '⭐ Saved' : '🔖 Save'}
            </button>
          )}
        </div>
      </div>

      {/* YouTube Video at the end if exists */}
      {embedUrl && (
        <div className="video-wrapper">
          <iframe
            src={embedUrl}
            frameBorder="0"
            allowFullScreen
            title={article.headline}
          />
        </div>
      )}
    </div>
  );
}

export default ArticleDetail;
