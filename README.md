# Dashboard

A premium, interactive React dashboard powered by **Supabase** that handles membership registration, donation tracking, volunteer impact logs, and library acquisitions with real-time updates.

---

## Features

- **Live Campaigns & Events:** Carousel displays active events with interactive slots tracking.
- **Real-Time Key Metrics:** Real-time counters displaying total members and donation status.
- **Volunteer Impact Timeline:** Structured log tracking volunteer events, organize groups, dates, narratives, and image sliders.
- **Library Acquisitions Archive:** Comprehensive record of book donations, categories, descriptions, and donor acknowledgments.
- **Admin Control Panel:** Fully authenticated interface to add or delete campaigns, library items, volunteer logs, and modify target metrics.

---

## Tech Stack

- **Frontend:** React (hooks, routing, Lucide icons, vanilla styling system)
- **Database & Storage:** Supabase (PostgreSQL, Row Level Security, Real-Time Replication, and Storage Buckets)

---

## Local Setup & Installation

Follow these step-by-step instructions to get the application running locally on your computer:

### Prerequisite

Ensure you have [Node.js](https://nodejs.org/) installed (LTS version recommended).

### Step 1: Clone the Repository

Clone the project folder from your repository hosting provider:

```bash
git clone <repository-url>
cd bwm_realtime_dashboard
```

### Step 2: Install Dependencies

Install all package dependencies defined in the project:

```bash
npm install
```

### Step 3: Create the Environment Variables (.env)

At the root directory of the project, create a new file named `.env` and fill it with your Supabase credentials:

```env
REACT_APP_PUBLIC_URL=your_supabase_project_url
REACT_APP_ANON_KEY=your_supabase_anon_public_key
```

*Note: You can retrieve these values under **Project Settings > API** in your Supabase Dashboard.*

---

## Database & Storage Setup (Supabase)

Before running the application, you need to prepare the tables, storage buckets, triggers, and real-time settings in your Supabase database:

1. Open your **Supabase Project Dashboard**.
2. Go to the **SQL Editor** tab from the left sidebar.
3. Open a **New Query**.
4. Copy the complete SQL commands from the [schema.sql](schema.sql) file located in this project's root folder.
5. Paste it into the editor and click **Run**.
6. This script will automatically create:
   - All necessary public tables (`site_stats`, `campaigns`, `volunteer_events`, `library_items`, `members`, and `donations`).
   - Row Level Security (RLS) policies allowing public read & write access.
   - Storage Buckets (`campaign-images`, `volunteer-images`, `library-images`) with media upload policies.
   - Database functions and triggers to auto-increment site metrics when new members or donations are added.
   - Real-time PostgreSQL replication on all tables.

---

## Running the App

Start the Webpack development server to view the dashboard:

```bash
npm start
```

This runs the app in development mode.
- Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
- The browser page will automatically hot-reload when you edit any frontend files.