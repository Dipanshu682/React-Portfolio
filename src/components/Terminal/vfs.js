export const vfs = {
    "/": {
        type: "dir",
        children: ["bin", "etc", "home", "opt", "var"],
    },
    "/bin": {
        type: "dir",
        children: ["neofetch", "ls", "cat", "help"],
    },
    "/etc": {
        type: "dir",
        children: ["hostname", "os-release"],
    },
    "/etc/hostname": {
        type: "file",
        content: "dipanshu-vps",
    },
    "/etc/os-release": {
        type: "file",
        content: `NAME="Portfolio Linux"\nVERSION="1.0.4-LTS"\nID=portfolio\nPRETTY_NAME="Dipanshu Portfolio OS v1.0.4"`,
    },
    "/home": {
        type: "dir",
        children: ["guest"],
    },
    "/home/guest": {
        type: "dir",
        children: ["resume", "README.md", "contact.sh"],
    },
    "/home/guest/README.md": {
        type: "file",
        content: `
# Dipanshu Sengar's Terminal Portfolio
--------------------------------
Welcome! You are currently in the home directory.
All resume-related information can be found in the 'resume' folder.

Commands:
- 'cd resume && ls' to explore my background.
- 'neofetch' for system info.
- 'help' for technical assistance.
    `,
    },
    "/home/guest/contact.sh": {
        type: "file",
        content: `
#!/bin/bash
echo "--- Contact Information ---"
echo "Phone: +91-6267308383"
echo "Email: [Email Displayed in Resume]"
echo "LinkedIn: linkedin.com/in/dipanshu-sengar"
echo "GitHub: https://github.com/Dipanshu682"
    `,
    },
    "/home/guest/resume": {
        type: "dir",
        children: [
            "summary.md",
            "personal_info.md",
            "experience.md",
            "projects.md",
            "skills.md",
            "education.md",
            "certifications.md",
            "achievements.md"
        ],
    },
    "/home/guest/resume/personal_info.md": {
        type: "file",
        content: `
## Personal Information
- **Name**: Dipanshu Sengar
- **Phone**: +91-6267308383
- **LinkedIn**: https://linkedin.com/in/dipanshu-sengar
- **GitHub**: https://github.com/Dipanshu682
    `,
    },
    "/home/guest/resume/summary.md": {
        type: "file",
        content: `
## Professional Summary
Motivated Junior Python Developer with 1 year of professional experience in building web applications. 
Proficient in Python and Django, with hands-on experience in developing backend. 
Looking forward to adding value through my passion and expertise.
    `,
    },
    "/home/guest/resume/experience.md": {
        type: "file",
        content: `
## Experience

### Rezang La Pvt Ltd | Backend Developer
**July 2023 – July 2024**
*Backend Development for Arealyou.ai*

- Developed the end-to-end backend, designed, and implemented RESTful APIs using Django rest framework.
- Integrated DynamoDB for data storage (AWS NoSQL), enabling efficient and scalable data management.
- Collaborated with the frontend team to define data contracts for the APIs, ensuring seamless integration.
- Identified and fixed bottlenecks in the application to improve performance and user experience.
    `,
    },
    "/home/guest/resume/projects.md": {
        type: "file",
        content: `
## Projects

### 1. Bookish - May, 2025
*A Django-based application for buying and selling books.*
- Implemented user authentication, book sales, and purchase functionalities.
- Developed a search/filter system for efficient discovery.
- Added pagination and used Django signals for real-time notifications.

### 2. TravelMate - August, 2024
*A Django-based application for solo travelers to find travel partners.*
- Implemented user authentication and profile management for personalized matching.
- Developed a profile matching system based on travel preferences.
- Integrated a real-time chat feature for seamless communication.

*Checkout more of my projects on GitHub.*
    `,
    },
    "/home/guest/resume/skills.md": {
        type: "file",
        content: `
## Skills
- **Languages**: Python, JavaScript, SQL, Html, CSS
- **Frameworks**: Django, Django Rest Framework
- **Backend**: APIs, ORM, MySQL, DynamoDB
- **Tools**: Git, GitHub, AWS
    `,
    },
    "/home/guest/resume/education.md": {
        type: "file",
        content: `
## Education
### PIEMR, Indore
**April 2019 - April 2023**
- Bachelor of Engineering in Computer Science
- **CGPA**: 7.51/10
    `,
    },
    "/home/guest/resume/certifications.md": {
        type: "file",
        content: `
## Certifications
- Programing with Python – January 2022
- Python for Data Science and Machine Learning Bootcamp – December 2021
- Red Hat Linux Administration - December 2020
    `,
    },
    "/home/guest/resume/achievements.md": {
        type: "file",
        content: `
## Achievements
- Received the "Chhavi Jain Scholarship" for academic excellence (CGPA 7.5+).
- Solved 150+ problems on LeetCode.
- Achieved 5 Stars in Python on HackerRank.
- Achieved 4 Stars in Problem Solving on HackerRank.
    `,
    },
    "/opt": {
        type: "dir",
        children: ["projects"],
    },
    "/opt/projects": {
        type: "dir",
        children: ["bookish", "travelmate"],
    },
    "/var": {
        type: "dir",
        children: ["log"],
    },
    "/var/log": {
        type: "dir",
        children: ["syslog"],
    },
    "/var/log/syslog": {
        type: "file",
        content: "[2026-03-10] System boot successful.\n[2026-03-10] User guest logged in.",
    }
};
