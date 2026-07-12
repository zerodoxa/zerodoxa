# PDFMedic

Professional PDF toolkit built with Next.js.

## Features

✅ Merge PDF
✅ Split PDF
✅ Compress PDF
✅ Rotate PDF
✅ Delete Pages
✅ Extract Pages
✅ Reorder Pages
✅ Images to PDF
✅ PDF to Images
✅ Protect PDF
✅ Unlock PDF

## Tech Stack

- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **pdf-lib**
- **qpdf**
- **Poppler**
- **Docker**

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/zerodoxa/zerodoxa.git
   cd zerodoxa
   ```

2. **Install system dependencies:**
   PDFMedic requires `qpdf` and `poppler-utils` to be installed on your system for full functionality.
   - **Ubuntu/Debian:** `sudo apt-get install qpdf poppler-utils`
   - **macOS:** `brew install qpdf poppler`

3. **Install npm packages:**
   ```bash
   npm install
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Docker

The easiest way to run PDFMedic is using Docker, as it automatically provisions the required system dependencies (`qpdf` and `poppler-utils`).

1. **Build and start the container:**
   ```bash
   docker compose up -d --build
   ```

2. **Access the application:**
   Open `http://localhost:3000` in your browser.

## Deployment

### Railway
You can deploy this project easily on Railway by linking your GitHub repository. The included `railway.json` and `Dockerfile` will ensure that the required system dependencies are installed and the app runs smoothly.

### Docker
Use the provided `docker-compose.yml` and `Dockerfile` to deploy the app to any VPS or cloud provider that supports Docker containers.
