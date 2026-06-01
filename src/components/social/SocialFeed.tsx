import { useState, useMemo } from 'react';
import { FEED_POSTS } from '../../data/socialFeed';
import type { PostType } from '../../data/socialFeed';
import { StoriesRow } from './StoriesRow';
import { FeedPost } from './FeedPost';

type FilterTab = 'all' | PostType;

const TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'product-drop', label: 'Drops' },
  { value: 'discount', label: 'Deals' },
  { value: 'influencer-review', label: 'Reviews' },
  { value: 'customer-review', label: 'Community' },
];

export function SocialFeed() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filtered = useMemo(() => {
    if (activeTab === 'all') return FEED_POSTS;
    return FEED_POSTS.filter((p) => p.type === activeTab);
  }, [activeTab]);

  return (
    <div className="sf-feed-root">
      <StoriesRow />

      <nav className="sf-filter-bar" role="tablist" aria-label="Filter feed by post type">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={activeTab === tab.value}
            className={`sf-filter-tab${activeTab === tab.value ? ' sf-filter-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.value)}
            aria-label={`Filter: ${tab.label}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="sf-feed-list" role="feed" aria-label="Community feed">
        {filtered.map((post) => (
          <FeedPost key={post.id} post={post} />
        ))}
        {filtered.length === 0 && (
          <p className="sf-empty-state">Nothing here yet — check back soon.</p>
        )}
      </div>
    </div>
  );
}
