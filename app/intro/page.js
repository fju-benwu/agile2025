"use client";
import Carousel from "./Carousel";

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <header>
        <h1 className="text-2xl font-bold mb-6 text-center">系所介紹</h1>
      </header>
      <Carousel />
    </div>
  );
}