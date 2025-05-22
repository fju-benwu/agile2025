"use client";
import React, { useEffect, useState, useRef } from "react";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Added for auth
import app from "@/app/_firebase/Config";
import confetti from "canvas-confetti";
import * as XLSX from "xlsx";

// 初始化 Firestore
const db = getFirestore(app);

const style = {
  fontFamily: "'Microsoft JhengHei', Arial, sans-serif",
  maxWidth: 1200,
  margin: "0 auto",
  padding: 20,
  backgroundColor: "#f5f5f5"
};

export default function RulesPage() {
  const [academicYear, setAcademicYear] = useState("");
  const [studentType, setStudentType] = useState("");
  const [track, setTrack] = useState("");
  const [checked, setChecked] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [missing, setMissing] = useState([]);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percent: 0 });
  const [requirements, setRequirements] = useState(null);
  const [showFirework, setShowFirework] = useState(false);
  const [requirementsData, setRequirementsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [adminMode, setAdminMode] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadFileInput, setUploadFileInput] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Added state for user authentication
  const fireworkTimeout = useRef(null);

  // 設定固定的學年度選項
  const initializeAvailableYears = () => {
    const years = ["114", "113"]; // 固定的學年度選項
    setAvailableYears(years);
  };

  // 檢查用戶認證狀態
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // 用戶已登入，載入其已保存的資料
        loadUserData(user.uid);
        // 檢查用戶是否為管理員
        await checkAdminStatus(user.uid);
      } else {
        // 用戶登出時重置管理員狀態
        setAdminMode(false);
      }
    });
    
    // 清除訂閱
    return () => unsubscribe();
  }, []);

  // 檢查用戶是否為管理員
  const checkAdminStatus = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const isAdmin = userData.role === "admin";
        setAdminMode(isAdmin);
        console.log("用戶角色:", userData.role, "是否為管理員:", isAdmin);
      } else {
        setAdminMode(false);
        console.log("用戶文檔不存在，設置為非管理員");
      }
    } catch (error) {
      console.error("檢查管理員狀態時出錯:", error);
      setAdminMode(false);
    }
  };
  const loadUserData = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists() && userDocSnap.data().courseSelections) {
        const userData = userDocSnap.data().courseSelections;
        // 只有在有實際數據時更新
        if (userData.checked && Object.keys(userData.checked).length > 0) {
          setChecked(userData.checked || {});
          setStudentType(userData.studentType || "regular");
          setTrack(userData.track || "ai");
          setAcademicYear(userData.academicYear || "113");
        }
      } else {
        // 如果沒有用戶數據，則使用本地存儲數據
        const saved = localStorage.getItem("masterCourseRequirementState");
        if (saved) {
          const savedState = JSON.parse(saved);
          setChecked(savedState.checked || {});
          setStudentType(savedState.studentType || "regular");
          setTrack(savedState.track || "ai");
          setAcademicYear(savedState.academicYear || "113");
        }
      }
    } catch (error) {
      console.error("讀取使用者資料時發生錯誤:", error);
    }
  };

  // 儲存用戶數據到 Firestore
  const saveUserData = async () => {
    if (!currentUser) {
      alert("請先登入以儲存您的選課資料！");
      // 重導向到登入頁面
      window.location.href = "/agile2025/login"; // 請替換為您的實際登入頁面路徑
      return;
    }
    
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      
      // 首先檢查用戶文檔是否已存在
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        // 更新現有文檔與課程選擇
        await updateDoc(userDocRef, {
          courseSelections: {
            checked,
            studentType,
            track,
            academicYear,
            lastUpdated: new Date().toISOString()
          }
        });
      } else {
        // 創建新的用戶文檔
        await setDoc(userDocRef, {
          email: currentUser.email,
          name: currentUser.displayName || "",
          role: "user", // 默認角色
          createdAt: new Date().toISOString(),
          courseSelections: {
            checked,
            studentType,
            track,
            academicYear,
            lastUpdated: new Date().toISOString()
          }
        });
      }
      
      // 同時保存到本地儲存作為備份
      localStorage.setItem("masterCourseRequirementState", JSON.stringify({
        checked,
        studentType,
        track,
        academicYear
      }));
      
      alert("已儲存選課資料至您的個人資料！");
    } catch (error) {
      console.error("儲存資料時發生錯誤:", error);
      alert("儲存資料時發生錯誤: " + error.message);
    }
  };

  // 從 Firestore 讀取修業規則資料
  const fetchRequirementsData = async () => {
    // 檢查必要的選項是否已選擇
    if (!academicYear || !studentType) {
      setError("請先選擇學年度和學生類型");
      return;
    }
    
    if (studentType === "regular" && !track) {
      setError("請選擇學群");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`開始讀取 ${academicYear} 學年度的資料`);
      
      // 轉換資料格式
      const transformedData = {
        regular: {},
        partTime: {}
      };

      // 讀取一般生資料 (從 subcollection 讀取)
      console.log("=== 讀取一般生資料 ===");
      try {
        const regularCollection = collection(db, "修業規則檢核", academicYear, "一般生");
        const regularSnapshot = await getDocs(regularCollection);
        
        console.log(`一般生文檔數量: ${regularSnapshot.size}`);
        regularSnapshot.forEach((doc) => {
          const docId = doc.id;
          const docData = doc.data();
          console.log(`一般生文檔 ${docId}:`, docData);
          
          if (docId.startsWith("regular-")) {
            const track = docId.replace("regular-", "");
            transformedData.regular[track] = docData;
            console.log(`一般生-${track} 已加入`);
          }
        });
      } catch (err) {
        console.log("讀取一般生資料時發生錯誤:", err);
      }

      // 讀取在職生資料 (從 subcollection 讀取)
      console.log("=== 讀取在職生資料 ===");
      try {
        const partTimeCollection = collection(db, "修業規則檢核", academicYear, "在職生");
        const partTimeSnapshot = await getDocs(partTimeCollection);
        
        console.log(`在職生文檔數量: ${partTimeSnapshot.size}`);
        partTimeSnapshot.forEach((doc) => {
          const docId = doc.id;
          const docData = doc.data();
          console.log(`在職生文檔 ${docId}:`, docData);
          
          transformedData.partTime[docId] = docData;
          console.log(`在職生-${docId} 已加入`);
        });
      } catch (err) {
        console.log("讀取在職生資料時發生錯誤:", err);
      }
      
      console.log("=== 最終轉換的資料 ===");
      console.log("transformedData:", transformedData);
      console.log("regular tracks:", Object.keys(transformedData.regular));
      console.log("partTime tracks:", Object.keys(transformedData.partTime));
      
      // 檢查是否有資料
      if (Object.keys(transformedData.regular).length === 0 && Object.keys(transformedData.partTime).length === 0) {
        setError(`無法找到 ${academicYear} 學年度的資料。請檢查 Firestore 中的 subcollection 結構。`);
        return;
      }
      
      setRequirementsData(transformedData);
      updateRequirementsBasedOnSelection(transformedData);
      
    } catch (err) {
      console.error("讀取資料時發生錯誤:", err);
      setError("讀取資料時發生錯誤: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 下載模板檔案
  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/firestore_course_template_v2.xlsx'; // 假設檔案放在 public 資料夾
    link.download = 'firestore_course_template_v2.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 清理資料中的 undefined 值
  const cleanUndefinedValues = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(cleanUndefinedValues);
    } else if (obj !== null && typeof obj === 'object') {
      const cleaned = {};
      for (const key in obj) {
        if (obj[key] !== undefined) {
          cleaned[key] = cleanUndefinedValues(obj[key]);
        }
      }
      return cleaned;
    }
    return obj;
  };

  // 處理檔案上傳
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!confirm(`確定要上傳檔案「${file.name}」並更新課程資料嗎？此操作會覆蓋現有資料。`)) {
      // 清空 input，允許重新選擇同一個檔案
      event.target.value = '';
      return;
    }

    setIsUploading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, {
        cellStyles: true,
        cellFormulas: true,
        cellDates: true,
        cellNF: true,
        sheetStubs: true
      });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // 將工作表轉換為 JSON，包含空行
      const rawData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        blankrows: true
      });

      console.log('Raw Excel data:', rawData);

      // 從第3行開始讀取資料（index 2，跳過第2行的範例格式說明）
      const headers = rawData[0] || [];
      const actualData = rawData.slice(2).filter(row => row && row.some(cell => cell !== ''));

      console.log('Headers:', headers);
      console.log('Actual data starting from row 3:', actualData);

      if (actualData.length === 0) {
        alert('檔案中沒有找到有效的課程資料（從第3行開始）。');
        return;
      }

      // 確認必要的欄位（使用英文欄位名）
      const requiredFields = ['year', 'studentType', 'track', 'categoryId', 'courseId', 'courseName', 'credit', 'courseCode'];
      const missingFields = requiredFields.filter(field => !headers.includes(field));
      
      if (missingFields.length > 0) {
        alert(`檔案缺少必要欄位：${missingFields.join(', ')}`);
        return;
      }

      // 建立欄位索引映射
      const fieldIndexMap = {};
      headers.forEach((header, index) => {
        fieldIndexMap[header] = index;
      });

      // 處理資料並按學年度、學生類型、學群分組
      const groupedData = {};

      actualData.forEach((row, rowIndex) => {
        try {
          const academicYear = row[fieldIndexMap['year']] || '';
          const studentType = row[fieldIndexMap['studentType']] || '';
          const track = row[fieldIndexMap['track']] || '';
          const categoryId = row[fieldIndexMap['categoryId']] || '';
          
          if (!academicYear || !studentType || !categoryId) {
            console.warn(`第 ${rowIndex + 3} 行資料不完整，跳過`, row);
            return;
          }

          const course = {
            id: row[fieldIndexMap['courseId']] || '',
            name: row[fieldIndexMap['courseName']] || '',
            credit: parseInt(row[fieldIndexMap['credit']]) || 0,
            code: row[fieldIndexMap['courseCode']] || ''
          };

          // 檢查是否為英語授課（如果有相關欄位且值為真）
          if (fieldIndexMap['englishTaught'] && 
              (row[fieldIndexMap['englishTaught']] === 'Y' || 
               row[fieldIndexMap['englishTaught']] === 'true' || 
               row[fieldIndexMap['englishTaught']] === true)) {
            course.isEnglishTaught = true;
          }

          if (!course.id || !course.name) {
            console.warn(`第 ${rowIndex + 3} 行課程資料不完整，跳過`, row);
            return;
          }

          // 建立分組鍵
          const groupKey = `${academicYear}-${studentType}-${track || 'default'}`;
          
          if (!groupedData[groupKey]) {
            groupedData[groupKey] = {
              academicYear: academicYear.toString(),
              studentType,
              track,
              groupName: row[fieldIndexMap['groupName']] || '',
              totalCredits: parseInt(row[fieldIndexMap['totalCredits']]) || 0,
              categories: {}
            };
          }

          if (!groupedData[groupKey].categories[categoryId]) {
            const categoryData = {
              name: row[fieldIndexMap['categoryName']] || categoryId,
              description: row[fieldIndexMap['categoryDescription']] || '',
              required: parseInt(row[fieldIndexMap['categoryRequired']]) || 0,
              courses: []
            };

            // 只有當 minCourses 有有效值時才添加這個欄位
            const minCourses = parseInt(row[fieldIndexMap['minCourses']]);
            if (!isNaN(minCourses) && minCourses > 0) {
              categoryData.minCourses = minCourses;
            }

            groupedData[groupKey].categories[categoryId] = categoryData;
          }

          groupedData[groupKey].categories[categoryId].courses.push(course);
        } catch (error) {
          console.error(`處理第 ${rowIndex + 3} 行時發生錯誤:`, error, row);
        }
      });

      console.log('分組後的資料:', groupedData);

      // 上傳到 Firestore
      for (const [groupKey, groupData] of Object.entries(groupedData)) {
        const { academicYear, studentType, track } = groupData;
        
        let collectionPath;
        let docId;
        
        if (studentType === 'partTime') {
          collectionPath = `修業規則檢核/${academicYear}/在職生`;
          docId = 'standard';
        } else {
          collectionPath = `修業規則檢核/${academicYear}/一般生`;
          docId = `regular-${track}`;
        }

        // 計算總學分
        let totalCredits = 0;
        Object.values(groupData.categories).forEach(category => {
          if (category.courses) {
            totalCredits += category.required || 0;
          }
        });

        const dataToUpload = cleanUndefinedValues({
          name: groupData.groupName || (studentType === 'partTime' ? '在職專班' : `一般生-${track}組`),
          totalCredits: groupData.totalCredits || totalCredits,
          categories: groupData.categories,
          lastUpdated: new Date().toISOString()
        });

        const docRef = doc(db, collectionPath, docId);
        
        console.log(`準備上傳到: ${collectionPath}/${docId}`);
        console.log('資料內容:', JSON.stringify(dataToUpload, null, 2));
        
        await setDoc(docRef, dataToUpload, { merge: true });
        
        console.log(`已上傳: ${collectionPath}/${docId}`);
      }

      alert(`檔案上傳成功！共處理 ${Object.keys(groupedData).length} 個資料組。`);
      
      // 重新載入資料
      await fetchRequirementsData();

    } catch (error) {
      console.error('上傳檔案時發生錯誤:', error);
      alert('上傳檔案時發生錯誤: ' + error.message);
    } finally {
      setIsUploading(false);
      // 清空 input，允許重新上傳
      event.target.value = '';
    }
  };

  // 編輯課程
  const handleEditCourse = (course, categoryKey) => {
    setEditingCourse({ 
      ...course, 
      categoryKey,
      originalId: course.id 
    });
    setShowEditModal(true);
  };

  // 刪除課程
  const handleDeleteCourse = async (course, categoryKey) => {
    if (!confirm(`確定要刪除課程「${course.name}」嗎？此操作無法復原。`)) {
      return;
    }

    try {
      setLoading(true);
      
      // 根據學生類型構建 Firestore 路徑
      let collectionPath;
      let docId;
      
      if (studentType === "partTime") {
        collectionPath = `修業規則檢核/${academicYear}/在職生`;
        docId = "standard";
      } else {
        collectionPath = `修業規則檢核/${academicYear}/一般生`;
        docId = `regular-${track}`;
      }

      // 獲取當前文檔
      const docRef = doc(db, collectionPath, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentData = docSnap.data();
        
        // 從課程列表中移除指定課程
        if (currentData.categories && currentData.categories[categoryKey] && currentData.categories[categoryKey].courses) {
          currentData.categories[categoryKey].courses = currentData.categories[categoryKey].courses.filter(
            c => c.id !== course.id
          );
          
          // 更新到 Firestore
          await updateDoc(docRef, currentData);
          
          alert("課程已成功刪除！");
          
          // 重新載入資料
          await fetchRequirementsData();
        }
      }
    } catch (err) {
      console.error("刪除課程時發生錯誤:", err);
      alert("刪除課程時發生錯誤: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 儲存編輯的課程
  const handleSaveCourse = async () => {
    if (!editingCourse) return;

    if (!confirm(`確定要儲存對課程「${editingCourse.name}」的修改嗎？`)) {
      return;
    }

    try {
      setLoading(true);
      
      // 根據學生類型構建 Firestore 路徑
      let collectionPath;
      let docId;
      
      if (studentType === "partTime") {
        collectionPath = `修業規則檢核/${academicYear}/在職生`;
        docId = "standard";
      } else {
        collectionPath = `修業規則檢核/${academicYear}/一般生`;
        docId = `regular-${track}`;
      }

      // 獲取當前文檔
      const docRef = doc(db, collectionPath, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentData = docSnap.data();
        
        // 更新課程資料
        if (currentData.categories && currentData.categories[editingCourse.categoryKey] && currentData.categories[editingCourse.categoryKey].courses) {
          const courseIndex = currentData.categories[editingCourse.categoryKey].courses.findIndex(
            c => c.id === editingCourse.originalId
          );
          
          if (courseIndex !== -1) {
            // 創建更新後的課程物件
            const updatedCourse = {
              id: editingCourse.id,
              name: editingCourse.name,
              credit: parseInt(editingCourse.credit),
              code: editingCourse.code
            };
            
            // 如果有英語授課標記，保留它
            if (editingCourse.isEnglishTaught) {
              updatedCourse.isEnglishTaught = true;
            }
            
            currentData.categories[editingCourse.categoryKey].courses[courseIndex] = updatedCourse;
            
            // 更新到 Firestore
            await updateDoc(docRef, currentData);
            
            alert("課程已成功更新！");
            
            // 關閉編輯彈窗
            setShowEditModal(false);
            setEditingCourse(null);
            
            // 重新載入資料
            await fetchRequirementsData();
          }
        }
      }
    } catch (err) {
      console.error("更新課程時發生錯誤:", err);
      alert("更新課程時發生錯誤: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 根據選擇更新 requirements
  const updateRequirementsBasedOnSelection = (data = requirementsData) => {
    if (!data || !studentType || !academicYear) return;
    
    if (studentType === "partTime") {
      // 在職專班使用 standard
      if (data.partTime && data.partTime.standard) {
        setRequirements(data.partTime.standard);
      }
    } else {
      // 一般生根據學群選擇
      if (track && data.regular && data.regular[track]) {
        setRequirements(data.regular[track]);
      }
    }
  };

  // 組件載入時載入 localStorage 和可用學年度
  useEffect(() => {
    // 載入可用的學年度列表
    initializeAvailableYears();
    
    // 如果未登入，才從 localStorage 載入
    // 如果登入狀態，會在 onAuthStateChanged 回調中載入用戶特定數據
    if (!currentUser) {
      // 載入 localStorage
      const saved = localStorage.getItem("masterCourseRequirementState");
      if (saved) {
        const savedState = JSON.parse(saved);
        setChecked(savedState.checked || {});
        setStudentType(savedState.studentType || "regular");
        setTrack(savedState.track || "ai");
        setAcademicYear(savedState.academicYear || "113");
      }
    }
  }, [currentUser]);  // 添加 currentUser 作為依賴

  useEffect(() => {
    if (requirementsData && !loading && academicYear && studentType) {
      updateRequirementsBasedOnSelection();
      
      // 本機儲存作為備份
      localStorage.setItem("masterCourseRequirementState", JSON.stringify({
        checked,
        studentType,
        track,
        academicYear
      }));
      
      updateProgress();
    }
    // eslint-disable-next-line
  }, [checked, studentType, track, academicYear, requirementsData, loading]);

  function handleCheck(id) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function updateProgress() {
    // 此處保持原函數內容不變
    if (!requirements) return;

    const categories = requirements.categories;

    // 統計所有有 courses 的類別（排除 thesis）
    let completed = 0;
    let total = 0;
    let thesisCompleted = 0;
    let thesisTotal = 0;

    Object.entries(categories).forEach(([key, cat]) => {
      if (cat.courses && key !== "thesis") {
        cat.courses.forEach(c => {
          total += c.credit;
          if (checked[c.id]) completed += c.credit;
        });
      }
      if (key === "thesis" && cat.courses) {
        cat.courses.forEach(c => {
          thesisTotal += c.credit;
          if (checked[c.id]) thesisCompleted += c.credit;
        });
      }
    });

    // 計算各分區完成狀態
    let sectionCompleted = [];
    
    if (studentType === "partTime") {
      // 在職專班：必修、選修 (2區)
      sectionCompleted = [
        (() => {
          const cat = categories.required;
          if (!cat) return false;
          let sum = 0;
          cat.courses.forEach(c => { if (checked[c.id]) sum += c.credit; });
          return sum >= cat.required;
        })(),
        (() => {
          const cat = categories.elective;
          if (!cat) return false;
          let sum = 0;
          cat.courses.forEach(c => { if (checked[c.id]) sum += c.credit; });
          return sum >= cat.required;
        })()
      ];
    } else if (track === "ai") {
      // 人工智慧組：必修、必選、其他必修選修、其他畢業條件 (4區)
      sectionCompleted = [
        (() => {
          const cat = categories.required;
          if (!cat) return false;
          let sum = 0;
          cat.courses.forEach(c => { if (checked[c.id]) sum += c.credit; });
          return sum >= cat.required;
        })(),
        (() => {
          const cat = categories.requiredAI;
          if (!cat) return false;
          let sum = 0, count = 0;
          cat.courses.forEach(c => { if (checked[c.id]) { sum += c.credit; count++; } });
          if (cat.minCourses) {
            return count >= cat.minCourses && sum >= cat.required;
          }
          return sum >= cat.required;
        })(),
        (() => {
          const cat = categories.generalElective;
          if (!cat) return false;
          let sum = 0;
          cat.courses.forEach(c => { if (checked[c.id]) sum += c.credit; });
          return sum >= cat.required;
        })(),
        (() => {
          const cat = categories.additionalRequirements;
          if (!cat) return false;
          let ok = 0;
          cat.requirements.forEach(r => { if (checked[r.id]) ok++; });
          return ok >= cat.required;
        })()
      ];
    } else if (track === "ecommerce") {
      // 電子商務組：必修、必修EC、必選EC、選修、其他畢業條件 (5區)
      sectionCompleted = [
        (() => {
          const cat = categories.required;
          if (!cat) return false;
          let sum = 0;
          cat.courses.forEach(c => { if (checked[c.id]) sum += c.credit; });
          return sum >= cat.required;
        })(),
        (() => {
          const cat = categories.requiredEC;
          if (!cat) return false;
          let sum = 0;
          cat.courses.forEach(c => { if (checked[c.id]) sum += c.credit; });
          return sum >= cat.required;
        })(),
        (() => {
          const cat = categories.requiredECElective;
          if (!cat) return false;
          let sum = 0, count = 0;
          cat.courses.forEach(c => { if (checked[c.id]) { sum += c.credit; count++; } });
          if (cat.minCourses) {
            return count >= cat.minCourses && sum >= cat.required;
          }
          return sum >= cat.required;
        })(),
        (() => {
          const cat = categories.elective;
          if (!cat) return false;
          let sum = 0;
          cat.courses.forEach(c => { if (checked[c.id]) sum += c.credit; });
          return sum >= cat.required;
        })(),
        (() => {
          const cat = categories.additionalRequirements;
          if (!cat) return false;
          let ok = 0;
          cat.requirements.forEach(r => { if (checked[r.id]) ok++; });
          return ok >= cat.required;
        })()
      ];
    }

    // 計算百分比
    const totalSections = sectionCompleted.length;
    const completedSections = sectionCompleted.filter(Boolean).length;
    let percent = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

    setProgress({
      completed,
      total,
      thesisCompleted,
      thesisTotal,
      percent: Math.round(percent)
    });
  }

  function launchFirework() {
    setShowFirework(true);
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.7 }
    });
    // 2秒後自動隱藏煙火
    if (fireworkTimeout.current) clearTimeout(fireworkTimeout.current);
    fireworkTimeout.current = setTimeout(() => setShowFirework(false), 2000);
  }

  function calculateProgress() {
    // 此處保持原函數內容不變
    if (!requirements) return;

    let result = [];
    
    // 檢查論文要求
    const thesisCat = requirements.categories.thesis;
    let thesisCompleted = 0;
    let missingThesis = [];
    
    thesisCat.courses.forEach(c => {
      if (checked[c.id]) thesisCompleted += c.credit;
      else missingThesis.push(c);
    });
    
    if (thesisCompleted < thesisCat.required) {
      result.push({
        name: thesisCat.name,
        need: thesisCat.required - thesisCompleted,
        courses: missingThesis,
        requirements: []
      });
    }
    
    // 檢查英語授課課程要求
    if (studentType === "regular" && requirements.categories.additionalRequirements) {
      const additionalRequirements = {...checked};
      
      // 自動檢查英語授課課程是否已達標
      let hasEnglishCourse = false;
      
      // 檢查所有課程，查看是否有修過英語授課的課程
      Object.entries(requirements.categories).forEach(([key, category]) => {
        if (category.courses) {
          category.courses.forEach(course => {
            if (course.isEnglishTaught && checked[course.id]) {
              hasEnglishCourse = true;
            }
          });
        }
      });
      
      // 如果有修過英語授課課程，自動設置為已完成
      if (hasEnglishCourse) {
        additionalRequirements.englishCourse = true;
      }
      
      // 檢查額外的畢業條件
      const additionalCat = requirements.categories.additionalRequirements;
      let completedRequirements = 0;
      let missingRequirements = [];
      
      additionalCat.requirements.forEach(req => {
        if (additionalRequirements[req.id]) {
          completedRequirements++;
        } else {
          missingRequirements.push(req);
        }
      });
      
      if (completedRequirements < additionalCat.required) {
        result.push({
          name: additionalCat.name,
          needRequirements: additionalCat.required - completedRequirements,
          requirements: missingRequirements,
          courses: []
        });
      }
    }
    
    // For categories with minCourses requirement
    const categoryCheckMinCourses = (category, key) => {
      if (!category.minCourses || !category.courses || key === "thesis") return null;
      
      let completedCourses = 0;
      let completedCredits = 0;
      let missingCourses = [];
      
      category.courses.forEach(c => {
        if (checked[c.id]) {
          completedCourses++;
          completedCredits += c.credit;
        } else {
          missingCourses.push(c);
        }
      });
      
      if (completedCourses < category.minCourses || completedCredits < category.required) {
        return {
          name: category.name,
          need: Math.max(category.required - completedCredits, 0),
          needCourses: Math.max(category.minCourses - completedCourses, 0),
          description: category.description,
          courses: missingCourses,
          requirements: []
        };
      }
      return null;
    };
    
    // For regular categories
    const categoryCheck = (category, key) => {
      if (category.minCourses || category.type === "checkboxes" || !category.courses || key === "thesis") return null;
      
      let completed = 0;
      let missingCourses = [];
      
      category.courses.forEach(c => {
        if (checked[c.id]) completed += c.credit;
        else missingCourses.push(c);
      });
      
      if (completed < category.required) {
        return {
          name: category.name,
          need: category.required - completed,
          courses: missingCourses,
          requirements: []
        };
      }
      return null;
    };
    
    // Check all categories
    Object.entries(requirements.categories).forEach(([key, category]) => {
      if (key === "additionalRequirements" || key === "thesis") return;
      
      const minCoursesResult = categoryCheckMinCourses(category, key);
      if (minCoursesResult) {
        result.push(minCoursesResult);
        return;
      }
      
      const regularCategoryResult = categoryCheck(category, key);
      if (regularCategoryResult) {
        result.push(regularCategoryResult);
      }
    });
    
    setMissing(result);
    setShowResult(true);

    // 若全部完成，觸發煙火
    if (result.length === 0) {
      launchFirework();
    }
  }

  // 將 useEffect 放在這裡
  useEffect(() => {
    if (showFirework) {
      const canvas = document.getElementById("firework-canvas");
      if (canvas) {
        confetti.create(canvas, { resize: true, useWorker: true })({
          particleCount: 200,
          spread: 120,
          origin: { y: 0.7 }
        });
      }
    }
  }, [showFirework]);

  // 獲取固定的學群選項
  const getAvailableTracks = () => {
    if (studentType === "regular") {
      return [
        { value: "ai", label: "人工智慧學群" },
        { value: "ecommerce", label: "電子商務學群" }
      ];
    }
    return [];
  };

  return (
    <div style={style}>
      <style>{`
        .main-layout {
          display: flex;
          gap: 20px;
        }
        .left-content {
          flex: 1;
        }
        .right-panel {
          width: 300px;
          position: sticky;
          top: 20px;
          height: fit-content;
        }
        .query-panel {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }
        .rule-container {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }
        .course-category {
          margin-bottom: 25px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 15px;
          background-color: #fafafa;
        }
        .course-category h3 {
          background-color: #3498db;
          color: white;
          margin: -15px -15px 15px -15px;
          padding: 10px 15px;
          border-radius: 6px 6px 0 0;
          font-size: 1.1em;
        }
        .course-item {
          display: flex;
          align-items: center;
          padding: 10px;
          margin: 5px 0;
          border-radius: 6px;
          background-color: white;
          border: 1px solid #e0e0e0;
          transition: all 0.2s;
        }
        .course-item:hover {
          background-color: #f8f9fa;
          border-color: #3498db;
        }
        .course-item label {
          margin-left: 12px;
          flex-grow: 1;
          cursor: pointer;
          line-height: 1.4;
        }
        .course-item input[type="checkbox"] {
          cursor: pointer;
          width: 20px;
          height: 20px;
          accent-color: #3498db;
        }
        .credit {
          color: #7f8c8d;
          font-size: 0.9em;
          font-weight: bold;
          margin-left: 10px;
        }
        .course-code {
          color: #2980b9;
          font-size: 0.8em;
          margin-left: 8px;
          background-color: #ecf0f1;
          padding: 2px 6px;
          border-radius: 3px;
        }
        .english-tag {
          background-color: #e74c3c;
          color: white;
          font-size: 0.7em;
          padding: 3px 8px;
          border-radius: 4px;
          margin-left: 8px;
          font-weight: bold;
        }
        button {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: all 0.3s;
          margin-right: 10px;
          margin-bottom: 10px;
        }
        button:hover { 
          background-color: #2980b9; 
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .query-button {
          background-color: #27ae60;
          width: 100%;
          margin-top: 15px;
        }
        .query-button:hover { background-color: #229954; }
        .summary { 
          margin-top: 20px; 
          font-weight: bold; 
          font-size: 1.1em;
          color: #2c3e50;
        }
        .thesis-summary { 
          margin-top: 10px; 
          font-weight: bold;
          color: #9b59b6;
          font-size: 1em;
        }
        .remaining-course {
          padding: 10px;
          margin: 5px 0;
          background-color: #fff5f5;
          border: 1px solid #fed7d7;
          border-radius: 6px;
        }
        .completed { 
          background-color: #e8f7f3 !important; 
          border-color: #27ae60 !important;
        }
        .completed input[type="checkbox"] {
          accent-color: #27ae60;
        }
        .progress-container {
          margin-top: 20px;
          background-color: #ecf0f1;
          border-radius: 12px;
          height: 24px;
          overflow: hidden;
          border: 1px solid #bdc3c7;
        }
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, ${progress.percent < 100 ? "#e74c3c, #c0392b" : "#27ae60, #2ecc71"});
          width: ${progress.percent}%;
          transition: width 0.5s, background 0.5s;
          border-radius: 12px 0 0 12px;
        }
        .selector-container {
          display: flex;
          margin-bottom: 15px;
          gap: 10px;
        }
        .query-selector-container {
          margin-bottom: 15px;
        }
        .selector {
          padding: 12px;
          flex: 1;
          border-radius: 6px;
          border: 2px solid #ddd;
          font-size: 16px;
          font-family: 'Microsoft JhengHei', Arial, sans-serif;
          transition: border-color 0.3s;
        }
        .selector:focus {
          border-color: #3498db;
          outline: none;
        }
        .query-selector {
          width: 100%;
          padding: 12px;
          border-radius: 6px;
          border: 2px solid #ddd;
          font-size: 16px;
          font-family: 'Microsoft JhengHei', Arial, sans-serif;
          transition: border-color 0.3s;
        }
        .query-selector:focus {
          border-color: #3498db;
          outline: none;
        }
        .description {
          font-style: italic;
          color: #7f8c8d;
          margin: 8px 0 12px;
          font-size: 0.9em;
          background-color: #f8f9fa;
          padding: 8px;
          border-radius: 4px;
          border-left: 4px solid #3498db;
        }
        .requirement-item {
          display: flex;
          padding: 12px;
          margin: 5px 0;
          border-radius: 6px;
          background-color: white;
          border: 1px solid #e0e0e0;
          align-items: flex-start;
          transition: all 0.2s;
        }
        .requirement-item:hover {
          background-color: #f8f9fa;
          border-color: #3498db;
        }
        .requirement-item label {
          margin-left: 12px;
          flex-grow: 1;
          cursor: pointer;
        }
        .requirement-item input[type="checkbox"] {
          width: 20px;
          height: 20px;
          margin-top: 4px;
          cursor: pointer;
          accent-color: #3498db;
        }
        .requirement-description {
          font-size: 0.9em;
          color: #555;
          margin-top: 6px;
          line-height: 1.4;
        }
        input[type="checkbox"] {
          width: 20px !important;
          height: 20px !important;
          min-width: 20px;
          min-height: 20px;
          box-sizing: border-box;
        }
        .loading-message {
          text-align: center;
          padding: 40px;
          color: #7f8c8d;
          font-size: 1.1em;
        }
        .error-message {
          text-align: center;
          padding: 40px;
          color: #e74c3c;
          background-color: #fdf2f2;
          border-radius: 8px;
          border: 1px solid #fecaca;
        }
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
          box-sizing: border-box;
        }
        .modal-content {
          background-color: white;
          padding: 25px;
          border-radius: 12px;
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          border: 1px solid #ddd;
          box-sizing: border-box;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #ecf0f1;
          padding-bottom: 12px;
        }
        .modal-header h3 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.2em;
        }
        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #7f8c8d;
          padding: 0;
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        }
        .close-button:hover {
          background-color: #ecf0f1;
          color: #e74c3c;
          transform: none;
          box-shadow: none;
        }
        .form-group {
          margin-bottom: 18px;
        }
        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: bold;
          color: #2c3e50;
          font-size: 14px;
        }
        .form-group input[type="text"],
        .form-group input[type="number"] {
          width: 100%;
          padding: 10px;
          border: 2px solid #ddd;
          border-radius: 6px;
          font-size: 15px;
          font-family: 'Microsoft JhengHei', Arial, sans-serif;
          transition: border-color 0.3s;
          box-sizing: border-box;
          background-color: #fff;
        }
        .form-group input[type="text"]:focus,
        .form-group input[type="number"]:focus {
          border-color: #3498db;
          outline: none;
          box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
        }
        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 0;
        }
        .checkbox-group input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #e74c3c;
          cursor: pointer;
        }
        .checkbox-group label {
          margin: 0;
          cursor: pointer;
          font-weight: normal;
          color: #2c3e50;
          font-size: 14px;
        }
        .modal-buttons {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 25px;
          padding-top: 18px;
          border-top: 1px solid #ecf0f1;
        }
        .modal-button {
          padding: 10px 22px;
          border: none;
          border-radius: 6px;
          font-size: 15px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          min-width: 90px;
          font-family: 'Microsoft JhengHei', Arial, sans-serif;
        }
        .cancel-button {
          background-color: #95a5a6;
          color: white;
        }
        .cancel-button:hover {
          background-color: #7f8c8d;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .save-button {
          background-color: #27ae60;
          color: white;
        }
        .save-button:hover {
          background-color: #229954;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .save-button:disabled {
          background-color: #bdc3c7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        /* 管理者按鈕樣式 */
        .admin-buttons {
          display: flex;
          gap: 8px;
          margin-left: 12px;
        }
        .admin-button {
          padding: 4px 10px;
          font-size: 13px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s;
          color: white;
        }
        .edit-button {
          background-color: #f39c12;
        }
        .edit-button:hover {
          background-color: #e67e22;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .delete-button {
          background-color: #e74c3c;
        }
        .delete-button:hover {
          background-color: #c0392b;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        /* 登入狀態顯示 */
        .user-status {
          background-color: #f8f9fa;
          padding: 10px;
          border-radius: 6px;
          margin-top: 15px;
          font-size: 14px;
          border: 1px solid #e9ecef;
        }
        .user-status.logged-in {
          background-color: #e8f7f3;
          border-color: #27ae60;
        }
        .user-status.logged-out {
          background-color: #fff5f5;
          border-color: #fed7d7;
        }
        @media (max-width: 768px) {
          .main-layout {
            flex-direction: column;
          }
          .right-panel {
            width: 100%;
            position: static;
          }
          .modal-content {
            margin: 20px;
            width: calc(100% - 40px);
          }
        }
      `}</style>
      
      <h1>修業規則及畢業條件檢核</h1>
      
      <div className="main-layout">
        <div className="left-content">
          {/* 錯誤狀態處理 */}
          {error && (
            <div className="rule-container">
              <div className="error-message">
                <p>{error}</p>
                <button onClick={fetchRequirementsData}>重新載入</button>
              </div>
            </div>
          )}

          {/* 載入狀態處理 */}
          {loading && (
            <div className="rule-container">
              <div className="loading-message">
                <p>正在載入修業規則資料...</p>
              </div>
            </div>
          )}

          {/* 修課進度 */}
          {requirements && !loading && (
            <div className="container" style={{ position: "relative" }}>
              {/* 右上角重置與儲存按鈕 */}
              <div style={{ position: "absolute", top: 16, right: 16, zIndex: 2, display: "flex", gap: 8 }}>
                <button
                  style={{
                    background: "#e74c3c",
                    color: "white",
                    fontWeight: "bold"
                  }}
                  onClick={() => {
                    if (confirm("確定要清除所有選擇的課程嗎？")) {
                      setChecked({});
                      setShowResult(false);
                    }
                  }}
                >
                  重置所有選擇
                </button>
                <button
                  style={{
                    background: "#27ae60",
                    color: "white",
                    fontWeight: "bold"
                  }}
                  onClick={saveUserData}
                >
                  儲存
                </button>
              </div>
              <h2>您的修課進度 - {requirements?.name}</h2>
              
              {/* 顯示用戶登入狀態 */}
              <div className={`user-status ${currentUser ? "logged-in" : "logged-out"}`}>
                {currentUser ? (
                  <div>
                    <strong>當前登入用戶:</strong> {currentUser.displayName || currentUser.email}
                    {adminMode && (
                      <span style={{ 
                        marginLeft: 10, 
                        backgroundColor: "#e67e22", 
                        color: "white", 
                        padding: "2px 8px", 
                        borderRadius: "4px", 
                        fontSize: "12px",
                        fontWeight: "bold"
                      }}>
                        管理員
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <strong>未登入狀態</strong> - 請登入以儲存您的選課資料至個人帳戶
                  </div>
                )}
              </div>
              
              <div className="progress-container">
                <div className="progress-bar"></div>
              </div>
              <div className="summary">
                已完成: {progress.completed} 學分 / 應修學分: {requirements?.totalCredits - 6 || 0} 學分 ({progress.percent}%)
              </div>
              <div className="thesis-summary">
                論文學分: {progress.thesisCompleted} / {progress.thesisTotal} 學分 (不計入總學分)
              </div>
            </div>
          )}
          
          {/* 修業規定 */}
          {requirements && !loading && (
            <div className="rule-container">
              <h2>修業規定</h2>
              <p>請勾選您已經修過的課程：</p>
              <div id="course-list">
                {/* 先顯示論文 */}
                {requirements.categories.thesis && (
                  <div className="course-category" key="thesis">
                    <h3>
                      {requirements.categories.thesis.name}
                      {requirements.categories.thesis.required && `（需${requirements.categories.thesis.required}學分）`}
                    </h3>
                    {requirements.categories.thesis.description && (
                      <p className="description">{requirements.categories.thesis.description}</p>
                    )}
                    {requirements.categories.thesis.courses && requirements.categories.thesis.courses.map(course => (
                      <div
                        className={`course-item${checked[course.id] ? " completed" : ""}`}
                        key={course.id}
                      >
                        <input
                          type="checkbox"
                          id={course.id}
                          checked={!!checked[course.id]}
                          onChange={() => handleCheck(course.id)}
                        />
                        <label htmlFor={course.id}>
                          {course.name}
                          <span className="credit">({course.credit}學分)</span>
                          <span className="course-code">[{course.code}]</span>
                          {course.isEnglishTaught && <span className="english-tag">英語授課</span>}
                        </label>
                        {adminMode && (
                          <div className="admin-buttons">
                            <button
                              className="admin-button edit-button"
                              onClick={() => handleEditCourse(course, "thesis")}
                            >
                              編輯
                            </button>
                            <button
                              className="admin-button delete-button"
                              onClick={() => handleDeleteCourse(course, "thesis")}
                            >
                              刪除
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {/* 其他類別（排除 thesis 與 additionalRequirements） */}
                {Object.entries(requirements.categories)
                  .filter(([key]) => key !== "thesis" && key !== "additionalRequirements")
                  .map(([key, category]) => (
                  <div className="course-category" key={key}>
                    <h3>
                      {category.name}
                      {category.required && (
                        <>
                          {category.minCourses
                            ? `（至少選修${category.minCourses}門課，需${category.required}學分）`
                            : `（需${category.required}學分）`}
                        </>
                      )}
                    </h3>
                    {category.description && (
                      <p className="description">{category.description}</p>
                    )}
                    {category.courses && category.courses.map(course => (
                      <div
                        className={`course-item${checked[course.id] ? " completed" : ""}`}
                        key={course.id}
                      >
                        <input
                          type="checkbox"
                          id={course.id}
                          checked={!!checked[course.id]}
                          onChange={() => handleCheck(course.id)}
                        />
                        <label htmlFor={course.id}>
                          {course.name}
                          <span className="credit">({course.credit}學分)</span>
                          <span className="course-code">[{course.code}]</span>
                          {course.isEnglishTaught && <span className="english-tag">英語授課</span>}
                        </label>
                        {adminMode && (
                          <div className="admin-buttons">
                            <button
                              className="admin-button edit-button"
                              onClick={() => handleEditCourse(course, key)}
                            >
                              編輯
                            </button>
                            <button
                              className="admin-button delete-button"
                              onClick={() => handleDeleteCourse(course, key)}
                            >
                              刪除
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
                {/* 最後顯示其他畢業條件 */}
                {requirements.categories.additionalRequirements && (
                  <div className="course-category" key="additionalRequirements">
                    <h3>
                      {requirements.categories.additionalRequirements.name}
                      {requirements.categories.additionalRequirements.required && `（需完成${requirements.categories.additionalRequirements.required}項）`}
                    </h3>
                    {requirements.categories.additionalRequirements.description && (
                      <p className="description">{requirements.categories.additionalRequirements.description}</p>
                    )}
                    {requirements.categories.additionalRequirements.requirements && requirements.categories.additionalRequirements.requirements.map(req => (
                      <div className="requirement-item" key={req.id}>
                        <input
                          type="checkbox"
                          id={req.id}
                          checked={!!checked[req.id]}
                          onChange={() => handleCheck(req.id)}
                        />
                        <label htmlFor={req.id}>
                          {req.name}
                          <div className="requirement-description">{req.description}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button id="calculate-btn" onClick={calculateProgress}>
                計算修業進度
              </button>
            </div>
          )}
          
          {/* 尚未修完的課程 */}
          {showResult && (
            <div id="remaining-courses" className="container">
              <h2>尚未修完的課程</h2>
              <div id="remaining-list">
                {missing.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#e8f7f3', borderRadius: '8px' }}>
                    <h3 style={{ color: '#27ae60' }}>🎉 恭喜您已完成所有修業要求！ 🎉</h3>
                  </div>
                ) : (
                  missing.map((cat, index) => (
                    <div key={index} style={{ marginBottom: '20px' }}>
                      <h3 style={{ color: '#e74c3c' }}>
                        {cat.name}
                        {cat.need > 0 && `（尚需 ${cat.need} 學分）`}
                        {cat.needCourses > 0 && `（尚需選修 ${cat.needCourses} 門課）`}
                        {cat.needRequirements > 0 && `（尚需完成 ${cat.needRequirements} 項條件）`}
                      </h3>
                      {cat.description && (
                        <p className="description">{cat.description}</p>
                      )}
                      {cat.courses && cat.courses.map(course => (
                        <div className="remaining-course" key={course.id}>
                          <strong>{course.name}</strong> ({course.credit}學分) <span className="course-code">[{course.code}]</span>
                          {course.isEnglishTaught && <span className="english-tag">英語授課</span>}
                        </div>
                      ))}
                      {cat.requirements && cat.requirements.map(req => (
                        <div className="remaining-course" key={req.id}>
                          <strong>{req.name}</strong>: {req.description}
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 右側查詢面板 */}
        <div className="right-panel">
          <div className="query-panel">
            <h3>查詢修業規則</h3>
            
            {/* 學年度選擇 */}
            <div className="query-selector-container">
              <label htmlFor="year-selector" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                學年度:
              </label>
              <select 
                id="year-selector"
                className="query-selector" 
                value={academicYear} 
                onChange={(e) => setAcademicYear(e.target.value)}
              >
                <option value="">請選擇學年度</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year} 學年度</option>
                ))}
              </select>
            </div>

            {/* 學生類型選擇 */}
            <div className="query-selector-container">
              <label htmlFor="student-type-selector" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                學生類型:
              </label>
              <select 
                id="student-type-selector"
                className="query-selector" 
                value={studentType} 
                onChange={(e) => {
                  const newType = e.target.value;
                  setStudentType(newType);
                  
                  // 如果選擇在職專班，自動設定為 standard
                  if (newType === "partTime") {
                    setTrack("standard");
                  } else if (newType === "regular") {
                    // 一般生需要手動選擇學群，清空 track
                    setTrack("");
                  }
                }}
              >
                <option value="regular">一般生</option>
                <option value="partTime">在職專班</option>
              </select>
            </div>

            {/* 學群選擇 - 只有一般生才顯示 */}
            {studentType === "regular" && (
              <div className="query-selector-container">
                <label htmlFor="track-selector" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  學群:
                </label>
                <select 
                  id="track-selector"
                  className="query-selector" 
                  value={track} 
                  onChange={(e) => setTrack(e.target.value)}
                >
                  <option value="">請選擇學群</option>
                  {getAvailableTracks().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 查詢按鈕 */}
            <button 
              className="query-button" 
              onClick={fetchRequirementsData}
              disabled={loading}
            >
              {loading ? "載入中..." : "查詢修業規則"}
            </button>

            {/* 查詢狀態顯示 */}
            {requirementsData && requirements && (
              <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                <small style={{ color: '#6c757d', fontWeight: 'bold' }}>
                  目前顯示：{academicYear} 學年度 - {requirements?.name || '載入中...'}
                </small>
              </div>
            )}

            {/* 管理者功能區塊 - 只有管理員才顯示 */}
            {adminMode && currentUser && (
              <div style={{ marginTop: 20, padding: 15, backgroundColor: "#fff3cd", borderRadius: 8, border: "1px solid #ffeaa7" }}>
                <h4 style={{ margin: "0 0 15px 0", color: "#e67e22" }}>
                  🔧 管理者功能
                  <span style={{ 
                    marginLeft: 10, 
                    fontSize: "12px", 
                    color: "#666",
                    fontWeight: "normal"
                  }}>
                    (僅管理員可見)
                  </span>
                </h4>
                
                {/* 下載模板 */}
                <div style={{ marginBottom: 15 }}>
                  <button
                    style={{ 
                      backgroundColor: "#74b9ff",
                      fontSize: 14,
                      padding: "8px 16px"
                    }}
                    onClick={downloadTemplate}
                  >
                    📥 下載 Excel 模板
                  </button>
                  <p style={{ 
                    fontSize: 12, 
                    color: "#555", 
                    margin: "5px 0 0 0", 
                    lineHeight: 1.4 
                  }}>
                    下載標準格式的 Excel 模板檔案
                  </p>
                </div>

                {/* 檔案上傳 */}
                <div>
                  <input
                    type="file"
                    ref={input => setUploadFileInput(input)}
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                  <button
                    style={{ 
                      backgroundColor: isUploading ? "#95a5a6" : "#00b894",
                      fontSize: 14,
                      padding: "8px 16px",
                      cursor: isUploading ? "not-allowed" : "pointer"
                    }}
                    onClick={() => uploadFileInput?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? "⏳ 上傳中..." : "📤 上傳課程資料"}
                  </button>
                  <p style={{ 
                    fontSize: 12, 
                    color: "#555", 
                    margin: "5px 0 0 0", 
                    lineHeight: 1.4 
                  }}>
                    上傳 Excel 檔案來批量更新課程資料<br/>
                    <strong>注意：</strong>資料從第3行開始讀取，第1行為欄位標題，第2行為範例說明
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 編輯課程彈窗 */}
      {showEditModal && editingCourse && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>編輯課程</h3>
              <button
                className="close-button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCourse(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="form-group">
              <label htmlFor="course-id">課程 ID:</label>
              <input
                type="text"
                id="course-id"
                value={editingCourse.id || ""}
                onChange={(e) =>
                  setEditingCourse({ ...editingCourse, id: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="course-name">課程名稱:</label>
              <input
                type="text"
                id="course-name"
                value={editingCourse.name || ""}
                onChange={(e) =>
                  setEditingCourse({ ...editingCourse, name: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="course-credit">學分數:</label>
              <input
                type="number"
                id="course-credit"
                value={editingCourse.credit || ""}
                onChange={(e) =>
                  setEditingCourse({ ...editingCourse, credit: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="course-code">課程代碼:</label>
              <input
                type="text"
                id="course-code"
                value={editingCourse.code || ""}
                onChange={(e) =>
                  setEditingCourse({ ...editingCourse, code: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="english-taught"
                  checked={!!editingCourse.isEnglishTaught}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      isEnglishTaught: e.target.checked,
                    })
                  }
                />
                <label htmlFor="english-taught">英語授課</label>
              </div>
            </div>
            <div className="modal-buttons">
              <button
                className="modal-button cancel-button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCourse(null);
                }}
              >
                取消
              </button>
              <button
                className="modal-button save-button"
                onClick={handleSaveCourse}
                disabled={loading}
              >
                {loading ? "儲存中..." : "儲存"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 煙火動畫覆蓋層 */}
      {showFirework && (
        <div style={{
          position: "fixed",
          zIndex: 9999,
          left: 0, top: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.2)",
          pointerEvents: "none"
        }}>
          <canvas
            id="firework-canvas"
            style={{
              position: "fixed",
              left: 0, top: 0, width: "100vw", height: "100vh",
              pointerEvents: "none"
            }}
          />
        </div>
      )}
    </div>
  );
}