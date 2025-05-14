"use client";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // 套件樣式
import { Carousel } from "react-responsive-carousel";
import Page from "./page0";
import Page1 from "./page1";
import Page2 from "./page2";
import Page3 from "./page3";

export default function CarouselComponent() {
    return (
        <div className="max-w-4xl mx-auto">
            <Carousel
                showArrows={true}
                autoPlay={true}
                infiniteLoop={true}
                showThumbs={false}
                interval={3000}
                showStatus={false}
            >
                <div><Page /></div>
                <div><Page1 /></div>
                <div><Page2 /></div>
                <div><Pages3 /></div>
            </Carousel>
        </div>
    );
}
