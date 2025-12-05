"use client";

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User } from "lucide-react";
import { CartSidebar } from "@/components/cart/cart-sidebar";
import { useCartCount } from "@/hooks/use-cart-count";

const Navbar = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartHidden, setIsCartHidden] = useState(false); // 사용자가 숨겼는지 여부
  const cartCount = useCartCount();

  // 장바구니에 아이템이 있으면 자동으로 사이드바 열기 (숨기지 않은 경우만)
  useEffect(() => {
    if (cartCount > 0 && !isCartHidden) {
      setIsCartOpen(true);
    } else if (cartCount === 0) {
      setIsCartOpen(false);
      setIsCartHidden(false); // 장바구니가 비어지면 숨김 상태 리셋
    }
  }, [cartCount, isCartHidden]);

  const handleCloseCart = () => {
    setIsCartOpen(false);
    setIsCartHidden(true); // 사용자가 숨김
  };

  const handleToggleCart = () => {
    if (isCartHidden) {
      setIsCartHidden(false);
      setIsCartOpen(true);
    } else {
      setIsCartOpen(!isCartOpen);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-2xl font-bold">
              의류 쇼핑몰
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link
                href="/products"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                상품
              </Link>
              <Link
                href="/categories"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                카테고리
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <SignedIn>
              {cartCount > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleCart}
                  className="relative"
                  title={isCartOpen ? "장바구니 숨기기" : "장바구니 보기"}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                  <span className="sr-only">장바구니</span>
                </Button>
              )}
              {cartCount === 0 && (
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="sr-only">장바구니</span>
                  </Button>
                </Link>
              )}
              <Link href="/my">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">마이페이지</span>
                </Button>
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button>로그인</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>
      <SignedIn>
        <CartSidebar isOpen={isCartOpen} onClose={handleCloseCart} />
      </SignedIn>
    </>
  );
};

export default Navbar;
