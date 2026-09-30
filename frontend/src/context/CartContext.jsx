import { createContext, useContext, useEffect, useState } from 'react';
import API from '../api/axios';
import { triggerCartAnimation } from '../components/FlyToCartOverlay';
import { sound } from '../utils/sound';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('canteen_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [favorites, setFavorites] = useState(new Set());
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [cartBump, setCartBump] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem('canteen_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('canteen_coupon');
    }
  }, [coupon]);

  const triggerBadgeBump = () => {
    setCartBump(true);
    setTimeout(() => setCartBump(false), 450);
  };

  const addToCart = (item, qty = 1, sourceRect = null) => {
    const itemImage = item.display_image || item.image_url || item.image;
    
    // Trigger parabolic fly animation if sourceRect provided
    if (sourceRect) {
      triggerCartAnimation({
        startRect: sourceRect,
        image: itemImage,
        emoji: item.is_veg ? '🥗' : '🍗',
      });
    }

    sound.playAddToCart();
    triggerBadgeBump();

    setCart((prev) => {
      const exist = prev.find((i) => i.id === item.id);
      if (exist) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          image: itemImage,
          is_veg: item.is_veg,
          category_name: item.category_name,
          quantity: qty,
        },
      ];
    });
  };

  const removeFromCart = (id) => {
    sound.playQuantityTick();
    triggerBadgeBump();
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQty = (id, qty) => {
    sound.playQuantityTick();
    triggerBadgeBump();
    if (qty <= 0) return removeFromCart(id);
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
  };

  // Financial calculations
  const subtotal = cart.reduce((s, i) => s + parseFloat(i.price || 0) * i.quantity, 0);

  let discount = 0;
  if (coupon && subtotal >= (coupon.min_order || 0)) {
    const rawDisc = (subtotal * (coupon.discount_percent || 0)) / 100;
    discount = Math.min(rawDisc, coupon.max_discount || 100);
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * 0.05; // 5% GST
  const grandTotal = taxableAmount + tax;

  const applyCouponCode = async (code) => {
    const res = await API.post('/coupons/validate/', {
      code,
      subtotal,
    });
    if (res.data.valid) {
      setCoupon(res.data);
      return res.data;
    }
    throw new Error(res.data.error || 'Invalid coupon');
  };

  const removeCoupon = () => setCoupon(null);

  const toggleFavorite = async (foodId) => {
    try {
      const res = await API.post(`/favorites/${foodId}/toggle/`);
      setFavorites((prev) => {
        const next = new Set(prev);
        if (res.data.favorited) {
          next.add(foodId);
        } else {
          next.delete(foodId);
        }
        return next;
      });
      return res.data;
    } catch (e) {
      console.warn('Need login to favorite');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        subtotal,
        discount,
        tax,
        grandTotal,
        coupon,
        applyCouponCode,
        removeCoupon,
        favorites,
        toggleFavorite,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        cartBump,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
