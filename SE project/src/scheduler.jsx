import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaPlus,
  FaTrash,
  FaExclamationTriangle,
} from "react-icons/fa";

// --- Hardcoded Course Data (Replace with API fetch later) ---
const initialCourses = [
  {
    id: 1,
    code: "CS100",
    title: "Intro to Programming",
    credits: 3,
    instructor: "Dr. Smith",
    timings: [
      { day: "Mon", startTime: "09:00", endTime: "10:15" },
      { day: "Wed", startTime: "09:00", endTime: "10:15" },
    ],
  },
  {
    id: 2,
    code: "MATH101",
    title: "Calculus I",
    credits: 4,
    instructor: "Prof. Jones",
    timings: [
      { day: "Mon", startTime: "09:30", endTime: "11:45" },
      { day: "Thu", startTime: "10:30", endTime: "11:45" },
    ],
  },
  {
    id: 3,
    code: "PHYS110",
    title: "General Physics",
    credits: 4,
    instructor: "Dr. Lee",
    timings: [
      { day: "Mon", startTime: "13:00", endTime: "14:15" },
      { day: "Wed", startTime: "13:00", endTime: "14:15" },
    ],
  },
  {
    id: 4,
    code: "ECON201",
    title: "Microeconomics",
    credits: 3,
    instructor: "Prof. Davis",
    timings: [
      { day: "Tue", startTime: "14:30", endTime: "15:45" },
      { day: "Thu", startTime: "14:30", endTime: "15:45" },
    ],
  },
  {
    id: 5,
    code: "CS210",
    title: "Data Structures",
    credits: 3,
    instructor: "Dr. Smith",
    timings: [
      { day: "Mon", startTime: "10:30", endTime: "11:45" },
      { day: "Wed", startTime: "10:30", endTime: "11:45" },
    ],
  },
  {
    id: 6,
    code: "ENG101",
    title: "Composition",
    credits: 3,
    instructor: "Prof. Miller",
    timings: [{ day: "Fri", startTime: "09:00", endTime: "11:45" }],
  }, // Longer class
  {
    id: 7,
    code: "HIST105",
    title: "World History",
    credits: 3,
    instructor: "Dr. Garcia",
    timings: [
      { day: "Tue", startTime: "09:00", endTime: "10:15" },
      { day: "Thu", startTime: "09:00", endTime: "10:15" },
    ],
  },
  {
    id: 8,
    code: "CHEM101",
    title: "General Chemistry",
    credits: 4,
    instructor: "Prof. White",
    timings: [
      { day: "Mon", startTime: "14:30", endTime: "15:45" },
      { day: "Wed", startTime: "14:30", endTime: "15:45" },
    ],
  },
  {
    id: 9,
    code: "ART100",
    title: "Art Appreciation",
    credits: 3,
    instructor: "Ms. Evans",
    timings: [{ day: "Fri", startTime: "13:00", endTime: "15:45" }],
  },
  {
    id: 10,
    code: "CS350",
    title: "Operating Systems",
    credits: 3,
    instructor: "Dr. Brown",
    timings: [
      { day: "Tue", startTime: "13:00", endTime: "14:15" },
      { day: "Thu", startTime: "13:00", endTime: "14:15" },
    ],
  },
];

// --- Helper Functions ---

const timeToMinutes = (time) => {
  // Added safeguard for invalid time format
  if (!time || typeof time !== "string" || !time.includes(":")) {
    console.error("Invalid time format for timeToMinutes:", time);
    return 0; // Return a default value or handle appropriately
  }
  const parts = time.split(":");
  if (parts.length !== 2) {
    console.error("Invalid time format for timeToMinutes:", time);
    return 0;
  }
  const [hours, minutes] = parts.map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    console.error("Non-numeric time parts:", time);
    return 0;
  }
  return hours * 60 + minutes;
};

