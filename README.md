# JumboPlan

---

## The Project

**Team Name:** JumboPlan  

JumboPlan transforms the traditional static degree sheet (PDF) into an interactive, visual course planning experience. Instead of manually parsing prerequisites and requirement rules, students can see their entire academic path as a dynamic graph with eligibility, progress tracking, and prerequisite logic built in.

Our goal was to make degree planning intuitive, transparent, and structured. Over the weekend, we built a working prototype that:

- Parses degree requirements from official sources
- Models prerequisite logic using an expression tree (AST)
- Displays courses visually with eligibility states (Locked / Eligible / Completed)
- Allows users to track their degree progress interactively

---

##  The Team

### Ha Nguyen  
Led backend architecture and data modeling. Designed the prerequisite AST schema, implemented Prisma + PostgreSQL backend (hosted on Neon), and built the eligibility logic engine.

### Allison Zhang  
Led frontend implementation. Designed and built the interactive dashboard UI, course cards, and course detail panel using Next.js and React.

### Elisa Yu
Worked on scraping and data extraction from the university course catalog, parsing prerequisite structures, and generating structured JSON for ingestion into the system.

### Angela Yan
Worked on frontend implementation of onboarding page and elective course page. Worked on prototyping flows. 

### Ivy Chang
Led the design system for the Figma prototype.

---

## Acknowledgements

We would like to acknowledge the following tools and technologies that made this project possible:

- **Next.js + React** — Frontend framework for building the interactive dashboard  
- **React Flow** — Graph visualization library for course dependency rendering  
- **PostgreSQL (Neon) + Prisma** — Backend database and ORM  
- **pdfplumber** — Used to extract structured text from degree sheet PDFs  
- **Tailwind CSS** — For UI styling and rapid layout iteration  
- **Clerk** — Authentication and user management  

We also used **LLMs (ChatGPT)** to assist with:

- Schema design and prerequisite modeling  
- Backend API structure  
- UI architecture planning  
- Debugging and implementation guidance  

Special thanks to the hackathon organizers for their support throughout the weekend.
