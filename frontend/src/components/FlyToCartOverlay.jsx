import { useState, useEffect } from 'react';

// Global event bus for fly-to-cart animations
let listeners = [];
export const triggerCartAnimation = (data) => {
  listeners.forEach((callback) => callback(data));
};

export default function FlyToCartOverlay() {
  const [flyingItems, setFlyingItems] = useState([]);

  useEffect(() => {
    const handleFly = ({ startRect, image, emoji }) => {
      // Find cart button in the navbar or mobile dock
      const cartTarget = document.getElementById('nav-cart-btn') || document.getElementById('mobile-cart-btn');
      if (!cartTarget || !startRect) return;

      const targetRect = cartTarget.getBoundingClientRect();
      const id = Date.now() + Math.random();

      // Start position (center of source item/button)
      const startX = startRect.left + startRect.width / 2 - 24;
      const startY = startRect.top + startRect.height / 2 - 24;

      // End position (center of cart target)
      const endX = targetRect.left + targetRect.width / 2 - 14;
      const endY = targetRect.top + targetRect.height / 2 - 14;

      const newItem = {
        id,
        image,
        emoji: emoji || '🍛',
        startX,
        startY,
        endX,
        endY,
        progress: 0,
      };

      setFlyingItems((prev) => [...prev, newItem]);

      // Trigger movement on next animation frame
      requestAnimationFrame(() => {
        setFlyingItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, progress: 1 } : item))
        );
      });

      // Remove item after animation completes and trigger cart bump
      setTimeout(() => {
        setFlyingItems((prev) => prev.filter((item) => item.id !== id));
        // Add bump animation class to cart target
        cartTarget.classList.add('animate-cart-bump');
        setTimeout(() => cartTarget.classList.remove('animate-cart-bump'), 500);
      }, 750);
    };

    listeners.push(handleFly);
    return () => {
      listeners = listeners.filter((cb) => cb !== handleFly);
    };
  }, []);

  if (flyingItems.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {flyingItems.map((item) => {
        const currentX = item.progress === 0 ? item.startX : item.endX;
        const currentY = item.progress === 0 ? item.startY : item.endY;
        const scale = item.progress === 0 ? 1 : 0.35;
        const opacity = item.progress === 0 ? 1 : 0.6;
        const rotate = item.progress === 0 ? 0 : 360;

        return (
          <div
            key={item.id}
            style={{
              transform: `translate3d(${currentX}px, ${currentY}px, 0) scale(${scale}) rotate(${rotate}deg)`,
              opacity,
              transition: 'transform 0.7s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.7s ease-in',
            }}
            className="absolute top-0 left-0 w-12 h-12 rounded-2xl bg-white shadow-2xl border-2 border-orange-500 overflow-hidden flex items-center justify-center p-0.5"
          >
            {item.image ? (
              <img
                src={item.image}
                alt="food"
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span className="text-2xl">{item.emoji}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
