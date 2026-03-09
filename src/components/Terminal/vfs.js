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
        children: ["skills.conf", "hostname"],
    },
    "/etc/skills.conf": {
        type: "file",
        content: `
# Technical Stack Configuration
[Languages]
primary = ["Python", "JavaScript"]
secondary = ["HTML5", "CSS3", "SQL"]

[Frameworks]
backend = ["Django", "Flask", "Node.js"]
frontend = ["React.js"]

[Infrastructure]
database = ["MySQL"]
tools = ["VS Code", "GitHub", "Postman"]
    `,
    },
    "/etc/hostname": {
        type: "file",
        content: "portfolio-prod-srv-01",
    },
    "/home": {
        type: "dir",
        children: ["dipanshu"],
    },
    "/home/dipanshu": {
        type: "dir",
        children: ["README.md", "profile.md", "contact.sh"],
    },
    "/home/dipanshu/README.md": {
        type: "file",
        content: `
# Welcome to Dipanshu's Portfolio OS
------------------------------------
System: Portfolio Linux v1.0.4-LTS
User: dipanshu (Authorized)

This is a professional terminal interface.
Use 'ls -R' (simulated) or 'cd' to explore the filesystem.
Type 'help' for a command overview.
    `,
    },
    "/home/dipanshu/profile.md": {
        type: "file",
        content: `
## Professional Summary
Software Developer specialized in Backend Engineering with Python/Django.
Focusing on scalable architecture, API design, and robust data modeling.
Committed to continuous integration and high-quality code standards.
    `,
    },
    "/home/dipanshu/contact.sh": {
        type: "file",
        content: `
#!/bin/bash
echo "Initiating contact protocol..."
echo "Email: [Your Private Email]"
echo "LinkedIn: [Your LinkedIn Handle]"
echo "GitHub: https://github.com/dipanshu682"
    `,
    },
    "/opt": {
        type: "dir",
        children: ["projects"],
    },
    "/opt/projects": {
        type: "dir",
        children: ["eshop_engine", "community_hub", "emotion_ai"],
    },
    "/opt/projects/eshop_engine": {
        type: "dir",
        children: ["specs.md", "README.md"],
    },
    "/opt/projects/eshop_engine/specs.md": {
        type: "file",
        content: `
Project: Eshop Backend Engine
Description:
• Robust e-commerce infrastructure built with Django.
• Integrated secure JWT authentication and RBAC.
• Optimized query performance for product management.
• Modular search architecture for efficient discovery.
    `,
    },
    "/opt/projects/community_hub/README.md": {
        type: "file",
        content: `
Project: Tech Community Platform
Description:
• High-performance blog platform using Django.
• Implemented granular authorization levels.
• Full CRUD implementation for content lifecycle.
    `,
    },
    "/opt/projects/emotion_ai/README.md": {
        type: "file",
        content: `
Project: Computer Vision Emotion Engine
Description:
• Real-time emotion classification using CNN.
• Flask-based API integration for model serving.
• OpenCV implementation for live stream processing.
    `,
    },
    "/var": {
        type: "dir",
        children: ["log"],
    },
    "/var/log": {
        type: "dir",
        children: ["experience.log"],
    },
    "/var/log/experience.log": {
        type: "file",
        content: `
[2023-CURRENT] BACKEND DEVELOPER | PYTHON (DJANGO)
- Orchestrating backend services and micro-optimizations.
- Driving technical excellence in database normalization.
[BOOTRAN] System ready.
    `,
    }
};
