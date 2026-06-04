import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type {
  FeedPost as FeedPostType,
  ProductDropPost,
  DiscountPost,
  InfluencerReviewPost,
  CustomerReviewPost,
} from '../../data/socialFeed';
import { relativeTime } from '../../data/socialFeed';

interface FeedPostProps {
  post: FeedPostType;
}

// ── Star rating ───────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="sf-stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? 'sf-star sf-star--on' : 'sf-star'} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  );
}

// ── Type chip ─────────────────────────────────────────────────────────────────

function TypeChip({ type }: { type: FeedPostType['type'] }) {
  const labels: Record<FeedPostType['type'], string> = {
    'product-drop': 'New Drop',
    discount: 'Deal',
    'influencer-review': 'Review',
    'customer-review': 'Community',
  };
  return (
    <span className={`sf-type-chip sf-type-chip--${type}`} aria-label={`Post type: ${labels[type]}`}>
      {labels[type]}
    </span>
  );
}

// ── Action row ────────────────────────────────────────────────────────────────

interface ActionRowProps {
  postId: string;
  likes: number;
  comments: number;
}

function ActionRow({ postId, likes, comments }: ActionRowProps) {
  const addToast = useStore((s) => s.addToast);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localLikes, setLocalLikes] = useState(likes);

  function handleLike() {
    const next = !liked;
    setLiked(next);
    setLocalLikes((n) => (next ? n + 1 : n - 1));
    addToast(next ? 'Liked ♥' : 'Like removed');
  }

  function handleSave() {
    const next = !saved;
    setSaved(next);
    addToast(next ? 'Saved to your shelf 🔖' : 'Removed from shelf');
  }

  return (
    <div className="sf-actions" role="group" aria-label="Post actions">
      <button
        className={`sf-action-btn${liked ? ' sf-action-btn--active' : ''}`}
        onClick={handleLike}
        aria-label={liked ? 'Unlike post' : 'Like post'}
        aria-pressed={liked}
      >
        <span aria-hidden="true">{liked ? '♥' : '♡'}</span>
        <span className="sf-action-count">{localLikes.toLocaleString()}</span>
      </button>

      <button
        className="sf-action-btn"
        aria-label={`${comments} comments`}
        onClick={() => addToast('Comments coming soon')}
      >
        <span aria-hidden="true">💬</span>
        <span className="sf-action-count">{comments.toLocaleString()}</span>
      </button>

      <button
        className={`sf-action-btn${saved ? ' sf-action-btn--active' : ''}`}
        onClick={handleSave}
        aria-label={saved ? 'Unsave post' : 'Save post'}
        aria-pressed={saved}
      >
        <span aria-hidden="true">{saved ? '🔖' : '🔖'}</span>
      </button>

      <button
        className="sf-action-btn sf-action-btn--share"
        aria-label="Share post"
        onClick={() => addToast('Link copied to clipboard')}
        data-postid={postId}
      >
        <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}

// ── Post variants ─────────────────────────────────────────────────────────────

function ProductDropCard({ post }: { post: ProductDropPost }) {
  const navigate = useStore((s) => s.navigate);
  const gradMap: Record<string, string> = {
    sativa: 'linear-gradient(135deg, #1a2e1a 0%, #2a5c30 50%, #3a8c40 100%)',
    indica: 'linear-gradient(135deg, #1e1228 0%, #3a1e5a 50%, #7040a0 100%)',
    hybrid: 'linear-gradient(135deg, #1e1a0e 0%, #5a4010 50%, #d9a55c 100%)',
    cbd: 'linear-gradient(135deg, #0e1e2a 0%, #205068 50%, #7ec0d8 100%)',
  };
  const bg = gradMap[post.imageHint] ?? gradMap['hybrid'];

  return (
    <article className="sf-post-card sf-post-card--product-drop">
      <header className="sf-post-header">
        <div className="sf-avatar sf-avatar--brand" aria-hidden="true">
          {post.brand.charAt(0)}
        </div>
        <div className="sf-post-meta">
          <span className="sf-post-name">{post.brand}</span>
          <span className="sf-post-sub">{post.dispensaryName}</span>
        </div>
        <span className="sf-post-time" aria-label={`Posted ${relativeTime(post.timestamp)} ago`}>
          {relativeTime(post.timestamp)}
        </span>
        <TypeChip type={post.type} />
      </header>

      <div
        className="sf-media sf-media--product"
        style={{ background: bg }}
        role="img"
        aria-label={`${post.strainName} product image`}
      >
        <div className="sf-media-overlay">
          <button
            className="sf-strain-link"
            onClick={() => navigate({ page: 'strain', id: post.strainId })}
            aria-label={`View ${post.strainName} strain details`}
          >
            <span className="sf-strain-link-label">New drop</span>
            <span className="sf-strain-link-name">{post.strainName}</span>
            <span className="sf-strain-link-cta" aria-hidden="true">View strain →</span>
          </button>
        </div>
      </div>

      <div className="sf-post-body">
        <p className="sf-post-caption">{post.caption}</p>
      </div>

      <ActionRow postId={post.id} likes={post.likes} comments={post.comments} />
    </article>
  );
}

