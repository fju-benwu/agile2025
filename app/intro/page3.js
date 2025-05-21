export default function Page3() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">輔大資管搶先看</h1>
            <div className="flex justify-center">
                <div style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "800px",
                    aspectRatio: "16 / 9",
                }}>
                    <iframe
                        src="https://www.youtube.com/embed/KCA4jxwc2Pg"
                        title="YouTube video player"
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            border: 0
                        }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </div>
    );
}
