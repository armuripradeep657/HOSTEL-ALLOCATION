<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Hostel Allocation

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and add Firebase configuration values if a Firebase database is required.
3. Run the app:
   `npm run dev`

## Deploy to Render

This repository includes `render.yaml` for a Node web service. Create a new Render Blueprint from this GitHub repository, then enter the Firebase environment variables requested by Render. Render will run the production build and start the service automatically.