function DiscountCard({ post }: { post: DiscountPost }) {
  const addToast = useStore((s) => s.addToast);

  function handleCopyCode() {
    addToast(`Code copied: ${post.code}`);
  }

  return (
    <article className="sf-post-card sf-post-card--discount">
      <header className="sf-post-header">
        <div className="sf-avatar sf-avatar--deal" aria-hidden="true">
          %
        </div>
        <div className="sf-post-meta">
          <span className="sf-post-name">{post.dispensaryName}</span>
          <span className="sf-post-sub">Limited deal</span>
        </div>
        <span className="sf-post-time">{relativeTime(post.timestamp)}</span>
        <TypeChip type={post.type} />
      </header>

      <div className="sf-deal-block">
        <p className="sf-deal-text">{post.dealText}</p>
        <div className="sf-deal-code-row">
          <span className="sf-deal-code-label">Code</span>
          <button
            className="sf-deal-code"
            onClick={handleCopyCode}
            aria-label={`Copy discount code ${post.code}`}
          >
            {post.code}
            <span className="sf-deal-copy-hint" aria-hidden="true">copy</span>
          </button>
          <span className="sf-deal-expiry">
            Expires: {post.expiry}
          </span>
        </div>
      </div>

      <ActionRow postId={post.id} likes={post.likes} comments={post.comments} />
    </article>
  );
}

function InfluencerReviewCard({ post }: { post: InfluencerReviewPost }) {
  const navigate = useStore((s) => s.navigate);

  return (
    <article className="sf-post-card sf-post-card--influencer">
      <header className="sf-post-header">
        <div className="sf-avatar sf-avatar--influencer" aria-hidden="true">
          {post.avatarEmoji}
        </div>
        <div className="sf-post-meta">
          <span className="sf-post-name">
            {post.displayName}
            {post.verified && (
              <span className="sf-verified" aria-label="Verified creator" title="Verified">
                ✓
              </span>
            )}
          </span>
          <span className="sf-post-sub">{post.handle} · {post.followerCount} followers</span>
        </div>
        <span className="sf-post-time">{relativeTime(post.timestamp)}</span>
        <TypeChip type={post.type} />
      </header>

      <div className="sf-review-block sf-review-block--influencer">
        <div className="sf-review-strain-row">
          <button
            className="sf-review-strain-btn"
            onClick={() => navigate({ page: 'strain', id: post.strainId })}
            aria-label={`View ${post.strainName} strain`}
          >
            {post.strainName}
          </button>
          <StarRating rating={post.rating} />
        </div>
        <blockquote className="sf-review-quote">
          <p>"{post.quote}"</p>
        </blockquote>
      </div>

      <ActionRow postId={post.id} likes={post.likes} comments={post.comments} />
    </article>
  );
}

function CustomerReviewCard({ post }: { post: CustomerReviewPost }) {
  const navigate = useStore((s) => s.navigate);

  return (
    <article className="sf-post-card sf-post-card--community">
      <header className="sf-post-header">
        <div className="sf-avatar sf-avatar--user" aria-hidden="true">
          {post.avatarInitials}
        </div>
        <div className="sf-post-meta">
          <span className="sf-post-name">{post.username}</span>
          <span className="sf-post-sub">Community member</span>
        </div>
        <span className="sf-post-time">{relativeTime(post.timestamp)}</span>
        <TypeChip type={post.type} />
      </header>

      <div className="sf-review-block">
        <div className="sf-review-strain-row">
          <button
            className="sf-review-strain-btn"
            onClick={() => navigate({ page: 'strain', id: post.strainId })}
            aria-label={`View ${post.strainName} strain`}
          >
            {post.strainName}
          </button>
          <StarRating rating={post.rating} />
        </div>
        <p className="sf-review-body">{post.body}</p>
      </div>

      <ActionRow postId={post.id} likes={post.likes} comments={post.comments} />
    </article>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function FeedPost({ post }: FeedPostProps) {
  switch (post.type) {
    case 'product-drop':
      return <ProductDropCard post={post} />;
    case 'discount':
      return <DiscountCard post={post} />;
    case 'influencer-review':
      return <InfluencerReviewCard post={post} />;
    case 'customer-review':
      return <CustomerReviewCard post={post} />;
  }
}