const doTimesOverlap = (slot1, slot2) => {
  // Add checks for valid slots
  if (
    !slot1?.startTime ||
    !slot1?.endTime ||
    !slot2?.startTime ||
    !slot2?.endTime
  ) {
    console.error("Invalid slot data for doTimesOverlap:", slot1, slot2);
    return false; // Assume no overlap if data is invalid
  }
  const start1 = timeToMinutes(slot1.startTime);
  const end1 = timeToMinutes(slot1.endTime);
  const start2 = timeToMinutes(slot2.startTime);
  const end2 = timeToMinutes(slot2.endTime);

  // Ensure end time is after start time
  if (end1 <= start1 || end2 <= start2) {
    //  console.warn("Slot end time is not after start time:", slot1, slot2); // Can be noisy
    // If end is same as start, they don't overlap in a meaningful way for scheduling
    return false;
  }

  // Check for overlap: !(slot1 ends before slot2 starts || slot1 starts after slot2 ends)
  // Simplified: (slot1 starts before slot2 ends) AND (slot1 ends after slot2 starts)
  return start1 < end2 && end1 > start2;
};

const checkConflict = (newCourse, existingSchedule) => {
  // Check if newCourse and timings are valid
  if (!newCourse?.timings || !Array.isArray(newCourse.timings)) {
    console.error("Invalid newCourse data for checkConflict:", newCourse);
    return null;
  }
  if (!Array.isArray(existingSchedule)) {
    console.error("Invalid existingSchedule data for checkConflict");
    return null; // Or handle as appropriate
  }

  for (const scheduledCourse of existingSchedule) {
    // Check if scheduledCourse and timings are valid
    if (!scheduledCourse?.timings || !Array.isArray(scheduledCourse.timings)) {
      console.warn("Invalid scheduled course data found:", scheduledCourse);
      continue; // Skip this potentially corrupted course
    }
    for (const newTiming of newCourse.timings) {
      if (!newTiming) continue; // Skip invalid timing slots in new course
      for (const scheduledTiming of scheduledCourse.timings) {
        if (!scheduledTiming) continue; // Skip invalid timing slots in scheduled course

        if (
          newTiming.day === scheduledTiming.day &&
          doTimesOverlap(newTiming, scheduledTiming)
        ) {
          console.log(
            `Conflict found: ${newCourse.code} (${newTiming.day} ${newTiming.startTime}-${newTiming.endTime}) vs ${scheduledCourse.code} (${scheduledTiming.day} ${scheduledTiming.startTime}-${scheduledTiming.endTime})`
          );
          return scheduledCourse;
        }
      }
    }
  }
  return null;
};

