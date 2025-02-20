const dashboardStyles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "20px",
  },
  card: {
    width: "90%",
    maxWidth: "600px",
    padding: "20px",
    textAlign: "center",
    boxShadow: 3,
    borderRadius: "12px",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  text: {
    fontSize: "16px",
    color: "#666",
    marginBottom: "20px",
  },
  button: {
    marginTop: "10px",
    backgroundColor: "#1976d2",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#1565c0",
    },
  },
};

export default dashboardStyles;
