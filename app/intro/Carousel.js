import { useState } from "react";
import Page from "./page";
import Page1 from "./page1";
import Page2 from "./page2";
import Pages3 from "./pages3";

export default function Carousel() {
    const [currentPage, setCurrentPage] = useState(0);

    // 將需要輪播的頁面組成陣列
    const pages = [<Page key="page" />, <Page1 key="page1" />, <Page2 key="page2" />, <Pages3 key="pages3" />];

    const nextPage = () => {
        setCurrentPage((prevPage) => (prevPage + 1) % pages.length);
    };

    const prevPage = () => {
        setCurrentPage((prevPage) => (prevPage - 1 + pages.length) % pages.length);
    };

    return (
        <div className="container mx-auto p-4">
            <div className="carousel">{pages[currentPage]}</div>
            <div className="mt-4 flex justify-between">
                <button
                    className="px-4 py-2 bg-gray-300 rounded"
                    onClick={prevPage}
                >
                    Previous
                </button>
                <button
                    className="px-4 py-2 bg-gray-300 rounded"
                    onClick={nextPage}
                >
                    Next
                </button>
            </div>
        </div>
    );
}