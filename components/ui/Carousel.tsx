"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from './Carousel.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselItem {
  id: number;
  title: string;
  subtitle?: string;
  image: string;
  link: string;
}

interface CarouselProps {
  items: CarouselItem[];
  autoPlayInterval?: number;
}

export const Carousel: React.FC<CarouselProps> = ({ 
  items, 
  autoPlayInterval = 5000 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [items.length, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [items.length, isTransitioning]);

  useEffect(() => {
    const timer = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(timer);
  }, [nextSlide, autoPlayInterval]);

  const handleDotClick = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  if (!items || items.length === 0) {
    return <div style={{ background: 'var(--bg-dark)', padding: '20px', textAlign: 'center' }}>İçerik bulunamadı.</div>;
  }

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.slidesWrapper}>
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`${styles.slide} ${index === currentIndex ? styles.slideActive : ''}`}
            onClick={() => window.location.href = item.link}
            style={{ 
              opacity: index === currentIndex ? 1 : 0,
              visibility: index === currentIndex ? 'visible' : 'hidden',
              transition: 'opacity 0.6s ease-in-out'
            }}
          >
            <div className={styles.imageOverlay} />
            <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: -2 }}>
              <Image
                src={item.image}
                alt={item.title}
                fill
                style={{ objectFit: 'cover' }}
                priority={index === 0}
              />
            </div>
            <div className={styles.content}>
              <h2 className={styles.title}>{item.title}</h2>
              {item.subtitle && <p className={styles.subtitle}>{item.subtitle}</p>}
            </div>
          </div>
        ))}
      </div>

      <button className={`${styles.navButton} ${styles.prev}`} onClick={(e) => { e.stopPropagation(); prevSlide(); }}>
        <ChevronLeft size={24} />
      </button>
      <button className={`${styles.navButton} ${styles.next}`} onClick={(e) => { e.stopPropagation(); nextSlide(); }}>
        <ChevronRight size={24} />
      </button>

      <div className={styles.dots}>
        {items.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
            onClick={(e) => { e.stopPropagation(); handleDotClick(index); }}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
