import "./ContentManagementDashboard.css";
import { theme } from "../constants/theme";

const SomeComponent = () => {
	// Set CSS variables for theme colors
	if (typeof document !== "undefined") {
		document.documentElement.style.setProperty(
			"--background-color",
			theme.colors.background
		);
		document.documentElement.style.setProperty(
			"--text-color",
			theme.colors.text
		);
	}

	return <div className="container">{/* Component content */}</div>;
};

export default SomeComponent;
