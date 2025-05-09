import '../globals.css';
import Image from 'next/image';

export default function Page1() {
    return (
        <div style={{ textAlign: 'center' }}>
            <h1>輔仁大學</h1>
            <p>資訊管理學系</p>
            <div >
                <Image style={{ width: '80%', display:'block',  margin: 'auto'}} 
                    src="https://www.im.fju.edu.tw/wp-content/uploads/2024/03/19-1.jpg" 
                    alt="輔仁資管所圖片"
                    layout="intrinsic" // 維持圖片的原始長寬比 
                    width={800} // 設定圖片寬度
                    height={450} // 設定圖片高度，保持比例
                />
            </div>
        </div>
    );
}