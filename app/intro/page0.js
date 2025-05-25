import '../globals.css';

export default function Page1() {
    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1>輔仁大學資訊管理學系</h1>
            <p></p>
            <div>
                <img 
                    style={{ width: '80%', margin: '20px auto', display: 'block' }} 
                    src="https://www.im.fju.edu.tw/wp-content/uploads/2024/03/19-1.jpg" 
                    alt="輔仁資管所圖片" 
                    className="mt-4 rounded shadow-lg"
                />
            </div>
        </div>
    );
}

