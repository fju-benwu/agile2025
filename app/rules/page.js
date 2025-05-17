"use client";
import React, { useEffect, useState, useRef } from "react";

// Define the requirements for different programs
const requirementsData = {
  regular: {
    ai: {
      name: "人工智慧學群",
      categories: {
        thesis: {
          name: "論文",
          required: 6,
          courses: [
            { id: "thesis", name: "論文 (Thesis)", credit: 6, code: "00041" }
          ]
        },
        required: {
          name: "必修課程",
          required: 9,
          courses: [
            { id: "course1", name: "高等資料庫 (Advanced Database Management)", credit: 3, code: "07939" },
            { id: "course2", name: "高等資訊管理 (Advanced Information Management)", credit: 3, code: "16910" },
            { id: "course3", name: "企業倫理 (Reading in Business Ethics for Managers)", credit: 2, code: "00292" },
            { id: "course4", name: "資訊管理講座 (Seminar on Information Management)", credit: 1, code: "16654" }
          ]
        },
        requiredAI: {
          name: "人工智慧學群必選課程",
          required: 9,
          minCourses: 3,
          description: "至少取得3科學分(5選3)",
          courses: [
            { id: "course5", name: "巨量資料探勘 (Big Data Mining)", credit: 3, code: "24501" },
            { id: "course6", name: "機器學習 (Machine Learning)", credit: 3, code: "13027" },
            { id: "course7", name: "人工智慧 (Artificial Intelligence)", credit: 3, code: "01016" },
            { id: "course8", name: "深度學習導論與應用 (Deep Learning and its Applications)", credit: 3, code: "32134" },
            { id: "course9", name: "物聯網概論與應用 (Internet of Things)", credit: 3, code: "33034" }
          ]
        },
        requiredOther: {
          name: "其他必修課程",
          required: 9,
          courses: [
            { id: "course10", name: "電子商務總論 (General Topics on Electronic Commerce)", credit: 3, code: "09290" },
            { id: "course11", name: "網路行銷專題 (Special Topics on Internet Marketing)", credit: 3, code: "23666" },
            { id: "course12", name: "金融科技與金融行銷 (Financial Technology and Marketing)", credit: 3, code: "35555" },
            { id: "course13", name: "研究方法 (Research Methodology)", credit: 3, code: "01799" },
            { id: "course14", name: "電子採購與物流專題 (Special Topics on Electronic Procurement and Logistic)", credit: 2, code: "23668" }
          ]
        },
        elective: {
          name: "選修課程",
          required: 12,
          courses: [
            { id: "course15", name: "資訊系統專案管理 (Information System Project Management)", credit: 3, code: "11799" },
            { id: "course16", name: "軟體工程 (Software Engineering)", credit: 3, code: "03024" },
            { id: "course17", name: "使用者經驗設計 (User Experience Design)", credit: 3, code: "33856" },
            { id: "course18", name: "敏捷式軟體開發 (Agile Software Development)", credit: 3, code: "32133" },
            { id: "course19", name: "資訊安全 (Data Security)", credit: 3, code: "04623" },
            { id: "course20", name: "服務科學專題 (Special Topics on Service Science)", credit: 3, code: "20229" },
            { id: "course21", name: "知識管理 (Knowledge Management)", credit: 3, code: "10849" },
            { id: "course22", name: "全球運籌與供應鏈 (Global Logistics and Supply Chain)", credit: 3, code: "35551", isEnglishTaught: true },
            { id: "course23", name: "決策分析 (Decision Analysis)", credit: 3, code: "24103", isEnglishTaught: true },
            { id: "course24", name: "人工智慧產業實務 (Industry Practices in Artificial Intelligence)", credit: 3, code: "32135" }
          ]
        },
        // 新增其他畢業條件
        additionalRequirements: {
          name: "其他畢業條件",
          type: "checkboxes",
          required: 4,
          requirements: [
            { 
              id: "english", 
              name: "英文能力", 
              description: "入學前未達 CEFR B2（如 TOEIC 785、TOEFL iBT 72、IELTS 6.0 等）者，須於碩一結束前參加檢定。若仍未達標，畢業前需再考一次，並登錄成績（不論是否達標）。" 
            },
            { 
              id: "programming", 
              name: "程式機測", 
              description: "必須通過。未通過者需補修程式設計相關課程，及格後方可畢業。" 
            },
            { 
              id: "makeup", 
              name: "補修課程", 
              description: "若大學部未修過「系統分析與設計」，需補修下列任一課程：系統分析與設計（大學部）、軟體工程、敏捷式軟體開發" 
            },
            { 
              id: "englishCourse", 
              name: "英語授課課程", 
              description: "至少修畢 1 門本院開設之碩士班「以英語授課的專業課程」。",
              autoCalculate: true 
            }
          ]
        }
      },
      totalCredits: 36
    },
    ecommerce: {
      name: "電子商務學群",
      categories: {
        thesis: {
          name: "論文",
          required: 6,
          courses: [
            { id: "thesis", name: "論文 (Thesis)", credit: 6, code: "00041" }
          ]
        },
        required: {
          name: "必修課程",
          required: 9,
          courses: [
            { id: "course1", name: "高等資料庫 (Advanced Database Management)", credit: 3, code: "07939" },
            { id: "course2", name: "高等資訊管理 (Advanced Information Management)", credit: 3, code: "16910" },
            { id: "course3", name: "企業倫理 (Reading in Business Ethics for Managers)", credit: 2, code: "00292" },
            { id: "course4", name: "資訊管理講座 (Seminar on Information Management)", credit: 1, code: "16654" }
          ]
        },
        requiredEC: {
          name: "電子商務學群必修課程",
          required: 3,
          courses: [
            { id: "course25", name: "電子商務總論 (General Topics on Electronic Commerce)", credit: 3, code: "09290" }
          ]
        },
        requiredECElective: {
          name: "電子商務學群必選課程",
          required: 8,
          minCourses: 3,
          description: "至少取得3科學分(5選3)",
          courses: [
            { id: "course11", name: "網路行銷專題 (Special Topics on Internet Marketing)", credit: 3, code: "23666" },
            { id: "course12", name: "金融科技與金融行銷 (Financial Technology and Marketing)", credit: 3, code: "35555" },
            { id: "course13", name: "研究方法 (Research Methodology)", credit: 3, code: "01799" },
            { id: "course9", name: "物聯網概論與應用 (Internet of Things)", credit: 3, code: "33034" },
            { id: "course14", name: "電子採購與物流專題 (Special Topics on Electronic Procurement and Logistic)", credit: 2, code: "23668" }
          ]
        },
        elective: {
          name: "選修課程",
          required: 10,
          courses: [
            { id: "course15", name: "資訊系統專案管理 (Information System Project Management)", credit: 3, code: "11799" },
            { id: "course5", name: "巨量資料探勘 (Big Data Mining)", credit: 3, code: "24501" },
            { id: "course6", name: "機器學習 (Machine Learning)", credit: 3, code: "13027" },
            { id: "course7", name: "人工智慧 (Artificial Intelligence)", credit: 3, code: "01016" },
            { id: "course8", name: "深度學習導論與應用 (Deep Learning and its Applications)", credit: 3, code: "32134" },
            { id: "course16", name: "軟體工程 (Software Engineering)", credit: 3, code: "03024" },
            { id: "course17", name: "使用者經驗設計 (User Experience Design)", credit: 3, code: "33856" },
            { id: "course18", name: "敏捷式軟體開發 (Agile Software Development)", credit: 3, code: "32133" },
            { id: "course19", name: "資訊安全 (Data Security)", credit: 3, code: "04623" },
            { id: "course20", name: "服務科學專題 (Special Topics on Service Science)", credit: 3, code: "20229" },
            { id: "course21", name: "知識管理 (Knowledge Management)", credit: 3, code: "10849" },
            { id: "course22", name: "全球運籌與供應鏈 (Global Logistics and Supply Chain)", credit: 3, code: "35551", isEnglishTaught: true },
            { id: "course23", name: "決策分析 (Decision Analysis)", credit: 3, code: "24103", isEnglishTaught: true },
            { id: "course24", name: "人工智慧產業實務 (Industry Practices in Artificial Intelligence)", credit: 3, code: "32135" }
          ]
        },
        // 新增其他畢業條件
        additionalRequirements: {
          name: "其他畢業條件",
          type: "checkboxes",
          required: 4,
          requirements: [
            { 
              id: "english", 
              name: "英文能力", 
              description: "入學前未達 CEFR B2（如 TOEIC 785、TOEFL iBT 72、IELTS 6.0 等）者，須於碩一結束前參加檢定。若仍未達標，畢業前需再考一次，並登錄成績（不論是否達標）。" 
            },
            { 
              id: "programming", 
              name: "程式機測", 
              description: "必須通過。未通過者需補修程式設計相關課程，及格後方可畢業。" 
            },
            { 
              id: "makeup", 
              name: "補修課程", 
              description: "若大學部未修過「系統分析與設計」，需補修下列任一課程：系統分析與設計（大學部）、軟體工程、敏捷式軟體開發" 
            },
            { 
              id: "englishCourse", 
              name: "英語授課課程", 
              description: "至少修畢 1 門本院開設之碩士班「以英語授課的專業課程」。",
              autoCalculate: true 
            }
          ]
        }
      },
      totalCredits: 36
    }
  },
  partTime: {
    // 在職專班沒有分組，直接定義一個統一的課程規定
    standard: {
      name: "資訊管理系碩士在職專班",
      categories: {
        thesis: {
          name: "論文",
          required: 6,
          courses: [
            { id: "thesis", name: "論文 (Thesis)", credit: 6, code: "00041" }
          ]
        },
        required: {
          name: "院系必修課程",
          required: 15, // <--- 這裡改為 15 學分
          courses: [
            { id: "pt_course1", name: "整合管理 (Integration Management)", credit: 3, code: "12486" },
            { id: "pt_course2", name: "管理資訊系統 (Management Information Systems)", credit: 3, code: "02631" },
            { id: "pt_course3", name: "研究方法 (Research Methodology)", credit: 3, code: "01799" },
            { id: "pt_course4", name: "電子商務總論 (General Topics on Electronic Commerce)", credit: 3, code: "09290" },
            { id: "pt_course5", name: "人工智慧與分析 (Artificial Intelligence and Analytics)", credit: 3, code: "36639" }
          ]
        },
        elective: {
          name: "選修課程",
          required: 9,
          courses: [
            { id: "pt_course6", name: "資訊安全 (Data Security)", credit: 3, code: "04623" },
            { id: "pt_course7", name: "資訊系統專案管理 (Information System Project Management)", credit: 3, code: "11799" },
            { id: "pt_course8", name: "服務科學專題 (Special Topics on Service Science)", credit: 3, code: "20229" },
            { id: "pt_course9", name: "深度學習導論與應用 (Deep Learning and its Applications)", credit: 3, code: "32134" },
            { id: "pt_course10", name: "敏捷式軟體開發 (Agile Software Development)", credit: 3, code: "32133" },
            { id: "pt_course11", name: "使用者經驗設計 (User Experience Design)", credit: 3, code: "33856" },
            { id: "pt_course12", name: "決策分析 (Decision Analysis)", credit: 3, code: "24103" },
            { id: "pt_course13", name: "國際產業分析 (International Industry Analysis)", credit: 3, code: "04060" },
            { id: "pt_course14", name: "國際專業參訪 (International Field Trip)", credit: 3, code: "23396" },
            { id: "pt_course15", name: "企業永續資訊策略 (Information Strategy for Sustainable Development)", credit: 3, code: "36638" },
            { id: "pt_course16", name: "機器學習 (Machine Learning)", credit: 3, code: "13207" },
            { id: "pt_course17", name: "數位金融與區塊鏈 (Digital Finance and BlockChain)", credit: 3, code: "31356" },
            { id: "pt_course18", name: "醫療健康大數據分析與應用 (Big Data Analytics in Medical and Healthcare)", credit: 3, code: "34637" },
            { id: "pt_course19", name: "企業程序再造 (Business Process Reengineering)", credit: 3, code: "09638" }
          ]
        }
      },
      totalCredits: 30
    }
  }
};

