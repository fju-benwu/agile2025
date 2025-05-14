//輪播區塊
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

export default function Page() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold">歡迎加入輔大資管系大家庭</h1>
            <p className="mt-4">Hello</p>
            <div className="mt-8">
                <Slider {...settings}>
                    <div>
                        <img
                            src="/images/slide1.jpg"
                            alt="Slide 1"
                            className="w-full h-auto"
                        />
                    </div>
                    <div>
                        <img
                            src="/images/slide2.jpg"
                            alt="Slide 2"
                            className="w-full h-auto"
                        />
                    </div>
                    <div>
                        <img
                            src="/images/slide3.jpg"
                            alt="Slide 3"
                            className="w-full h-auto"
                        />
                    </div>
                </Slider>
            </div>
        </div>
    );
}