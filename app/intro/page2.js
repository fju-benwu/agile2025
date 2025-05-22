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
                給新生的一封信
            </h1>
            <div
                style={{
                    fontFamily: '"DFKai-SB", "標楷體", "PMingLiU", serif',
                    fontSize: '18pt',
                    color: '#003366', // 深藍色
                    marginBottom: '2.5rem',
                    lineHeight: 1.8,
                    textAlign: 'left',
                    maxWidth: '900px'
                }}
            >
                <p style={{ marginBottom: '1rem' }}>
                    親愛的學弟妹，歡迎加入輔大資管所的大家庭！
                </p>
                <p style={{ marginBottom: '1rem' }}>
                    恭喜你成為我們的一員，接下來的兩年將會是充實而精彩的旅程。無論你是否有資訊相關背景，請放心，這裡有友善的師長、資源豐富的環境，以及溫暖互助的學長姐們，陪你一起成長。
                </p>
                <p style={{ marginBottom: '1rem' }}>
                    資管所的課程涵蓋AI、大數據、系統分析等領域，老師們專業又平易近人，能給你最實用的指導與建議。別擔心迷路，我們都曾走過迷惘的階段，只要願意學、願意問，你會發現自己一點一滴在進步。
                </p>
                <p style={{ marginBottom: '1rem' }}>
                    未來會有挑戰，也有很多值得期待的機會。我們鼓勵你多參與、多嘗試，不論是課業、專題、實習還是系上活動，都是你豐富研究所生活的養分。
                </p>
                <p style={{ marginBottom: '1rem' }}>
                    再次歡迎你！如果有任何問題，別猶豫，學長姐永遠都在你身邊。期待在校園見到你！
                </p>
                <p style={{ textAlign: 'right', marginTop: '2rem', fontSize: '24pt' }}>
                    — 資管所學長姐
                </p>
            </div>

            <a
                href="https://www.im.fju.edu.tw/%e6%9c%80%e6%96%b0%e5%85%ac%e5%91%8a/#ImportantNotice"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 text-white text-lg font-semibold rounded-full shadow-lg hover:scale-105 transition"
                style={{
                    background: 'linear-gradient(90deg, #ff9800, #2196f3)', // 橘藍漸層
                    color: '#fff',
                    marginTop: '1.5rem'
                }}
            >
                由此前往輔大資管系最新公告
            </a>
        </div>
    );
}
