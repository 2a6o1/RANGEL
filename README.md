<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🚀 Deployment Fix: Resolving 404/MIME Error

If you see a blank page or an error like `Failed to load module script: ... MIME type "application/octet-stream"`, you are currently serving the **source files** instead of the **built assets**.

### The Solution: Automated Deployment
I have created a GitHub Action at `.github/workflows/deploy.yml` that will automatically build your app and deploy the correct files.

**How to fix:**
1.  **Commit & Push**: Commit all files (including the `.github` folder) to your repository.
2.  **Toggle Settings**: 
    *   On GitHub, go to your repository **Settings** > **Pages**.
    *   Under **Build and deployment > Source**, change "Deploy from a branch" to **GitHub Actions**.
3.  **Wait**: Check the **Actions** tab on GitHub. Once the "Deploy static content" workflow turns green, your site will be live at [https://2a6o1.github.io/RANGEL/](https://2a6o1.github.io/RANGEL/).

## Run Locally
...

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
