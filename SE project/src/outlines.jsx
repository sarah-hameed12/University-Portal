import React, { useState } from "react";
import {
  FaFilter,
  FaTimes,
  FaLaptopCode,
  FaGraduationCap,
  FaBalanceScale,
  FaUniversity,
} from "react-icons/fa";

const Outlines = () => {
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [majors, setMajors] = useState([]);
  const [title, setTitle] = useState("Select School");
  const [selectedOptions, setSelectedOptions] = useState({});

  const handleFilterClick = () => {
    setShowFilter(!showFilter);
  };

  const handleSchoolClick = (school) => {
    setSelectedSchool(school === selectedSchool ? null : school);

    switch (school) {
      case "SSE":
        setMajors(["CS", "MATH", "PHYS", "CHEM", "BIO", "EE", "CE"]);
        setTitle("Choose Major");
        break;
      case "SDSB":
        setMajors(["ACF", "MGS"]);
        setTitle("Choose Major");
        break;
      case "HSS":
        setMajors(["ECON", "ECON-MATH", "PSY", "ANTHRO"]);
        setTitle("Choose Major");
        break;
      case "SAHSOL":
        setMajors(["LAW"]);
        setTitle("Choose Major");
        break;
      default:
        setMajors([]);
        setTitle("Select School");
    }
  };

  const handleMajorClick = (major) => {
    setSelectedMajor(major === selectedMajor ? null : major);
  };

  const getMajorButtonColor = (school) => {
    switch (school) {
      case "SSE":
        return "#1D1C4F";
      case "SDSB":
        return "#1D1C4F";
      case "HSS":
        return "#1D1C4F";
      case "SAHSOL":
        return "#1D1C4F";
      default:
        return "#1D1C4F";
    }
  };

  const handleNextClick = () => {
    if (selectedSchool && selectedMajor) {
      setSelectedOptions({
        school: selectedSchool,
        major: selectedMajor,
      });
      console.log("Selected Options:", selectedOptions);
    } else {
      alert("Please select both a school and a major.");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Course Outlines</h1>

      {/* Search Bar */}
      <div style={styles.searchBarContainer}>
        <input
          type="text"
          placeholder="Search Course Outlines"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchBar}
        />
      </div>

      {/* Filter Button */}
      <button onClick={handleFilterClick} style={styles.filterButton}>
        {showFilter ? (
          <FaTimes style={styles.filterIcon} />
        ) : (
          <FaFilter style={styles.filterIcon} />
        )}
      </button>

      {/* Main Content */}
      <div style={styles.content}></div>

      {/* Filter Card */}
      {showFilter && (
        <div style={styles.filterCard}>
          <div style={styles.filterContent}>
            <h3 style={styles.filterHeader}>{title}</h3>
            <div style={styles.schoolList}>
              <div style={styles.row}>
                {["SSE", "SDSB", "SAHSOL"].map((school, index) => (
                  <button
                    key={index}
                    style={{
                      ...styles.schoolOption,
                      backgroundColor:
                        selectedSchool === school ? "#625FFF" : "#1D1C4F",
                    }}
                    onClick={() => handleSchoolClick(school)}
                  >
                    {school === "SSE" && <FaLaptopCode style={styles.icon} />}
                    {school === "SDSB" && <FaUniversity style={styles.icon} />}
                    {school === "SAHSOL" && (
                      <FaBalanceScale style={styles.icon} />
                    )}
                    {school}
                  </button>
                ))}
              </div>

              <div style={styles.row}>
                {["HSS", "SOE"].map((school, index) => (
                  <button
                    key={index}
                    style={{
                      ...styles.schoolOption,
                      backgroundColor:
                        selectedSchool === school ? "#625FFF" : "#1D1C4F",
                    }}
                    onClick={() => handleSchoolClick(school)}
                  >
                    {school === "HSS" && (
                      <FaGraduationCap style={styles.icon} />
                    )}
                    {school === "SOE" && <FaUniversity style={styles.icon} />}
                    {school}
                  </button>
                ))}
              </div>

              {/* Horizontal Line */}
              {majors.length > 0 && <div style={styles.line}></div>}

              {/* Majors Row */}
              {majors.length > 0 && (
                <div style={styles.row}>
                  {majors.map((major, index) => (
                    <button
                      key={index}
                      style={{
                        ...styles.majorOption,
                        backgroundColor:
                          selectedMajor === major
                            ? "#625FFF"
                            : getMajorButtonColor(selectedSchool),
                      }}
                      onClick={() => handleMajorClick(major)}
                    >
                      {major}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* "Next" Button */}
          {selectedSchool && selectedMajor && (
            <button onClick={handleNextClick} style={styles.nextButton}>
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Outlines;

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
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
    marginBottom: "50px",
    textAlign: "center",
    marginLeft: "200px",
  },
  searchBarContainer: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    maxWidth: "600px",
    marginBottom: "20px",
    marginLeft: "300px",
  },
  searchBar: {
    padding: "10px 20px",
    fontSize: "1rem",
    borderRadius: "25px",
    border: "2px solid #ccc",
    width: "90%",
    outline: "none",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "white",
  },
  filterButton: {
    position: "fixed",
    top: "50%",
    left: "0",
    transform: "translateY(-50%)",
    backgroundColor: "#334159",
    border: "none",
    padding: "15px",
    borderRadius: "50%",
    cursor: "pointer",
    color: "#00FBF6",
    fontSize: "1.5rem",
    zIndex: 999,
    transition: "transform 0.3s ease-in-out",
  },
  filterIcon: {
    fontSize: "1.5rem",
  },
  filterCard: {
    position: "fixed",
    top: "30%",
    left: "5%",
    width: "20%",
    background: "linear-gradient(145deg, #1d1d1d, #0d0d0d)",
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.3)",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    borderRadius: "15px",
    zIndex: 998,
    transition: "transform 0.3s ease-in-out",
    transform: "translateX(0)",
    backdropFilter: "blur(10px)",
  },
  filterContent: {
    color: "white",
  },
  filterHeader: {
    fontSize: "1.5rem",
    fontWeight: "600",
    marginBottom: "20px",
    textAlign: "center",
  },
  schoolList: {
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "10px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    width: "100%",
    flexWrap: "wrap",
  },
  schoolOption: {
    padding: "10px 20px",
    fontSize: "0.8rem",
    cursor: "pointer",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "20px",
    textAlign: "center",
    flex: "1 1 30%",
    maxWidth: "30%",
    transition: "background-color 0.3s ease-in-out",
    display: "flex",
    alignItems: "center", // Align text and icon horizontally
    justifyContent: "center",
  },
  icon: {
    marginRight: "8px",
    flexShrink: 0,
  },
  majorOption: {
    padding: "10px 20px",
    fontSize: "0.8rem",
    cursor: "pointer",
    backgroundColor: "#1D1C4F",
    color: "white",
    border: "none",
    borderRadius: "20px",
    textAlign: "center",
    flex: "1 1 30%",
    margin: "5px",
    transition: "background-color 0.3s ease-in-out",
    // minWidth: "100px",
    maxWidth: "30%",
  },
  nextButton: {
    padding: "12px 15px",
    fontSize: "1.2rem",
    backgroundColor: "#FB2828",
    color: "white",
    border: "none",
    borderRadius: "40px",
    cursor: "pointer",
    marginLeft: "100px",
    transition: "background-color 0.3s ease-in-out",
    maxWidth: "100px",
    width: "auto",
    marginTop: "-10px",
    textAlign: "center",
  },
  line: {
    height: "2px",
    backgroundColor: "white",
    marginBottom: "5px",
    opacity: "50%",
  },
};
