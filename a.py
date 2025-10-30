import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useAppContext } from "../context/AppContext";

const Announcements = () => {
  const { currentUser, setAnnouncementCount } = useAppContext();
  const [announcements, setAnnouncements] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [readAnnouncements, setReadAnnouncements] = useState(new Set());

  const markAsRead = (announcementId) => {
    const newRead = new Set(readAnnouncements);
    newRead.add(announcementId);
    setReadAnnouncements(newRead);
    localStorage.setItem(`readAnnouncements_${currentUser?.id}`, JSON.stringify([...newRead]));
    // Update the global announcement count
    setAnnouncementCount(prev => Math.max(0, prev - 1));
  };

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (currentUser?.id) {
        try {
          const response = await fetch(`/api/v1/enrollments?userId=${currentUser.id}`);
          const data = await response.json();
          const enrolledCourseIds = data.map(e => e.course_id);
          setEnrolledCourses(enrolledCourseIds);
        } catch (error) {
          console.error('Failed to fetch enrollments:', error);
        }
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/v1/courses');
        const data = await response.json();
        const allCourses = data.courses || data;
        setCourses(allCourses);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };

    // Load read announcements from localStorage
    const storedRead = localStorage.getItem(`readAnnouncements_${currentUser?.id}`);
    if (storedRead) {
      setReadAnnouncements(new Set(JSON.parse(storedRead)));
    }

    fetchEnrollments();
    fetchCourses();
  }, [currentUser]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/v1/announcements');
        const data = await response.json();
        const allAnnouncements = data.announcements || data;
        // Filter announcements based on enrolled courses and expiration
        const filteredAnnouncements = allAnnouncements.filter(announcement =>
          enrolledCourses.includes(announcement.courseId) &&
          new Date(announcement.expires_at) > new Date()
        );
        setAnnouncements(filteredAnnouncements.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      }
    };

    if (enrolledCourses.length > 0) {
      fetchAnnouncements();
    }
  }, [enrolledCourses]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Announcements</h2>
      {announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement) => {
            const course = courses.find(c => String(c.id) === String(announcement.courseId));
            const isRead = readAnnouncements.has(announcement.id);
            return (
              <div key={announcement.id} className={`p-4 bg-white rounded-lg shadow border ${isRead ? 'opacity-75' : ''}`}>
                <div className="flex justify-between items-start">
                  <h3 className={`font-semibold ${isRead ? 'text-gray-600' : 'text-gray-900'}`}>{announcement.title}</h3>
                  {!isRead && (
                    <button
                      onClick={() => markAsRead(announcement.id)}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
                <p className={`text-sm mt-1 ${isRead ? 'text-gray-600' : 'text-gray-800'}`}>{announcement.message}</p>
                {course && (
                  <p className="text-sm text-blue-600 mt-1">Course: {course.title}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Created: {new Date(announcement.created_at).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  Expires: {new Date(announcement.expires_at).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📢</div>
          <p className="text-gray-500 text-lg">No announcements yet.</p>
          <p className="text-gray-400 text-sm mt-2">
            Announcements for your enrolled courses will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default Announcements;
