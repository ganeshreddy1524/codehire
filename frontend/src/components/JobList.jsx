import { useState } from "react";

function JobList({ jobs, loading }) {
    const [visibleCount, setVisibleCount] = useState(6); // 👈 show first 6 jobs initially

    const logos = {
        linkedin: "https://cdn-icons-png.flaticon.com/512/174/174857.png",
        naukri:
            "https://play-lh.googleusercontent.com/76gEFhQto5xMHr2Qf8nWLvm1s0O60clhkwHvxQDSeI3hthf7Zs05JJQeyg5H347DGQ",
        glassdoor:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Glassdoor_logo.svg/1280px-Glassdoor_logo.svg.png",
    };

    // ✅ Loading skeletons
    if (loading) {
        return (
            <div className="w-full flex justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 md:w-[700px] w-[90%] max-w-6xl animate-pulse px-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="border p-6 rounded-xl shadow bg-gray-100 flex flex-col gap-4"
                        >
                            <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-5 bg-gray-300 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                            <div className="h-10 bg-gray-400 rounded w-28 mt-4"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ✅ No results
    if (!jobs || jobs.length === 0) {
        return <p className="text-center text-gray-600 mt-6 h-[20vh]">No jobs found</p>;
    }

    // ✅ Handle Load More
    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 6);
    };

    return (
        <div className="flex flex-col h-full items-center">
            {/* Job Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl px-4">
                {jobs.slice(0, visibleCount).map((job, idx) => (
                    <div
                        key={idx}
                        className="border p-6 rounded-xl shadow hover:shadow-md transition bg-white"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{job.title}</h2>
                                <p className="text-gray-700 mt-1">🏢 {job.company}</p>
                                <p className="text-gray-500 text-sm">📌 {job.location}</p>
                            </div>
                            {job.source && (
                                <img
                                    src={logos[job.source]}
                                    alt={job.source}
                                    className="w-10 h-10 object-contain"
                                />
                            )}
                        </div>
                        <a
                            href={job.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block mt-4 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
                        >
                            Apply
                        </a>
                    </div>
                ))}
            </div>

            {/* Load More Button */}
            {visibleCount < jobs.length && (
                <button
                    onClick={handleLoadMore}
                    className="mt-8 px-6 py-3 bg-gray-700 cursor-pointer text-white font-medium rounded-lg hover:bg-gray-800 transition"
                >
                    Show More
                </button>
            )}
        </div>
    );
}

export default JobList;
