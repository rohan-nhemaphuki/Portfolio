

// GitHub username
const GITHUB_USERNAME = "rohan-nhemaphuki";

// Required GitHub repository topic
const PROJECT_TOPIC = "portfolio";

// Projects container
const projectsContainer = document.getElementById("github-projects");



async function fetchGitHubProjects() {

    try {

        projectsContainer.innerHTML =
            '<p class="project-status">Loading projects...</p>';

        let repositories = [];
        let page = 1;

        // Fetch all public repositories (100 per page)
        while (true) {

            const API_URL =
                `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&page=${page}&sort=updated`;

            const response = await fetch(API_URL, {
                headers: {
                    "Accept": "application/vnd.github+json"
                },
                cache: "no-store"
            });

            if (!response.ok) {

                if (response.status === 403 || response.status === 429) {
                    throw new Error(
                        "GitHub API rate limit reached. Please try again later."
                    );
                }

                throw new Error(
                    `GitHub API request failed: ${response.status}`
                );
            }

            const data = await response.json();

            repositories = repositories.concat(data);

            if (data.length < 100) {
                break;
            }

            page++;
        }




        const projects = repositories.filter(repo => {

            return (
                Array.isArray(repo.topics) &&
                repo.topics.includes(PROJECT_TOPIC) &&
                !repo.fork &&
                !repo.archived
            );

        });


        // Clear loading message
        projectsContainer.innerHTML = "";


        if (projects.length === 0) {

            projectsContainer.innerHTML =
                '<p class="project-status">No projects found. Add the "portfolio" topic to your GitHub repositories.</p>';

            return;
        }


        projects.forEach(project => {

            // Main card
            const card = document.createElement("div");
            card.className = "card";


            // Project title
            const title = document.createElement("h3");
            title.textContent = project.name.replace(/-/g, " ");


            // Project description
            const description = document.createElement("p");
            description.textContent =
                project.description || "No description available.";

            // Project information
            const meta = document.createElement("div");
            meta.className = "project-meta";

	meta.append(document.createElement("br"));
            // Programming language
            const language = document.createElement("span");
            language.textContent =
                project.language || "Not specified";


            // Last updated date
            const updated = document.createElement("span");

            const updateDate = new Date(project.updated_at);

            updated.textContent =
                " Updated: " +
                updateDate.toLocaleDateString("en-GB");


            	meta.append(language);

		meta.append(updated);


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

	links.appendChild(document.createElement("br"));
            links.appendChild(githubLink);



            // Live demo link (if available)
            if (project.homepage) {

                try {

                    const demoURL = new URL(project.homepage);

                    if (
                        demoURL.protocol === "https:" ||
                        demoURL.protocol === "http:"
                    ) {

                        const demoLink = document.createElement("a");

                        demoLink.href = demoURL.href;
                        demoLink.textContent = "Live Demo";
                        demoLink.className = "project-link";
                        demoLink.target = "_blank";
                        demoLink.rel = "noopener noreferrer";
			links.appendChild(document.createTextNode(" | "));
                        links.appendChild(demoLink);
                    }

                } catch (error) {

                    console.warn(
                        "Invalid project homepage:",
                        project.name
                    );

                }
            }


            // Assemble card
            card.append(
                title,
		document.createElement("br"),
                description,
                meta,
                links
            );


            // Add card to website
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

        errorMessage.className = "project-status project-error";
        errorMessage.textContent =
            "Unable to load projects. Please try again later.";

        projectsContainer.appendChild(errorMessage);

    }

}


if (projectsContainer) {
    fetchGitHubProjects();
}
