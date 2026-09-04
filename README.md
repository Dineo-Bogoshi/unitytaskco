# Unity Task

**Unity Task** is a modern, responsive SaaS application designed to help professionals automate their daily work tasks using AI. It streamlines workflow management by connecting meeting summaries directly into deep research and automated task scheduling.

> **Disclaimer:** AI-generated content may require human review.

---

## User Experience Flow

Unity Task provides a seamless pipeline to take you from raw meeting content to actionable, scheduled tasks:

1. **Summarize:** Paste meeting transcripts to extract key points, action items, and deadlines.
2. **Investigate:** Select key points from your summary to immediately trigger deep AI research and insights.
3. **Plan:** Send researched action items straight to the Task Planner for smart prioritization and calendar scheduling.
4. **Assist:** Consult the built-in AI Chatbot anytime for quick queries or task adjustments.

---

## Core Features

* **Meeting Notes Summarizer:** Converts long meeting transcripts into structured key points, action items, and explicit deadlines.
* **AI Research Assistant:** Takes key takeaways and conducts deep background research, providing actionable insights and market context.
* **AI Task Planner:** Automatically prioritizes action items based on urgency/impact and maps them into an optimized schedule.
* **AI Chatbot Interface:** A context-aware virtual assistant available across the dashboard for real-time task management and quick edits.

---

## Design System & UI

Built with a modern SaaS visual identity featuring high-end visual polish:

* **Chameleon Gradients:** Dynamic, modern color transitions tailored to dynamic UI states.
* **Reflective Edges:** Subtle highlight borders giving cards and modals depth.
* **Frosted Glass (Glassmorphism):** Translucent backdrop filters for floating navigation and overlay components.
* **Responsive Dashboard Layout:** Sidebar navigation with a crisp, card-based main display. Full responsive support across desktop, tablet, and mobile displays.

---

## Tech Stack & AI Architecture

* **Frontend:** React / Next.js, Tailwind CSS
* **Icons & UI:** Lucide React, Framer Motion (for smooth transitions & loading states)
* **AI Orchestration:** Structured Prompt Engineering with JSON Schema outputs (OpenAI GPT-4o / Anthropic Claude 3.5 Sonnet)

---

## Getting Started

### Prerequisites
* Node.js (v18.0 or higher)
* NPM or YARN

### Local Development (Optional)
If you wish to clone and run the repository locally for development or contribution:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Dineo-Bogoshi/unitytaskco.git](https://github.com/Dineo-Bogoshi/unity-task.git)
   cd unity-task

2. **Install dependencies:**
   ```bash
   npm install

3. **Start the local server:**
   ```base
   npm run dev

---

> This prototype was generated and iterated using [Lovable](https://lovable.dev). Structured prompt engineering techniques were applied across the application to enforce strict schema outputs, handle interactive loading states, ensure reliable execution across the Meeting-to-Research-to-Planner workflow.

**Live app**: https://unitytaskco.lovable.app
