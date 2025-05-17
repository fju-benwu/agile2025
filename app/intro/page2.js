import Carousel from "./carousel";

export default function Page2() {
    return (
        <div className="container mx-auto p-8 flex flex-col items-center text-center min-h-screen justify-center">
            <h1
                className="text-4xl font-extrabold mb-6"
                style={{
                    color: 'linear-gradient(90deg, #1e90ff, #ff69b4, #32cd32)',
                    background: 'linear-gradient(90deg, #1e90ff, #ff69b4, #32cd32)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: '"Segoe Print", "Comic Sans MS", cursive, sans-serif',
                    letterSpacing: '2px',
                    textShadow: '2px 2px 8px #b3e0ff, 0 0 2px #ff69b4'
                }}
            >
                最新公告
            </h1>
            <a
                href="https://www.im.fju.edu.tw/%e6%9c%80%e6%96%b0%e5%85%ac%e5%91%8a/#ImportantNotice"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 bg-gradient-to-r from-blue-400 via-pink-400 to-green-400 text-white text-lg font-semibold rounded-full shadow-lg hover:scale-105 transition"
            >
                前往輔大資管系最新公告
            </a>
        </div>
    );
}