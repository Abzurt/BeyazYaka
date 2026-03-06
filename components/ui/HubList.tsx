"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, ArrowRight } from 'lucide-react';
import styles from './HubList.module.css';

interface HubItem {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  slug: string;
}

interface HubListProps {
  items: HubItem[];
  basePath: string;
  allTags: string[];
}

export const HubList: React.FC<HubListProps> = ({ items, basePath, allTags }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = !selectedTag || item.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [items, searchTerm, selectedTag]);

  return (
    <div className={styles.container}>
      {/* Search and Filter Header */}
      <div className={styles.header}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Ara..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className={styles.tagsWrapper}>
          <button
            className={`${styles.tagButton} ${!selectedTag ? styles.tagActive : ''}`}
            onClick={() => setSelectedTag(null)}
          >
            Tümü
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`${styles.tagButton} ${selectedTag === tag ? styles.tagActive : ''}`}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Display */}
      <div className={styles.grid}>
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <Link key={item.id} href={`${basePath}/${item.slug}`} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  className={styles.image}
                />
                <div className={styles.overlay}>
                  <span className={styles.viewText}>Detayları Gör <ArrowRight size={16} /></span>
                </div>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <div className={styles.cardTags}>
                    {item.tags.slice(0, 2).map(tag => (
                      <span key={tag} className={styles.itemTag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <p className={styles.cardDesc}>{item.description}</p>
              </div>
            </Link>
          ))
        ) : (
          <div className={styles.noResults}>
            <p>Sonuç bulunamadı. Lütfen farklı bir arama terimi deneyin.</p>
          </div>
        )}
      </div>
    </div>
  );
};
