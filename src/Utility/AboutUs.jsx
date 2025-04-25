import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiGithub,
  FiBook,
  FiMessageSquare,
  FiCalendar,
  FiUsers,
  FiGrid,
} from "react-icons/fi";

const AboutUs = () => {
  const [hoveredButton, setHoveredButton] = useState(null);
  const [hoveredTeamCard, setHoveredTeamCard] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => {
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#111827",
      color: "#e5e7eb",
      fontFamily: "sans-serif",
      padding: "40px 0",
      position: "relative",
      overflowY: "auto",
    },
    header: {
      padding: "20px 30px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "40px",
    },
    backButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 16px",
      backgroundColor: "rgba(74, 77, 109, 0.6)",
      color: "#f0f0f5",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "0.95rem",
      textDecoration: "none",
      transition: "background-color 0.2s ease, transform 0.2s ease",
    },
    backButtonHover: {
      backgroundColor: "rgba(90, 93, 125, 0.8)",
      transform: "translateY(-1px)",
    },
    content: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 30px 60px",
    },
    section: {
      marginBottom: "60px",
    },
    title: {
      fontSize: "2.5rem",
      fontWeight: "bold",
      marginBottom: "15px",
      color: "#f0f0f5",
      textAlign: "center",
    },
    titleHighlight: {
      color: "#8c78ff",
    },
    subtitle: {
      fontSize: "1.5rem",
      fontWeight: "600",
      color: "#f0f0f5",
      marginBottom: "20px",
      paddingBottom: "10px",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    },
    missionText: {
      fontSize: "1.1rem",
      lineHeight: "1.7",
      color: "#a0a3bd",
      marginBottom: "40px",
      maxWidth: "800px",
      margin: "0 auto 40px",
      textAlign: "center",
    },
    teamGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: "25px",
      marginTop: "30px",
    },
    teamCard: {
      backgroundColor: "#1f2937",
      borderRadius: "12px",
      overflow: "hidden",
      border: "1px solid #374151",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      padding: "20px",
    },
    teamCardHover: {
      transform: "translateY(-5px)",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
      borderColor: "#8c78ff",
    },
    teamName: {
      fontSize: "1.2rem",
      fontWeight: "600",
      color: "#f0f0f5",
      marginBottom: "15px",
    },
    teamBio: {
      color: "#a0a3bd",
      fontSize: "0.9rem",
      marginBottom: "15px",
      lineHeight: "1.6",
    },
    socialLinks: {
      display: "flex",
      gap: "15px",
      marginTop: "15px",
    },
    socialIcon: {
      color: "#a0a3bd",
      fontSize: "1.2rem",
      transition: "color 0.2s ease, transform 0.2s ease",
    },
    socialIconHover: {
      color: "#8c78ff",
      transform: "translateY(-2px)",
    },
    featuresGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "30px",
      marginTop: "30px",
    },
    featureCard: {
      backgroundColor: "#1f2937",
      padding: "25px",
      borderRadius: "12px",
      border: "1px solid #374151",
      transition:
        "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
    },
    featureCardHover: {
      transform: "translateY(-5px)",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
      borderColor: "#8c78ff",
    },
    featureIcon: {
      color: "#8c78ff",
      fontSize: "2rem",
      marginBottom: "15px",
    },
    featureTitle: {
      fontSize: "1.2rem",
      fontWeight: "600",
      color: "#f0f0f5",
      marginBottom: "10px",
    },
    featureDescription: {
      color: "#a0a3bd",
      fontSize: "0.95rem",
      lineHeight: "1.6",
    },
    footer: {
      textAlign: "center",
      marginTop: "60px",
      color: "#6a6f93",
      fontSize: "0.9rem",
    },
  };

  const teamMembers = [
    {
      id: 1,
      name: "Muhammad Hamdan Sikandar",
      bio: "Hamdan specializes in front-end development (React) and UI design, with a sharp eye for detail in testing and documentation, ensuring both aesthetic and functional excellence in project deliverables.",
      github: "https://github.com/Dannyism11",
    },
    {
      id: 2,
      name: "Sarah Hameed",
      bio: "Sarah focuses on creating intuitive user experiences through front-end development (React) and UI design. Her strengths also include meticulous testing and comprehensive documentation.",
      github: "https://github.com/sarah-hameed12",
    },
    {
      id: 3,
      name: "Jon Raza",
      bio: "Jon is a full-stack developer with strong expertise in React for front-end work, Django for back-end development, and efficient database management using SQL and Firebase, making him a key technical asset.",
      github: "https://github.com/0x0shephard",
    },
    {
      id: 4,
      name: "Sarfraz Ahmad",
      bio: "Sarfraz specializes in front-end development using React and has a strong grasp of API integration and database management with SQL and Firebase. His skills ensure seamless connectivity and user-centric interfaces.",
      github: "https://github.com/sarfrazahmed-git",
    },
    {
      id: 5,
      name: "Mahad Aamir",
      bio: "Mahad brings a versatile skill set with expertise in front-end development (React), database management (SQL, Firebase), and back-end development using Django. He excels at building full-stack solutions.",
      github: "https://github.com/xylicblue",
    },
  ];

  const features = [
    {
      id: 1,
      title: "Academic Resources",
      description:
        "Access to course outlines, documents, and study materials in a centralized location.",
      icon: <FiBook />,
    },
    {
      id: 2,
      title: "Chat System",
      description:
        "Real-time messaging with other students and faculty members for collaboration and support.",
      icon: <FiMessageSquare />,
    },
    {
      id: 3,
      title: "Schedule Management",
      description:
        "Organize your academic calendar, assignments, and deadlines with our intuitive scheduler.",
      icon: <FiCalendar />,
    },
    {
      id: 4,
      title: "Society Hub",
      description:
        "Discover and join student organizations, clubs, and events happening on campus.",
      icon: <FiUsers />,
    },
    {
      id: 5,
      title: "Academic Utilities",
      description:
        "Tools like GPA calculator, deadline tracker, and other resources to enhance your academic experience.",
      icon: <FiGrid />,
    },
  ];

  return (
    <motion.div
      style={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header style={styles.header}>
        <Link
          to="/dashboard"
          style={{
            ...styles.backButton,
            ...(hoveredButton === "back" ? styles.backButtonHover : {}),
          }}
          onMouseEnter={() => setHoveredButton("back")}
          onMouseLeave={() => setHoveredButton(null)}
        >
          <FiArrowLeft /> Back to Dashboard
        </Link>
      </header>

      <div style={styles.content}>
        <section style={styles.section}>
          <motion.h1
            style={styles.title}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            About <span style={styles.titleHighlight}>Super</span>LUMS
          </motion.h1>

          <motion.p
            style={styles.missionText}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            SuperLUMS is a comprehensive platform designed specifically for the
            LUMS community. Our mission is to enhance the academic and social
            experience by providing tools that promote collaboration,
            organization, and access to resources. We're committed to creating a
            more connected and efficient campus experience.
          </motion.p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>Our Features</h2>

          <div style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                style={{
                  ...styles.featureCard,
                  ...(hoveredFeature === feature.id
                    ? styles.featureCardHover
                    : {}),
                }}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <div style={styles.featureIcon}>{feature.icon}</div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDescription}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>Meet the Team</h2>

          <div style={styles.teamGrid}>
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                style={{
                  ...styles.teamCard,
                  ...(hoveredTeamCard === member.id
                    ? styles.teamCardHover
                    : {}),
                }}
                onMouseEnter={() => setHoveredTeamCard(member.id)}
                onMouseLeave={() => setHoveredTeamCard(null)}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <h3 style={styles.teamName}>{member.name}</h3>
                <p style={styles.teamBio}>{member.bio}</p>
                <div style={styles.socialLinks}>
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={
                      hoveredButton === `github-${member.id}`
                        ? styles.socialIconHover
                        : styles.socialIcon
                    }
                    onMouseEnter={() => setHoveredButton(`github-${member.id}`)}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    <FiGithub />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <footer style={styles.footer}>
          <p>© {new Date().getFullYear()} SuperLUMS. All rights reserved.</p>
          <p>Built with ❤️ for the LUMS community</p>
        </footer>
      </div>
    </motion.div>
  );
};

export default AboutUs;
