import { useEffect } from "react";

export default function Pages3() {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://www.instagram.com/embed.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold">Instagram Video</h1>
            <div className="mt-4">
                <blockquote
                    className="instagram-media"
                    data-instgrm-captioned
                    data-instgrm-permalink="https://www.instagram.com/reel/DGqMh4KtgL1/?utm_source=ig_embed&amp;utm_campaign=loading"
                    data-instgrm-version="14"
                    style={{
                        background: "#FFF",
                        border: "0",
                        borderRadius: "3px",
                        boxShadow: "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)",
                        margin: "1px auto",
                        maxWidth: "540px",
                        minWidth: "326px",
                        padding: "0",
                        width: "99.375%",
                    }}
                >
                    <div style={{ padding: "16px" }}>
                        <a
                            href="https://www.instagram.com/reel/DGqMh4KtgL1/?utm_source=ig_embed&amp;utm_campaign=loading"
                            style={{
                                background: "#FFFFFF",
                                lineHeight: "0",
                                padding: "0 0",
                                textAlign: "center",
                                textDecoration: "none",
                                width: "100%",
                            }}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            在 Instagram 查看這則貼文
                        </a>
                    </div>
                </blockquote>
            </div>
        </div>
    );
}
