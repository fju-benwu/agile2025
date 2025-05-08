import { useState } from "react";

export default function Page() {
    const [currentPage, setCurrentPage] = useState(0);

    const pages = [
        <div key="page1">
            <h1 className="text-2xl font-bold">Welcome to Page 1</h1>
            <p className="mt-4">This is the first page of the carousel.</p>
        </div>,
        <div key="page2">
            <h1 className="text-2xl font-bold">Welcome to Page 2</h1>
            <p className="mt-4">This is the second page of the carousel.</p>
        </div>,
        <div key="page3">
            <h1 className="text-2xl font-bold">Welcome to Page 3</h1>
            <p className="mt-4">This is the third page of the carousel.</p>
        </div>,
    ];

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
