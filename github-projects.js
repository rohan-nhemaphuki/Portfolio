
// GitHub configuration
const GITHUB_USERNAME = "rohan-nhemaphuki";
const PROJECT_TOPIC = "portfolio";

// Cloudflare Worker URL
const WORKER_URL =
    "https://rohan-github-api.rohannhemaphuki.workers.dev";

// Projects container
const projectsContainer =
    document.getElementById("github-projects");


async function fetchGitHubProjects() {

    if (!projectsContainer) {
        console.error("GitHub projects container not found.");
        return;
    }

    try {

        projectsContainer.innerHTML =
            '<p class="project-status">Loading projects...</p>';

        let repositories = [];
        let page = 1;

        // Fetch all repositories
        while (true) {

            const API_URL =
                `${WORKER_URL}/repos?page=${page}`;

            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(
                    `API request failed: ${response.status}`
                );
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("Invalid GitHub API response.");
            }

            repositories = repositories.concat(data);

            if (data.length < 100) {
                break;
            }

            page++;
        }

        // Filter portfolio projects
        const projects = repositories
            .filter(repo =>
                Array.isArray(repo.topics) &&
                repo.topics.includes(PROJECT_TOPIC) &&
                !repo.fork &&
                !repo.archived
            )
            .sort((a, b) =>
                new Date(b.updated_at) -
                new Date(a.updated_at)
            );

        // Clear previous content
        projectsContainer.innerHTML = "";

        // No projects found
        if (projects.length === 0) {

            projectsContainer.textContent =
                'No projects found. Add the "portfolio" topic to your GitHub repositories.';

            return;
        }

        // Create project cards
        projects.forEach(project => {

            const card = document.createElement("div");
            card.className = "card";

            // Project title
            const title = document.createElement("h3");

            title.textContent = project.name.replace(/-/g, " ");

            // Horizontal line
            const separator = document.createElement("hr");

            // Project description
            const description = document.createElement("p");

            description.textContent =
                project.description ||
                "No description available.";

            // Project update date
            const meta = document.createElement("div");

            meta.className = "project-meta";

            const updated = document.createElement("span");

            const updateDate = new Date(project.updated_at);

            updated.textContent =
                "Updated: " +
                (
                    Number.isNaN(updateDate.getTime())
                        ? "Unknown"
                        : updateDate.toLocaleDateString("en-GB")
                );

            meta.appendChild(updated);

            // Project links
            const links = document.createElement("div");

            links.className = "project-links";

            // GitHub repository link
            const githubLink = document.createElement("a");

            githubLink.href = project.html_url;
            githubLink.textContent = "View on GitHub";
            githubLink.className = "project-link";
            githubLink.target = "_blank";
            githubLink.rel = "noopener noreferrer";

            links.appendChild(githubLink);

            // Live demo link
            if (project.homepage) {

                try {

                    const demoURL = new URL(project.homepage);

                    if (
                        demoURL.protocol === "https:" ||
                        demoURL.protocol === "http:"
                    ) {

                        const demoLink =
                            document.createElement("a");

                        demoLink.href = demoURL.href;
                        demoLink.textContent = "Live Demo";
                        demoLink.className = "project-link";
                        demoLink.target = "_blank";
                        demoLink.rel = "noopener noreferrer";

                        links.appendChild(
                            document.createTextNode(" | ")
                        );

                        links.appendChild(demoLink);
                    }

                } catch (error) {

                    console.warn(
                        "Invalid homepage URL:",
                        project.name
                    );

                }
            }

            // Assemble project card
            card.append(
                title,
                separator,
                description,
                meta,
                links
            );

            // Display project
            projectsContainer.appendChild(card);

        });

        console.log(
            `${projects.length} GitHub projects loaded successfully.`
        );

    }

    catch (error) {

        console.error("GitHub Projects Error:", error);

        projectsContainer.innerHTML = "";

        const errorMessage = document.createElement("p");

        errorMessage.className =
            "project-status project-error";

        errorMessage.textContent =
            "Unable to load projects. Please try again later.";

        projectsContainer.appendChild(errorMessage);

    }
}


// Initialize
if (projectsContainer) {
    fetchGitHubProjects();
}
