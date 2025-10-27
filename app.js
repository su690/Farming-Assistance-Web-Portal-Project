// src/pages/InstructorHome.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import CourseCard from "../../components/CourseCard";
import { AppContext } from "../../context/AppContext";

const API_BASE = "/api/v1";

export default function InstructorHome() {
  const { currentUser } = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_BASE}/courses`)
      .then((res) => setCourses(res.data.courses || res.data))
      .catch((err) => console.error("Error fetching courses:", err));
  }, []);

  useEffect(() => {
    if (currentUser?.id) {
      axios
        .get(`${API_BASE}/enrollments?userId=${currentUser.id}`)
        .then((res) => {
          const enrollments = res.data || [];
          const studentEnrollments = enrollments.filter(e => String(e.student_id) === String(currentUser.id));
          setEnrolledCourses(studentEnrollments.map(e => e.course_id));
        })
        .catch((err) => console.error("Error fetching enrollments:", err));
    }
  }, [currentUser]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-purple-700">Welcome back, {currentUser?.name}!</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => {
          const isEnrolled = enrolledCourses.includes(course.id);
          const isOwnCourse = course.instructorId === currentUser?.id;
          return (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled={isEnrolled}
              isOwnCourse={isOwnCourse}
            />
          );
        })}
      </div>
    </div>
  );
}



// src/pages/InstructorDashboard.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../../context/AppContext";

const API_BASE = "/api/v1";

export default function InstructorDashboard() {
  const { currentUser } = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.id) {
      axios
        .get(`${API_BASE}/courses?instructorId=${currentUser.id}`)
        .then((res) => setCourses(res.data.courses || res.data))
        .catch((err) => console.error("Error fetching instructor courses", err));
    }
  }, [currentUser]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Instructor Dashboard</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => navigate("/create-course")}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          + Create New Course
        </button>
        <button
          onClick={() => navigate("/create-assessment")}
          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          + Create New Assessment
        </button>
        <button
          onClick={() => navigate("/create-announcement")}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Create New Announcement
        </button>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition"
            >
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-40 object-cover rounded mb-3"
              />
              <h2 className="text-lg font-semibold">{course.title}</h2>
              <p className="text-indigo-600 font-bold">{course.price}</p>
              <button
                onClick={() => navigate(`/edit-course/${course.id}`)}
                className="mt-3 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Edit Course
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 mt-4">
          You haven’t created any courses yet.
        </p>
      )}
    </div>
  );
}


// src/pages/CreateCourse.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

//  Extract YouTube ID from link
function extractYouTubeId(url) {
  try {
    const regExp =
      /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  } catch {
    return null;
  }
}

const API_BASE = "/api/v1";

const CreateCourse = () => {
  const navigate = useNavigate();
  const { currentUser } = useAppContext();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [lectures, setLectures] = useState([]);

  // lecture inputs
  const [lectureTitle, setLectureTitle] = useState("");
  const [lectureDuration, setLectureDuration] = useState("");
  const [lectureLink, setLectureLink] = useState("");

  // add lecture
  const handleAddLecture = () => {
    const videoId = extractYouTubeId(lectureLink);
    if (!videoId) {
      return;
    }

    const newLecture = {
      title: lectureTitle,
      duration: lectureDuration,
      youtubeId: videoId,
    };

    setLectures([...lectures, newLecture]);
    setLectureTitle("");
    setLectureDuration("");
    setLectureLink("");
  };

  // submit course
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newCourse = {
      // id will be auto-generated by mockserver
      title,
      description,
      price: `₹${Number(price)}`,
      image,
      rating: 0,
      instructor: currentUser ? currentUser.name : "Instructor",
      instructorId: currentUser?.id,
    };

    try {
      const courseRes = await axios.post(`${API_BASE}/courses`, newCourse);
      const courseId = courseRes.data.id;

      // Create resources for each lecture
      for (const lecture of lectures) {
        const resource = {
          courseId,
          title: lecture.title,
          duration: lecture.duration,
          youtubeId: lecture.youtubeId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: currentUser?.id,
          updated_by: currentUser?.id,
          version: 1,
        };
        await axios.post(`${API_BASE}/resources`, resource);
      }

      toast.success("Course created successfully!");
      navigate("/instructor-dashboard"); // redirect
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Error creating course");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">Create a New Course</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium">Course Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full border rounded-md p-2"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full border rounded-md p-2"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium">Price (₹)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full border rounded-md p-2"
            required
          />
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-medium">Course Image URL</label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="mt-1 w-full border rounded-md p-2"
            required
          />
        </div>

        {/* Add Lecture */}
        <div className="p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Add Lecture</h3>
          <input
            type="text"
            placeholder="Lecture Title"
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            className="w-full mb-2 border rounded-md p-2"
          />
          <input
            type="text"
            placeholder="Duration"
            value={lectureDuration}
            onChange={(e) => setLectureDuration(e.target.value)}
            className="w-full mb-2 border rounded-md p-2"
          />
          <input
            type="text"
            placeholder="YouTube Link"
            value={lectureLink}
            onChange={(e) => setLectureLink(e.target.value)}
            className="w-full mb-2 border rounded-md p-2"
          />
          <button
            type="button"
            onClick={handleAddLecture}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            ➕ Add Lecture
          </button>

          {/* List of lectures */}
          <ul className="mt-3 list-disc pl-6 text-sm">
            {lectures.map((lec, index) => (
              <li key={index}>
                {lec.title} ({lec.duration}) →{" "}
                <span className="font-mono">{lec.youtubeId}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
        >
          ✅ Create Course
        </button>
      </form>
    </div>
  );
};

export default CreateCourse;


// src/pages/EditCourse.jsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleEditVideos = () => {
    navigate(`/edit-course/${id}/videos`);
  };

  const handleEditAssessments = () => {
    navigate(`/edit-course/${id}/assessments`);
  };

  return (
    <div className="max-w-3xl mx-auto p-8 mt-14 bg-white shadow-xl rounded-2xl text-center">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-4">
        Edit Course
      </h2>
      <p className="mb-8 text-gray-500 text-lg">
        Choose what you want to edit for this course:
      </p>

      <div className="flex flex-col md:flex-row justify-center gap-8">
        <div
          onClick={handleEditVideos}
          className="cursor-pointer flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-6 rounded-2xl shadow-md hover:shadow-2xl hover:scale-105 transition duration-300"
        >
          <span className="text-4xl mb-2">🎬</span>
          <span className="font-semibold text-lg">Edit Course Videos</span>
        </div>

        <div
          onClick={handleEditAssessments}
          className="cursor-pointer flex flex-col items-center justify-center bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-6 rounded-2xl shadow-md hover:shadow-2xl hover:scale-105 transition duration-300"
        >
          <span className="text-4xl mb-2">📝</span>
          <span className="font-semibold text-lg">Edit Assessments</span>
        </div>
      </div>
    </div>
  );
};

export default EditCourse;


// src/pages/EditCourseVideos.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';

function extractYouTubeId(url) {
  try {
    const regExp =
      /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  } catch {
    return null;
  }
}

const API_BASE = "/api/v1";

const EditCourseVideos = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [resources, setResources] = useState([]);
  const [lectureTitle, setLectureTitle] = useState("");
  const [lectureDuration, setLectureDuration] = useState("");
  const [lectureLink, setLectureLink] = useState("");

  useEffect(() => {
    axios.get(`${API_BASE}/courses/${id}`)
      .then(res => setCourse(res.data))
      .catch(err => console.error(err));

    axios.get(`${API_BASE}/resources?courseId=${id}`)
      .then(res => setResources(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!course) return <p className="text-center mt-5">Loading course...</p>;

  const handleCourseChange = e => setCourse({ ...course, [e.target.name]: e.target.value });

  const handleAddResource = async () => {
    const videoId = extractYouTubeId(lectureLink);
    if (!videoId) return console.log("Invalid YouTube link");

    const newResource = {
      courseId: id,
      title: lectureTitle,
      duration: lectureDuration,
      youtubeId: videoId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: course.instructorId,
      updated_by: course.instructorId,
      version: 1,
    };

    try {
      const res = await axios.post(`${API_BASE}/resources`, newResource);
      setResources([...resources, res.data]);
      setLectureTitle(""); setLectureDuration(""); setLectureLink("");
    } catch (err) {
      console.error("Error adding resource:", err);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    try {
      await axios.delete(`${API_BASE}/resources/${resourceId}`);
      setResources(resources.filter(res => res.id !== resourceId));
    } catch (err) {
      console.error("Error deleting resource:", err);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/courses/${id}`, course);
      toast.success("Course updated successfully!");
      navigate("/instructor-dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Error updating course");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">Edit Course Videos</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="title" value={course.title} onChange={handleCourseChange} className="w-full border p-2 rounded" placeholder="Course Title" required />
        <textarea name="description" value={course.description} onChange={handleCourseChange} className="w-full border p-2 rounded" placeholder="Description" required />
        <input type="text" name="image" value={course.image} onChange={handleCourseChange} className="w-full border p-2 rounded" placeholder="Image URL" required />
        
        <div className="border p-4 rounded bg-gray-50">
          <h3 className="font-semibold">Resources</h3>
          <ul>
            {resources.map((res, idx) => (
              <li key={res.id} className="flex justify-between p-1 bg-gray-100 rounded mb-1">
                {res.title} ({res.duration})
                <button type="button" onClick={() => handleDeleteResource(res.id)} className="text-red-600">❌</button>
              </li>
            ))}
          </ul>

          <input placeholder="Title" value={lectureTitle} onChange={(e) => setLectureTitle(e.target.value)} className="w-full border p-1 rounded my-1"/>
          <input placeholder="Duration" value={lectureDuration} onChange={(e) => setLectureDuration(e.target.value)} className="w-full border p-1 rounded my-1"/>
          <input placeholder="YouTube Link" value={lectureLink} onChange={(e) => setLectureLink(e.target.value)} className="w-full border p-1 rounded my-1"/>
          <button type="button" onClick={handleAddResource} className="bg-blue-600 text-white px-2 py-1 rounded mt-1">Add Resource</button>
        </div>

        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Save Videos</button>
      </form>
    </div>
  );
};

export default EditCourseVideos;
