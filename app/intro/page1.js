import '../globals.css';
import Image from 'next/image';

export default function Page1() {
    return (
        <div>
            <h1>Welcome to Page 1</h1>
            <p>This is the content of Page 1.</p>
            <div style={{ width: '80%', margin: 'auto'}}>
                <Image 
                    src="https://www.im.fju.edu.tw/wp-content/uploads/2024/03/19-1.jpg" 
                    alt="輔仁資管所圖片" 
                    width={800} // 設定圖片寬度
                    height={450} // 設定圖片高度，保持比例
                />
            </div>
        </div>
    );
}