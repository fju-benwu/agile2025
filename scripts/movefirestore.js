import { getApps, initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import path from 'path';

// 載入環境變數
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID
}

// 初始化 Firebase App
const app = initializeApp(firebaseConfig); // 或在 Node.js 使用 initializeApp(applicationDefault());

// 獲取 Firestore 實例
const db = getFirestore(app);

async function backupSubcollection(year, collectionName, fileName) {
  try {
    // 獲取目標子集合的參照
    const subcollectionRef = collection(db, '系所課程', year, collectionName);

    // 讀取子集合中的所有文件
    const querySnapshot = await getDocs(subcollectionRef);

    const data = [];
    querySnapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`成功讀取 ${data.length} 份文件`);

    const filePath = `./${fileName}.json`;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`資料已儲存到 ${filePath}`);

  } catch (error) {
    console.error("備份時發生錯誤: ", error);
  }
}

async function restoreSubcollectionFromFile(year, targetCollectionName, fileName) {
    try {
      const filePath = `./${fileName}.json`;
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      console.log(`成功讀取檔案 ${filePath}，共 ${data.length} 份文件`);
  
      const newSubcollectionRef = collection(db, '系所課程');
      const batch = writeBatch(db);
      data.forEach((item) => {
        const newDocRef = doc(newSubcollectionRef, item.id);
        batch.set(newDocRef, item);
      });
      await batch.commit();
      console.log(`資料已移動到 ${newSubcollectionRef.path}`);
    } catch (error) {
      console.error("復原檔案時發生錯誤: ", error);
    }
}

// 使用範例
// 從 Firestore 備份子集合到檔案(第三個參數是檔名)
// backupSubcollection('114', '114', '114課程');
// 從檔案復原到 Firestore (第三個參數是檔名)
 restoreSubcollectionFromFile('114','該年度課程','114課程');