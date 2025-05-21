export default function Page3() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">輔大資管搶先看</h1>
            <div className="flex justify-center">
                <iframe
                    width="560"
                    height="315"
                    src="https://www.youtube.com/embed/KCA4jxwc2Pg"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
}