// --- Scheduler Component ---
const Scheduler = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [allCourses] = useState(initialCourses);
  const [scheduledCourses, setScheduledCourses] = useState([]);
  const [conflictError, setConflictError] = useState(null);

  const availableCourses = useMemo(() => {
    try {
      // Add try-catch around potentially complex derivations
      const scheduledIds = new Set(scheduledCourses.map((c) => c.id));
      return allCourses.filter(
        (course) =>
          course && // Ensure course object exists
          course.id != null && // Ensure id exists
          !scheduledIds.has(course.id) &&
          ((course.code &&
            course.code.toLowerCase().includes(searchTerm.toLowerCase())) || // Check if code exists
            (course.title &&
              course.title.toLowerCase().includes(searchTerm.toLowerCase())) || // Check if title exists
            (course.instructor &&
              course.instructor
                .toLowerCase()
                .includes(searchTerm.toLowerCase()))) // Check if instructor exists
      );
    } catch (error) {
      console.error("Error calculating availableCourses:", error);
      return []; // Return empty array on error
    }
  }, [allCourses, scheduledCourses, searchTerm]);

  const handleAddCourse = useCallback(
    (courseToAdd) => {
      console.log("handleAddCourse called with:", courseToAdd?.code); // Log input code
      if (!courseToAdd || courseToAdd.id == null) {
        // Basic validation
        console.error("Attempted to add invalid course object:", courseToAdd);
        return;
      }
      try {
        setConflictError(null);
        const conflictingCourse = checkConflict(courseToAdd, scheduledCourses);

        if (conflictingCourse) {
          console.warn(
            `Conflict detected: ${courseToAdd.code} clashes with ${conflictingCourse.code}`
          );
          setConflictError({ course: conflictingCourse, attempt: courseToAdd });
          // Use a key for the error message motion.div to ensure it re-animates on new error
          setTimeout(() => setConflictError(null), 5000);
        } else {
          console.log("No conflict found, adding course:", courseToAdd.code);
          setScheduledCourses((prevSchedule) => {
            // Ensure prevSchedule is an array
            const currentSchedule = Array.isArray(prevSchedule)
              ? prevSchedule
              : [];
            // Prevent adding duplicates (optional but good practice)
            if (currentSchedule.some((c) => c.id === courseToAdd.id)) {
              console.warn("Course already in schedule:", courseToAdd.code);
              return currentSchedule;
            }
            return [...currentSchedule, courseToAdd];
          });
          console.log(`Added ${courseToAdd.code} to schedule state.`);
        }
      } catch (error) {
        console.error("Error during handleAddCourse execution:", error);
        // Potentially set an error state to show a generic message to the user
      }
    },
    [scheduledCourses] // Keep dependency
  );

  const handleRemoveCourse = useCallback((courseIdToRemove) => {
    console.log("handleRemoveCourse called with ID:", courseIdToRemove);
    if (courseIdToRemove == null) {
      console.error("Attempted to remove course with null/undefined ID");
      return;
    }
    try {
      setScheduledCourses((prevSchedule) =>
        (Array.isArray(prevSchedule) ? prevSchedule : []).filter(
          (course) => course && course.id !== courseIdToRemove
        )
      );
      // Clear conflict error only if the removed course was part of the conflict
      setConflictError((prevError) => {
        if (
          prevError &&
          (prevError.course?.id === courseIdToRemove ||
            prevError.attempt?.id === courseIdToRemove)
        ) {
          return null;
        }
        return prevError;
      });
      console.log(`Removed course ID ${courseIdToRemove} from schedule state.`);
    } catch (error) {
      console.error("Error during handleRemoveCourse:", error);
    }
  }, []); // No dependency needed here as it only uses the ID

  // Grid Generation Data
  const days = useMemo(() => ["Mon", "Tue", "Wed", "Thu", "Fri"], []);
  const timeInterval = 30;
  const startTime = 8 * 60;
  const endTime = 18 * 60;
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let t = startTime; t < endTime; t += timeInterval) {
      const hours = Math.floor(t / 60);
      const minutes = t % 60;
      slots.push(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
      );
    }
    console.log("Generated Time Slots:", slots.length); // Check if slots are generated
    return slots;
  }, [startTime, endTime, timeInterval]); // Dependencies

  const scheduleGridData = useMemo(() => {
    // console.log("Recalculating scheduleGridData...");
    try {
      const grid = {};
      if (!Array.isArray(scheduledCourses)) {
        console.error("scheduledCourses is not an array in scheduleGridData");
        return {};
      }

      scheduledCourses.forEach((course) => {
        if (!course || course.id == null || !Array.isArray(course.timings)) {
          console.warn("Skipping invalid course in scheduleGridData:", course);
          return;
        }

        course.timings.forEach((timing) => {
          if (!timing || !timing.day || !timing.startTime || !timing.endTime) {
            console.warn(
              "Skipping invalid timing in scheduleGridData for course:",
              course.code,
              timing
            );
            return;
          }

          const startMinutes = timeToMinutes(timing.startTime);
          const endMinutes = timeToMinutes(timing.endTime);

          if (endMinutes <= startMinutes) {
            console.warn(
              `Invalid time range for ${course.code} on ${timing.day}: ${timing.startTime}-${timing.endTime}`
            );
            return;
          }

          const duration = endMinutes - startMinutes;
          // Ensure minimum duration is at least one interval for calculation
          if (duration <= 0) {
            console.warn(
              `Zero or negative duration for ${course.code} on ${timing.day}: ${timing.startTime}-${timing.endTime}`
            );
            return;
          }
          // Calculate slots, ensuring at least 1 if duration > 0
          const durationSlots = Math.max(1, Math.ceil(duration / timeInterval));

          // Find the index of the time slot that *contains* or *starts at* the course start time
          const startSlotIndex = timeSlots.findIndex((slot) => {
            const slotStartMinutes = timeToMinutes(slot);
            const slotEndMinutes = slotStartMinutes + timeInterval;
            // Course starts within this slot or exactly at the slot start
            return (
              startMinutes >= slotStartMinutes && startMinutes < slotEndMinutes
            );
          });

          if (startSlotIndex !== -1) {
            // Check if start time exactly matches a slot time for clean display, otherwise log warning maybe
            if (timeToMinutes(timeSlots[startSlotIndex]) !== startMinutes) {
              console.warn(
                `Course ${course.code} start time ${timing.startTime} doesn't align perfectly with time slot ${timeSlots[startSlotIndex]}. Display may be slightly offset.`
              );
            }

            const key = `${timing.day}-${timeSlots[startSlotIndex]}`;
            if (!course.code || !course.title) {
              console.warn("Course object missing code or title:", course);
              return;
            }
            // Prevent overwriting if multiple courses start in the exact same slot (shouldn't happen with conflict check)
            if (!grid[key]) {
              grid[key] = {
                course: { ...course }, // Shallow copy course data
                isStart: true,
                durationSlots: durationSlots,
              };

              // Mark subsequent slots as occupied
              for (let i = 1; i < durationSlots; i++) {
                const nextSlotIndex = startSlotIndex + i;
                if (nextSlotIndex < timeSlots.length) {
                  const occupiedKey = `${timing.day}-${timeSlots[nextSlotIndex]}`;
                  // Only mark as occupied if not already the start of another block
                  if (!grid[occupiedKey]?.isStart) {
                    grid[occupiedKey] = {
                      course: { ...course },
                      isStart: false,
                    };
                  }
                }
              }
            } else {
              console.warn(
                `Grid conflict detected at key ${key}. Course ${course.code} ignored.`
              );
            }
          } else {
            console.warn(
              `Could not find start slot index for ${course.code} at ${timing.startTime} on ${timing.day}`
            );
          }
        });
      });
      //   console.log("Generated Grid Data:", grid); // Log generated grid
      return grid;
    } catch (error) {
      console.error("Error calculating scheduleGridData:", error);
      return {};
    }
  }, [scheduledCourses, timeSlots, timeInterval]); // Dependencies

  // --- Render ---
  //   console.log("Scheduler rendering...");

  return (
    <div style={styles.container}>
      <motion.h1
        style={styles.header}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Course Scheduler
      </motion.h1>
      <div style={styles.mainContentWrapper}>
        <div style={styles.leftPanel}>
          <div style={styles.searchContainer}>
            <FaSearch style={styles.searchIcon} />
            <input
              className="search-input"
              type="text"
              placeholder="Search by Code, Title, or Instructor"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchBar}
            />
          </div>
          <div style={styles.availableCoursesContainer}>
            <h2 style={styles.listHeader}>Available Courses</h2>
            <AnimatePresence>
              {conflictError && (
                <motion.div
                  key="conflict-error-message" // Add key for animation
                  style={styles.errorBox}
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaExclamationTriangle
                    style={{
                      marginRight: "10px",
                      color: "#FBBF24",
                      flexShrink: 0,
                    }}
                  />
                  <span>
                    {" "}
                    {/* Wrap text for better flex handling */}
                    Cannot add {conflictError.attempt?.code || "course"}: Time
                    conflict with{" "}
                    {conflictError.course?.code || "another course"}.
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="scrollable-list" style={styles.scrollableList}>
              <AnimatePresence>
                {availableCourses.length > 0 ? (
                  availableCourses.map((course) => {
                    if (!course || course.id == null) return null;
                    return (
                      <motion.div
                        key={course.id} // Use ID as key
                        style={styles.courseItem}
                        layout // Animate layout changes on filter/add/remove
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }} // Faster transition
                      >
                        <div style={styles.courseInfo}>
                          <span style={styles.courseCode}>
                            {course.code || "N/A"}
                          </span>
                          <span style={styles.courseTitle}>
                            {course.title || "N/A"} (
                            {course.credits != null ? course.credits : "?"} Cr)
                          </span>
                          <span style={styles.courseInstructor}>
                            Instructor: {course.instructor || "N/A"}
                          </span>
                          <div style={styles.courseTimings}>
                            {Array.isArray(course.timings) &&
                              course.timings.map((t, i) =>
                                t ? (
                                  <span key={i} style={styles.timingChip}>
                                    {t.day || "?"} {t.startTime || "?"} -{" "}
                                    {t.endTime || "?"}
                                  </span>
                                ) : null
                              )}
                          </div>
                        </div>
                        <motion.button
                          style={styles.addButton}
                          onClick={() => handleAddCourse(course)}
                          whileHover={{
                            scale: 1.1,
                            backgroundColor: "#10B981",
                          }}
                          whileTap={{ scale: 0.9 }}
                          title={`Add ${course.code || "course"}`}
                        >
                          <FaPlus />
                        </motion.button>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.p
                    key="no-courses-found"
                    style={styles.noCoursesText}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {searchTerm
                      ? `No courses found matching "${searchTerm}".`
                      : "No available courses."}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>{" "}
        {/* End Left Panel */}
        <div style={styles.rightPanel}>
          <h2 style={styles.scheduleHeader}>Your Schedule</h2>
          <div className="grid-container" style={styles.gridContainer}>
            <table style={styles.scheduleTable}>
              <thead>
                <tr>
                  <th style={styles.timeHeader}>Time</th>
                  {days.map((day) => (
                    <th key={day} style={styles.dayHeader}>
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time}>
                    <td style={styles.timeCell}>{time}</td>
                    {days.map((day) => {
                      const key = `${day}-${time}`;
                      const cellData = scheduleGridData[key];

                      try {
                        if (cellData?.isStart) {
                          if (
                            !cellData.course ||
                            cellData.course.id == null ||
                            cellData.durationSlots == null ||
                            cellData.durationSlots <= 0
                          ) {
                            console.error(
                              "Invalid cellData for rendering course block:",
                              cellData,
                              key
                            );
                            return (
                              <td
                                key={key}
                                style={{
                                  ...styles.emptyCell,
                                  backgroundColor: "#500",
                                }}
                              >
                                Data Error
                              </td>
                            );
                          }
                          return (
                            <motion.td // Animate table cell appearance
                              key={key}
                              style={{
                                ...styles.courseCell,
                                ...styles.courseBlock(cellData.course.id),
                              }}
                              rowSpan={cellData.durationSlots}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                              layout // Animate position if needed
                            >
                              <div style={styles.courseBlockContent}>
                                <span style={styles.courseBlockCode}>
                                  {cellData.course.code || "N/A"}
                                </span>
                                <span style={styles.courseBlockTitle}>
                                  {cellData.course.title || "N/A"}
                                </span>
                              </div>
                              <motion.button
                                style={styles.removeButton}
                                onClick={() =>
                                  handleRemoveCourse(cellData.course.id)
                                }
                                title={`Remove ${
                                  cellData.course.code || "course"
                                }`}
                                whileHover={{
                                  scale: 1.2,
                                  color: "#EF4444",
                                  opacity: 1,
                                }}
                              >
                                <FaTrash />
                              </motion.button>
                            </motion.td>
                          );
                        } else if (cellData?.isStart === false) {
                          return null; // Cell occupied by rowspan
                        } else {
                          return <td key={key} style={styles.emptyCell}></td>; // Empty cell
                        }
                      } catch (error) {
                        console.error(`Error rendering cell ${key}:`, error);
                        return (
                          <td
                            key={key}
                            style={{
                              ...styles.emptyCell,
                              backgroundColor: "#500",
                            }}
                          >
                            Render Error
                          </td>
                        );
                      }
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {scheduledCourses.length > 0 && (
            <motion.button
              style={styles.clearButton}
              onClick={() => {
                setScheduledCourses([]);
                setConflictError(null);
              }}
              whileHover={{ scale: 1.05, backgroundColor: "#6B7280" }}
              whileTap={{ scale: 0.95 }}
            >
              Clear Schedule
            </motion.button>
          )}
        </div>{" "}
        {/* End Right Panel */}
      </div>{" "}
      {/* End Main Content Wrapper */}
    </div> // End Container
  );
}; // End Scheduler Component

// --- Styles Object ---
// --- Styles Object (Timetable Height Adjustments Highlighted) ---
const styles = {
  // ... (container, header, mainContentWrapper, leftPanel, search*, availableCourses*, listHeader, scrollableList, errorBox, courseItem styles remain the same as the previous corrected version) ...
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "100vh",
    minHeight: "600px",
    background: "radial-gradient(circle, #02013B, black)",
    color: "#D1D5DB",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  header: {
    fontSize: "clamp(1.8rem, 4vw, 2.2rem)",
    fontWeight: "600",
    padding: "20px 0",
    color: "#FFF",
    textAlign: "center",
    width: "100%",
    flexShrink: 0,
    boxSizing: "border-box",
  },
  mainContentWrapper: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    maxWidth: "1800px",
    padding: "0 20px 20px 20px",
    gap: "25px",
    alignItems: "stretch",
    flexWrap: "wrap",
    flexGrow: 1,
    overflow: "hidden",
    boxSizing: "border-box",
  },
  leftPanel: {
    flex: "1 1 400px",
    minWidth: "320px",
    maxWidth: "480px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    boxSizing: "border-box",
    overflow: "hidden",
    height: "100%",
  },
  searchContainer: { position: "relative", width: "100%", flexShrink: 0 },
  searchBar: {
    width: "100%",
    padding: "12px 20px 12px 45px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #4B5563",
    outline: "none",
    backgroundColor: "#1F2937",
    color: "#E5E7EB",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  searchIcon: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#6B7280",
    fontSize: "1.1rem",
  },
  availableCoursesContainer: {
    width: "100%",
    background: "#1F2937",
    borderRadius: "8px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    overflow: "hidden",
    padding: "15px 20px 0 20px",
    boxSizing: "border-box",
  },
  listHeader: {
    fontSize: "1.2rem",
    fontWeight: "500",
    color: "#9CA3AF",
    marginBottom: "15px",
    borderBottom: "1px solid #374151",
    paddingBottom: "8px",
    flexShrink: 0,
    paddingLeft: "5px",
    paddingRight: "5px",
  },
  scrollableList: {
    overflowY: "auto",
    flexGrow: 1,
    paddingRight: "10px",
    paddingLeft: "5px",
    boxSizing: "border-box",
  },
  errorBox: {
    background: "rgba(251, 191, 36, 0.1)",
    border: "1px solid #FBBF24",
    color: "#FDE68A",
    padding: "10px 15px",
    borderRadius: "6px",
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    fontSize: "0.9rem",
    flexShrink: 0,
  },
  courseItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #374151",
  },
  courseInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    overflow: "hidden",
    marginRight: "10px",
  },
  courseCode: { fontWeight: "600", color: "#FFF", fontSize: "1rem" },
  courseTitle: {
    fontSize: "0.9rem",
    color: "#D1D5DB",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  courseInstructor: { fontSize: "0.8rem", color: "#9CA3AF" },
  courseTimings: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
    marginTop: "5px",
  },
  timingChip: {
    background: "#374151",
    color: "#E5E7EB",
    fontSize: "0.75rem",
    padding: "2px 6px",
    borderRadius: "4px",
    whiteSpace: "nowrap",
  },
  addButton: {
    background: "#1D1C4F",
    color: "#FFF",
    border: "none",
    borderRadius: "50%",
    width: "35px",
    height: "35px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "background-color 0.2s, transform 0.1s",
    flexShrink: 0,
    marginLeft: "auto",
  },
  noCoursesText: {
    textAlign: "center",
    color: "#6B7280",
    padding: "20px",
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.9rem",
  },

  rightPanel: {
    // Unchanged - height/overflow is correct here
    flex: "2 1 600px",
    minWidth: "500px",
    display: "flex",
    flexDirection: "column",
    background: "#1F2937",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    boxSizing: "border-box",
    overflow: "hidden",
    height: "100%",
  },
  scheduleHeader: {
    /* Unchanged */ fontSize: "1.4rem",
    fontWeight: "500",
    color: "#E5E7EB",
    marginBottom: "20px",
    textAlign: "center",
    flexShrink: 0,
  },
  gridContainer: {
    // Keep overflow: 'auto' as a fallback for very small screens/windows
    // but the goal is to make the table fit *without* needing it.
    overflow: "auto",
    flexGrow: 1,
    position: "relative",
    boxSizing: "border-box",
    minHeight: "300px",
    // scrollbar styles in CSS file needed
  },
  scheduleTable: {
    /* Unchanged */ width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
    minWidth: "700px",
  },
  timeHeader: {
    /* Unchanged */ width: "70px",
    padding: "8px 4px",
    textAlign: "center",
    fontSize: "0.75rem",
    color: "#9CA3AF",
    border: "1px solid #374151",
    background: "#1F2937",
    position: "sticky",
    top: 0,
    zIndex: 3,
  },
  dayHeader: {
    /* Unchanged */ padding: "10px 5px",
    textAlign: "center",
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#D1D5DB",
    border: "1px solid #374151",
    background: "#1F2937",
    position: "sticky",
    top: 0,
    zIndex: 2,
  },

  // --- ADJUSTED ROW HEIGHTS AND PADDING ---
  timeCell: {
    width: "70px",
    padding: "2px 4px", // Reduced vertical padding
    textAlign: "center",
    fontSize: "0.65rem", // Reduced font size
    color: "#9CA3AF",
    border: "1px solid #374151",
    verticalAlign: "top",
    height: "22px", // *** SIGNIFICANTLY REDUCED HEIGHT *** (Adjust as needed)
    background: "#1F2937",
    position: "sticky",
    left: 0,
    zIndex: 1,
    boxSizing: "border-box", // Add box-sizing
  },
  emptyCell: {
    border: "1px solid #374151",
    height: "22px", // *** MATCH REDUCED HEIGHT ***
    padding: 0,
    margin: 0,
    background: "#1118270A",
    boxSizing: "border-box", // Add box-sizing
  },
  courseCell: {
    border: "1px solid", // Keep border base
    padding: "2px 4px", // Reduced vertical padding
    textAlign: "left",
    verticalAlign: "top",
    position: "relative",
    overflow: "hidden",
    height: "auto",
    cursor: "default",
    boxSizing: "border-box", // Add box-sizing
  },
  courseBlock: (courseId) => {
    // Unchanged color logic
    const colors = [
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#EC4899",
      "#6366F1",
    ];
    const index = (courseId || 0) % colors.length;
    return {
      backgroundColor: `${colors[index]}2A`,
      borderColor: `${colors[index]}80`,
      borderWidth: "1px",
    };
  },
  courseBlockContent: {
    // Unchanged
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "flex-start",
  },
  // --- ADJUSTED FONT SIZES IN BLOCKS ---
  courseBlockCode: {
    fontSize: "0.7rem", // Reduced font size
    fontWeight: "600",
    color: "#FFF",
    marginBottom: "1px", // Reduced margin
    lineHeight: "1.1", // Tighter line height
  },
  courseBlockTitle: {
    fontSize: "0.65rem", // Reduced font size
    color: "#E5E7EB",
    lineHeight: "1.1", // Tighter line height
    maxHeight: "2.2em", // Limit to roughly 2 lines (lineHeight * lines)
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "block",
  },
  removeButton: {
    // Unchanged - hover handled by motion
    position: "absolute",
    top: "2px",
    right: "2px",
    background: "rgba(0,0,0,0.2)",
    border: "none",
    color: "rgba(255, 255, 255, 0.4)",
    cursor: "pointer",
    padding: "1px 3px",
    fontSize: "0.7rem",
    borderRadius: "3px",
    display: "block",
    opacity: 0,
    transition: "opacity 0.2s, color 0.2s",
  },
  clearButton: {
    /* Unchanged */ display: "block",
    margin: "20px auto 0 auto",
    padding: "8px 15px",
    fontSize: "0.9rem",
    backgroundColor: "#4B5563",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    flexShrink: 0,
  },
};

export default Scheduler;

// export default Scheduler;