const style = {
  fontFamily: "'Microsoft JhengHei', Arial, sans-serif",
  maxWidth: 800,
  margin: "0 auto",
  padding: 20,
  backgroundColor: "#f5f5f5"
};

// 若未安裝請先執行：npm install canvas-confetti
import confetti from "canvas-confetti";

export default function RulesPage() {
  const [studentType, setStudentType] = useState("regular");
  const [track, setTrack] = useState("ai");
  const [checked, setChecked] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [missing, setMissing] = useState([]);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percent: 0 });
  const [requirements, setRequirements] = useState(requirementsData.regular.ai);
  const [showFirework, setShowFirework] = useState(false);
  const fireworkTimeout = useRef(null);
  
  // 在職專班沒有分組，使用固定的 'standard' 作為 track

  useEffect(() => {
    // 載入 localStorage
    const saved = localStorage.getItem("masterCourseRequirementState");
    if (saved) {
      const savedState = JSON.parse(saved);
      setChecked(savedState.checked || {});
      setStudentType(savedState.studentType || "regular");
      setTrack(savedState.track || "ai");
    }
  }, []);

  useEffect(() => {
    // 根據選擇的學生類型和學群更新課程要求
    if (studentType === "partTime") {
      // 在職專班沒有分組，固定使用 'standard'
      setRequirements(requirementsData[studentType].standard);
    } else {
      setRequirements(requirementsData[studentType][track]);
    }
    
    // 儲存 localStorage
    localStorage.setItem("masterCourseRequirementState", JSON.stringify({
      checked,
      studentType,
      track
    }));
    
    updateProgress();
    // eslint-disable-next-line
  }, [checked, studentType, track]);

  function handleCheck(id) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function updateProgress() {
    if (!requirements) return;

    // 只抓必修與選修
    const categories = requirements.categories;
    let sections = [
      categories.required, // 必修
      categories.elective  // 選修
    ];

    let sectionCompleted = [false, false];

    // 學分統計
    let completed = 0;
    let total = 0;
    let thesisCompleted = 0;
    let thesisTotal = 0;

    // 必修
    if (sections[0]) {
      let sum = 0;
      sections[0].courses.forEach(c => {
        total += c.credit;
        if (checked[c.id]) {
          sum += c.credit;
          completed += c.credit;
        }
      });
      if (sum >= sections[0].required) sectionCompleted[0] = true;
    }

    // 選修
    if (sections[1]) {
      let sum = 0;
      sections[1].courses.forEach(c => {
        total += c.credit;
        if (checked[c.id]) {
          sum += c.credit;
          completed += c.credit;
        }
      });
      if (sum >= sections[1].required) sectionCompleted[1] = true;
    }

    // 論文學分（不計入總學分）
    if (categories.thesis) {
      categories.thesis.courses.forEach(c => {
        thesisTotal += c.credit;
        if (checked[c.id]) thesisCompleted += c.credit;
      });
    }

    // 計算百分比（每區 50%）
    let percent = sectionCompleted.filter(Boolean).length * 50;

    setProgress({
      completed,
      total,
      thesisCompleted,
      thesisTotal,
      percent
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
        requirements: [] // Add an empty requirements array to maintain consistent structure
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
          courses: [] // Add an empty courses array to maintain consistent structure
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
          requirements: [] // Add an empty requirements array to maintain consistent structure
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
          requirements: [] // Add an empty requirements array to maintain consistent structure
        };
      }
      return null;
    };
    
    // Check all categories
    Object.entries(requirements.categories).forEach(([key, category]) => {
      if (key === "additionalRequirements" || key === "thesis") return; // Already processed above
      
      const minCoursesResult = categoryCheckMinCourses(category, key); // 傳入 key
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

  return (
    <div style={style}>
                <style>{`
        .container {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }
        .course-category {
          margin-bottom: 20px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        .course-item {
          display: flex;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .course-item:last-child { border-bottom: none; }
        .course-item label {
          margin-left: 10px;
          flex-grow: 1;
          cursor: pointer;
        }
        .course-item input[type="checkbox"] {
          cursor: pointer;
          width: 18px;
          height: 18px;
        }
        .credit {
          color: #7f8c8d;
          font-size: 0.9em;
          margin-left: 10px;
        }
        .course-code {
          color: #2980b9;
          font-size: 0.8em;
          margin-left: 8px;
        }
        .english-tag {
          background-color: #e74c3c;
          color: white;
          font-size: 0.7em;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: 8px;
          vertical-align: middle;
        }
        button {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.3s;
          margin-right: 10px;
        }
        button:hover { background-color: #2980b9; }
        .summary { margin-top: 20px; font-weight: bold; }
        .thesis-summary { 
          margin-top: 8px; 
          font-weight: bold;
          color: #9b59b6;
        }
        .remaining-course {
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .remaining-course:last-child { border-bottom: none; }
        .completed { background-color: #e8f7f3; }
        .progress-container {
          margin-top: 20px;
          background-color: #ecf0f1;
          border-radius: 10px;
          height: 20px;
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          background-color: ${progress.percent < 100 ? "#e74c3c" : "#2ecc71"};
          width: ${progress.percent}%;
          transition: width 0.5s, background-color 0.5s;
        }
        .selector-container {
          display: flex;
          margin-bottom: 20px;
          gap: 10px;
        }
        .selector {
          padding: 10px;
          flex: 1;
          border-radius: 4px;
          border: 1px solid #ddd;
          font-size: 16px;
          font-family: 'Microsoft JhengHei', Arial, sans-serif;
        }
        .description {
          font-style: italic;
          color: #7f8c8d;
          margin: 5px 0 10px;
          font-size: 0.9em;
        }
        .requirement-item {
          display: flex;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
          align-items: flex-start;
        }
        .requirement-item:last-child { border-bottom: none; }
        .requirement-item label {
          margin-left: 10px;
          flex-grow: 1;
          cursor: pointer;
        }
        .requirement-item input[type="checkbox"] {
          width: 18px;
          height: 18px;
          margin-top: 4px;
          cursor: pointer;
        }
        .requirement-description {
          font-size: 0.9em;
          color: #555;
          margin-top: 4px;
        }
      `}</style>
      <h1>修業規則及畢業條件檢核</h1>
      
      <div className="container">
        <h2>選擇學生類型</h2>
        <div className="selector-container">
          <select 
            className="selector" 
            value={studentType} 
            onChange={(e) => {
              const newType = e.target.value;
              setStudentType(newType);
              
              // 如果選擇在職專班，自動設定為標準課程
              if (newType === "partTime") {
                setTrack("standard");
              }
            }}
          >
            <option value="regular">一般生</option>
            <option value="partTime">在職專班</option>
          </select>
          
          {studentType === "regular" && (
            <select 
              className="selector" 
              value={track} 
              onChange={(e) => setTrack(e.target.value)}
            >
              <option value="ai">人工智慧學群</option>
              <option value="ecommerce">電子商務學群</option>
            </select>
          )}
        </div>
      </div>
      
      <div className="container" style={{ position: "relative" }}>
        {/* 右上角重置按鈕 */}
        <button
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 2,
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
        <h2>您的修課進度 - {requirements?.name}</h2>
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
      
      <div className="container">
        <h2>修業規定</h2>
        <p>請勾選您已經修過的課程：</p>
        <div id="course-list">
          {requirements && Object.entries(requirements.categories).map(([key, category]) => (
            <div className="course-category" key={key}>
              <h3>
                {category.name}
                {category.required && ` (${category.minCourses ? `至少選修${category.minCourses}門課，` : ""}需${category.required}學分)`}
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
                  </label>
                </div>
              ))}
              {/* 這裡可以加上對 checkbox 類型的畢業條件的渲染 */}
              {category.type === "checkboxes" && category.requirements && category.requirements.map(req => (
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
          ))}
        </div>
        <button id="calculate-btn" onClick={calculateProgress}>
          計算修業進度
        </button>
      </div>
      
      {showResult && (
        <div id="remaining-courses" className="container">
          <h2>尚未修完的課程</h2>
          <div id="remaining-list">
            {missing.length === 0 ? (
              <p>恭喜您已完成所有修業要求！</p>
            ) : (
              missing.map((cat, index) => (
                <div key={index}>
                  <h3>
                    {cat.name}
                    {cat.need > 0 && `（尚需 ${cat.need} 學分）`}
                    {cat.needCourses > 0 && `（尚需選修 ${cat.needCourses} 門課）`}
                  </h3>
                  {cat.description && (
                    <p className="description">{cat.description}</p>
                  )}
                  {cat.courses.map(course => (
                    <div className="remaining-course" key={course.id}>
                      {course.name} ({course.credit}學分) <span className="course-code">[{course.code}]</span>
                    </div>
                  ))}
                </div>
              ))
            )}
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