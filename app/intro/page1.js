// app/intro/page0.js（或 Page.js）
export default function Page() {
    return (
        <div className="container mx-auto p-4 flex flex-col items-center text-center min-h-screen justify-center">
            <h1 className="text-xl font-semibold mt-6">校園地圖</h1>
            <img 
                src="https://megapx-assets.dcard.tw/images/9100421c-acb6-40a2-b714-6826d45759c9/1280.webp" 
                alt="輔仁資管所大家庭" 
                className="mt-4 rounded shadow-lg"
            />
        </div>
    );
}