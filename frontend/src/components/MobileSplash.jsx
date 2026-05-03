import React, { useState, useEffect } from 'react';

const MobileSplash = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const isMobileSize = window.innerWidth <= 768;
      const hasVisited = sessionStorage.getItem('mobile_splash_shown');
      
      if (isMobileSize && !hasVisited) {
        setIsMobile(true);
        document.body.classList.add('splash-active');
        
        // Hide splash after animation
        const timer = setTimeout(() => {
          setIsVisible(false);
          document.body.classList.remove('splash-active');
          sessionStorage.setItem('mobile_splash_shown', 'true');
        }, 3000); // 3 seconds total

        return () => clearTimeout(timer);
      } else {
        setIsMobile(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile || !isVisible) return null;

  return (
    <div className={`mobile-splash ${!isVisible ? 'hidden' : ''}`}>
      <div className="splash-content">
        <div className="splash-logo">QUIZ BATTLE</div>
        <div className="splash-loader">
          <div className="splash-loader-bar"></div>
        </div>
        <div className="splash-text">Қош келдіңіз!</div>
      </div>
    </div>
  );
};

export default MobileSplash;
