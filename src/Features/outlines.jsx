import React, { useState, useEffect } from "react"; // Added useEffect back
import { motion, AnimatePresence } from "framer-motion"; // Import motion and AnimatePresence
import {
  FaFilter,
  FaTimes,
  FaLaptopCode,
  FaGraduationCap,
  FaBalanceScale,
  FaUniversity,
  FaFilePdf,
} from "react-icons/fa";
// Removed duplicate useEffect import

const Outlines = () => {
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [majors, setMajors] = useState([]);
  const [title, setTitle] = useState("Select School");
  const [selectedOptions, setSelectedOptions] = useState({});
  const [files, setFiles] = useState([]);
  const [filteredOutlines, setFilteredOutlines] = useState([]);

  useEffect(() => {
    ("Fetching files...");
    const fetchFiles = async () => {
      try {
        const response = await fetch(
          "https://outlineserver-production.up.railway.app/files/filenames"
        );
        const data = await response.json();
        if (data.error) {
          console.error("Error fetching files:", data.error);
        } else {
          "Response received:", data;
          setFiles(data);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchFiles();
  }, []);

  useEffect(() => {
    if (files.length > 0) {
      "First File Object:", files[0];
    }
  }, [files]);

  const downloadFile = (filename) => {
    fetch(`https://outlineserver-production.up.railway.app/files/:${filename}`)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => console.error("Download error:", error));
  };

  const filteredFiles = files.filter((file) =>
    file.filename.toLowerCase().includes(search.toLowerCase())
  );

  const handleFilterClick = () => {
    setShowFilter(!showFilter);
  };

  const handleSchoolClick = (school) => {
    const newSchool = school === selectedSchool ? null : school;
    setSelectedSchool(newSchool);
    setSelectedMajor(null);
    setFilteredOutlines([]);

    if (newSchool) {
      setTitle("Choose Major");
      switch (newSchool) {
        case "SSE":
          setMajors(["CS", "MATH", "PHYS", "CHEM", "BIO", "EE", "CE"]);
          break;
        case "SDSB":
          setMajors(["ACF", "MGS"]);
          break;
        case "HSS":
          setMajors(["ECON", "ECON-MATH", "PSY", "ANTHRO"]);
          break;
        case "SAHSOL":
          setMajors(["LAW"]);
          break;
        case "SOE":
          setMajors(["EDU"]);
          break;
        default:
          setMajors([]);
      }
    } else {
      setTitle("Select School");
      setMajors([]);
    }
  };

  const handleMajorClick = (major) => {
    setSelectedMajor(major === selectedMajor ? null : major);
    setFilteredOutlines([]);
  };

  const handleNextClick = () => {
    if (!selectedSchool || !selectedMajor) {
      console.warn("School and Major must be selected.");
      return;
    }

    setSelectedOptions({ school: selectedSchool, major: selectedMajor });

    const newlyFiltered = files.filter((file) => {
      const pattern = new RegExp(`^${selectedMajor}[- ]?\\d+`, "i");
      return pattern.test(file.filename);
    });

    setFilteredOutlines(newlyFiltered);
    setShowFilter(false);

    "Selected School:", selectedSchool;
    "Selected Major:", selectedMajor;
    "Filtered Outlines:", newlyFiltered;
  };

  const filterCardDynamicStyle = {
    ...styles.filterCard,
    left: showFilter ? "20px" : "-400px",
  };

  return (
    <div style={styles.container}>
      <motion.h1
        style={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Course Outlines
      </motion.h1>

      <div style={styles.searchBarContainer}>
        <input
          className="search-input"
          type="text"
          placeholder="Search Course Outlines (e.g., CS100, ECON213)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchBar}
        />
      </div>

      <motion.div
        className="file-list-container"
        style={styles.fileListContainer}
        layout
      >
        <AnimatePresence>
          {" "}
          {filteredOutlines.length > 0 ? (
            filteredOutlines.map((file, index) => (
              <motion.div
                key={`${file.filename}-${index}-filtered`}
                style={styles.fileCard}
                onClick={() => downloadFile(file.filename)}
                whileHover={styles.fileCardHover}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
              >
                <FaFilePdf style={styles.fileIcon} />
                <span style={styles.fileName}>{file.filename}</span>
              </motion.div>
            ))
          ) : search ? (
            filteredFiles.length > 0 ? (
              filteredFiles.map((file, index) => (
                <motion.div
                  key={`${file.filename}-${index}-search`}
                  style={styles.fileCard}
                  onClick={() => downloadFile(file.filename)}
                  whileHover={styles.fileCardHover}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                >
                  <FaFilePdf style={styles.fileIcon} />
                  <span style={styles.fileName}>{file.filename}</span>
                </motion.div>
              ))
            ) : (
              <motion.p
                key="no-search-results"
                style={styles.noResults}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                No matching files found for "{search}".
              </motion.p>
            )
          ) : (
            <motion.p
              key="no-selection"
              style={styles.noResults}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              No outlines selected. Use search or filters.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Filter Button - Made it motion.button */}
      <motion.button
        onClick={handleFilterClick}
        style={styles.filterButton}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {showFilter ? (
          <FaTimes style={styles.filterIcon} />
        ) : (
          <FaFilter style={styles.filterIcon} />
        )}
      </motion.button>

      <AnimatePresence>
        {showFilter && (
          <motion.div
            className="filter-card"
            style={filterCardDynamicStyle}
            initial={{ left: "-400px" }}
            animate={{ left: "20px" }}
            exit={{ left: "-400px" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <div style={styles.filterContent}>
              <h3 style={styles.filterHeader}>{title}</h3>
              <div style={styles.schoolList}>
                {/* Row 1 */}
                <div style={styles.row}>
                  {["SSE", "SDSB", "SAHSOL"].map((school) => (
                    <motion.button
                      key={school}
                      style={{
                        ...styles.schoolOption,
                        backgroundColor:
                          selectedSchool === school
                            ? "#625FFF"
                            : styles.schoolOption.background,
                        borderColor:
                          selectedSchool === school
                            ? "#625FFF"
                            : styles.schoolOption.border.split(" ")[2],
                      }}
                      onClick={() => handleSchoolClick(school)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {school === "SSE" && <FaLaptopCode style={styles.icon} />}
                      {school === "SDSB" && (
                        <FaUniversity style={styles.icon} />
                      )}
                      {school === "SAHSOL" && (
                        <FaBalanceScale style={styles.icon} />
                      )}
                      {school}
                    </motion.button>
                  ))}
                </div>

                <div style={styles.row}>
                  {["HSS", "SOE"].map((school) => (
                    <motion.button
                      key={school}
                      style={{
                        ...styles.schoolOption,
                        backgroundColor:
                          selectedSchool === school
                            ? "#625FFF"
                            : styles.schoolOption.background,
                        borderColor:
                          selectedSchool === school
                            ? "#625FFF"
                            : styles.schoolOption.border.split(" ")[2],
                      }}
                      onClick={() => handleSchoolClick(school)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {school === "HSS" && (
                        <FaGraduationCap style={styles.icon} />
                      )}
                      {school === "SOE" && <FaUniversity style={styles.icon} />}
                      {school}
                    </motion.button>
                  ))}
                </div>

                {majors.length > 0 && <div style={styles.line}></div>}

                {majors.length > 0 && (
                  <div style={styles.row}>
                    {majors.map((major) => (
                      <motion.button
                        key={major}
                        style={{
                          ...styles.majorOption,
                          backgroundColor:
                            selectedMajor === major
                              ? "#625FFF"
                              : styles.majorOption.background,
                          borderColor:
                            selectedMajor === major
                              ? "#625FFF"
                              : styles.majorOption.border.split(" ")[2],
                        }}
                        onClick={() => handleMajorClick(major)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {major}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedSchool && selectedMajor && (
              <motion.button
                onClick={handleNextClick}
                style={styles.nextButton}
                whileHover={styles.nextButtonHover}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                Show Outlines
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Outlines;

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "40px 20px",
    minHeight: "100vh",
    background: "radial-gradient(circle, #02013B, black)",
    color: "white",
    fontFamily: "'Poppins', sans-serif",
    overflowX: "hidden",
  },
  header: {
    fontSize: "2.8rem",
    fontWeight: "700",
    marginBottom: "40px",
    textAlign: "center",
    width: "100%",
  },
  searchBarContainer: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    maxWidth: "650px",
    marginBottom: "30px",
  },
  searchBar: {
    padding: "12px 25px",
    fontSize: "1rem",
    borderRadius: "30px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    width: "100%",
    outline: "none",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    color: "white",
    backdropFilter: "blur(5px)",
  },
  fileListContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    maxWidth: "1100px",
    maxHeight: "calc(100vh - 250px)",
    overflowY: "auto",
    gap: "25px",
    padding: "10px",
    marginTop: "10px",
  },
  fileCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    background: "rgba(30, 41, 59, 0.6)",
    color: "#E0E0E0",
    padding: "18px 22px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    cursor: "pointer",
    textAlign: "left",
    wordBreak: "break-word",
    backdropFilter: "blur(8px)",
    flex: "1 1 320px",
    maxWidth: "calc(50% - 12.5px)",
    minWidth: "280px",
  },
  fileCardHover: {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 18px rgba(0, 0, 0, 0.4)",
    background: "rgba(51, 65, 85, 0.75)",
    borderColor: "rgba(0, 251, 246, 0.5)",
  },
  fileIcon: {
    fontSize: "1.7rem",
    color: "#00FBF6",
    flexShrink: 0,
  },
  fileName: {
    fontSize: "1rem",
    fontWeight: "500",
    lineHeight: "1.4",
    flexGrow: 1,
  },
  noResults: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "1.1rem",
    textAlign: "center",
    width: "100%",
    padding: "50px 20px",
  },
  filterButton: {
    position: "fixed",
    top: "50%",
    left: "20px",
    transform: "translateY(-50%)",
    backgroundColor: "#334159",
    border: "none",
    padding: "15px",
    borderRadius: "50%",
    cursor: "pointer",
    color: "#00FBF6",
    fontSize: "1.5rem",
    zIndex: 999,
    boxShadow: "0 0 15px rgba(0, 251, 246, 0.3)",
  },
  filterIcon: { display: "block" },
  filterCard: {
    // BASE styles for filter card (positioning comes from dynamic style)
    position: "fixed",
    // REMOVED left property here
    top: "50%",
    transform: "translateY(-50%)",
    width: "320px",
    background: "rgba(17, 24, 39, 0.85)",
    boxShadow: "5px 0px 25px rgba(0, 0, 0, 0.4)",
    display: "flex",
    flexDirection: "column",
    padding: "25px",
    borderRadius: "15px",
    zIndex: 998,
    transition: "left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)", // Keep transition for smoothness
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    maxHeight: "80vh",
    overflowY: "auto",
  },
  filterContent: { color: "white" },
  filterHeader: {
    fontSize: "1.4rem",
    fontWeight: "600",
    marginBottom: "20px",
    textAlign: "center",
    color: "#00FBF6",
  },
  schoolList: {
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "10px",
  },
  row: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "10px",
    width: "100%",
    flexWrap: "wrap",
  },
  schoolOption: {
    // Base styles
    padding: "10px 15px",
    fontSize: "0.85rem",
    cursor: "pointer",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "8px",
    textAlign: "center",
    transition:
      "background-color 0.2s ease-in-out, border-color 0.2s ease-in-out",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent", // Explicitly define base background
  },
  icon: { marginRight: "8px", flexShrink: 0 },
  majorOption: {
    // Base styles
    padding: "8px 15px",
    fontSize: "0.8rem",
    cursor: "pointer",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "20px",
    textAlign: "center",
    margin: "3px",
    transition:
      "background-color 0.2s ease-in-out, border-color 0.2s ease-in-out",
    background: "transparent", // Explicitly define base background
  },
  nextButton: {
    padding: "10px 25px",
    fontSize: "1rem",
    fontWeight: "600",
    backgroundColor: "#00FBF6",
    color: "#02013B",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    width: "auto",
    alignSelf: "center",
    marginTop: "15px",
  },
  nextButtonHover: {
    backgroundColor: "#00d9d3",
    scale: 1.05,
  },
  line: {
    height: "1px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    margin: "15px 0",
  },
};
