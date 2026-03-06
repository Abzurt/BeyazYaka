"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ExternalLink, ArrowRight, Star, MessageSquare } from 'lucide-react';
import styles from '@/app/[locale]/survival-kit/survival.module.css';
import { Button } from '@/components/ui/Button';

interface AdCampaign {
  id: string;
  title: string;
  body: string | null;
  imageUrl: string | null;
  targetUrl: string;
  avgRating: number | null;
  voteCount: number;
  realCommentCount: number;
  slot: {
    name: string;
    id: string;
  };
}

interface AdsHubClientProps {
  campaigns: AdCampaign[];
  dict: any;
  locale: string;
}

export const AdsHubClient: React.FC<AdsHubClientProps> = ({ campaigns, dict, locale }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const slots = useMemo(() => {
    const uniqueSlots = new Map();
    campaigns.forEach(c => {
      uniqueSlots.set(c.slot.id, c.slot.name);
    });
    return Array.from(uniqueSlots.entries()).map(([id, name]) => ({ id, name }));
  }, [campaigns]);

  const filteredItems = useMemo(() => {
    return campaigns.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.body?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesSlot = !selectedSlot || item.slot.id === selectedSlot;
      return matchesSearch && matchesSlot;
    });
  }, [campaigns, searchTerm, selectedSlot]);

  return (
    <div className="container" style={{ paddingBottom: 'var(--space-xxl)' }}>
      <div className={styles.filterSection}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder={dict.ads.searchPlaceholder}
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className={styles.tagsWrapper}>
          <button
            className={`${styles.tagButton} ${!selectedSlot ? styles.tagActive : ''}`}
            onClick={() => setSelectedSlot(null)}
          >
            {dict.ads.allCategories}
          </button>
          {slots.map(slot => (
            <button
              key={slot.id}
              className={`${styles.tagButton} ${selectedSlot === slot.id ? styles.tagActive : ''}`}
              onClick={() => setSelectedSlot(slot.id)}
            >
              {slot.name.replace('Survival Kit - ', '')}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.productGrid}>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className={styles.productCard}>
              <Link href={`/${locale}/survival-kit/${item.id}`} className={styles.imageLink}>
                <div className={styles.iconBox}>
                  {item.imageUrl ? (
                    <Image 
                      src={item.imageUrl} 
                      alt={item.title} 
                      fill 
                      style={{ objectFit: 'cover' }} 
                    />
                  ) : (
                    <div className={styles.placeholderIcon}>?</div>
                  )}
                  <div className={styles.cardOverlay}>
                     <span>{dict.ads.buyNow}</span>
                  </div>
                </div>
              </Link>
              <div className={styles.productInfo}>
                <div className={styles.brand}>{item.slot.name.replace('Survival Kit - ', '')}</div>
                <h3 className={styles.name}>{item.title}</h3>
                <p className={styles.desc}>{item.body?.substring(0, 100)}...</p>
                <div className={styles.footer}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', fontSize: '13px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: item.avgRating ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600 }}>
                      <Star size={13} fill={item.avgRating ? 'var(--accent)' : 'transparent'} stroke={item.avgRating ? 'var(--accent)' : 'var(--text-muted)'} />
                      {item.avgRating ?? '—'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                      <MessageSquare size={13} />
                      {item.realCommentCount}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    icon={ExternalLink}
                    onClick={() => window.open(item.targetUrl, '_blank')}
                  >
                    Satın Al
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noResults}>
            <p>{dict.forum.empty}</p>
          </div>
        )}
      </div>
    </div>
  );
};
