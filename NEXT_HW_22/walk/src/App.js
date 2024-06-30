import React, { useEffect, useState } from 'react';
import areas from './areas.json'; // areas.json 파일을 import
import './App.css'; // App.css 파일을 import

const Walk = () => {
    const [selectedCourseLevel, setSelectedCourseLevel] = useState('초급');
    const [selectedArea, setSelectedArea] = useState('중구'); // 초기 위치 설정
    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        try {
            setLoading(true);
            setError(null);

            const apiKey = process.env.REACT_APP_API_KEY;
            const url = `http://openapi.seoul.go.kr:8088/${apiKey}/json/walkSesonInfo/1/100/`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('서버에서 JSON 형식의 응답을 제공하지 않습니다.');
            }

            const data = await response.json();
            console.log('API Response:', data);

            const filteredCourses = data.walkSesonInfo.row.filter((row) => {
                return row.COURSE_LEVEL === selectedCourseLevel && row.AREA_GU.includes(selectedArea);
            });

            if (filteredCourses.length > 0) {
                setCourseData(filteredCourses[0]);
                console.log('Selected Course Data:', filteredCourses[0]);
            } else {
                setCourseData(null);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleSearch();
    }, [selectedCourseLevel, selectedArea]);

    const handleCourseLevelChange = (e) => {
        setSelectedCourseLevel(e.target.value);
    };

    const handleAreaChange = (e) => {
        setSelectedArea(e.target.value);
    };

    return (
        <>
            <h1>&#x1F33F; 서울 둘레길 둘러보기 &#x1F33F;</h1>
            <div className="container">
                <div>
                    <label htmlFor="courseLevel">코스 레벨</label>
                    <select id="courseLevel" value={selectedCourseLevel} onChange={handleCourseLevelChange}>
                        <option value="초급">초급</option>
                        <option value="중급">중급</option>
                        <option value="고급">고급</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="area">위치</label>
                    <select id="area" value={selectedArea} onChange={handleAreaChange}>
                        {areas.areas.map((areaObj, index) => (
                            <option key={index} value={areaObj.area.split(',')[0]}>
                                {areaObj.area}
                            </option>
                        ))}
                    </select>
                </div>
                {loading && <p className="loading">Loading...</p>}
                {error && <p className="error">Error: {error}</p>}
                {courseData ? (
                    <div className="details">
                        <h2>{courseData.COURSE_NAME}</h2>
                        <h3>난이도: {courseData.COURSE_LEVEL[0]}</h3>
                        <p>소요시간: {courseData.LEAD_TIME}</p>
                        <p>경로: {courseData.DETAIL_COURSE}</p>
                    </div>
                ) : (
                    !loading && <p className="no-course">No course found for the selected level and area.</p>
                )}
            </div>
        </>
    );
};
export default Walk;
