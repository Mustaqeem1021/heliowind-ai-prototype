import React, { useState, useEffect } from 'react';
import { PlayCircle, PauseCircle } from 'lucide-react';

const windSlides = [
  {
    image: '/wind_1.png',
    title: 'The "Brain" of the Grid',
    description: 'We connect a digital neural network directly to physical turbines, processing telemetry in real-time.'
  },
  {
    image: '/wind_2.png',
    title: 'Holographic Twin',
    description: 'Every turbine is cloned into a 3D digital twin, allowing us to simulate mechanical stress before it happens.'
  },
  {
    image: '/wind_3.png',
    title: 'Storm Prediction',
    description: 'When bad weather hits, the data grid dynamically re-routes power forecasts with extreme precision.'
  }
];

const solarSlides = [
  {
    image: '/solar_1.png',
    title: 'The "Brain" of the Grid',
    description: 'We connect a digital neural network directly to the solar farm, processing irradiation and temperature in real-time.'
  },
  {
    image: '/solar_2.png',
    title: 'Holographic Twin',
    description: 'Every solar panel is cloned into a digital twin, allowing us to simulate thermal derating before it happens.'
  },
  {
    image: '/solar_3.png',
    title: 'Cloud Cover Prediction',
    description: 'When heavy clouds roll in, the data grid dynamically adjusts output forecasts with extreme precision.'
  }
];

const ExplainerCarousel = ({ assetType }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const slides = assetType === 'wind' ? windSlides : solarSlides;

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: '1rem' }}>
      {slides.map((slide, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: currentSlide === index ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark gradient overlay for text readability */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '50%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ccff00', marginBottom: '0.25rem', textShadow: '0 0 10px rgba(204, 255, 0, 0.3)' }}>
              {slide.title}
            </h3>
            <p style={{ color: '#f4f4f5', fontSize: '0.95rem', maxWidth: '90%', lineHeight: 1.4 }}>
              {slide.description}
            </p>
          </div>
        </div>
      ))}
      
      {/* Controls */}
      <div 
        style={{ position: 'absolute', top: '1rem', right: '1rem', cursor: 'pointer', zIndex: 10 }}
        onClick={() => setIsPlaying(!isPlaying)}
      >
        {isPlaying ? <PauseCircle size={24} color="#fff" /> : <PlayCircle size={24} color="#fff" />}
      </div>
    </div>
  );
};

export default ExplainerCarousel;
