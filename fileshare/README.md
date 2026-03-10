# DropShare — File Upload & Sharing App

A full-stack file sharing app built with **React** (frontend) + **Django REST Framework** (backend).

Upload any file → get an instant share link → send to friends.

---

## Features

- 📁 Drag-and-drop file upload (up to 50 MB)
- 🔗 Unique share link per file
- 💬 Add a name + personal message to each share
- ⬇️ Download tracking (count shown on receive page)
- 📬 Share via Email or WhatsApp in one click
- 🗑️ Delete files from "My Files" dashboard
- ⏰ Optional expiry date per file

---

## Project Structure

```
fileshare/
├── backend/              # Django REST API
│   ├── fileshare/        # Django project (settings, urls, wsgi)
│   ├── files/            # App: models, views, serializers, urls
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/             # React app
    ├── src/
    │   ├── api/          # Axios API calls
    │   ├── components/   # Navbar
    │   └── pages/        # Upload, Share, Receive, MyFiles
    ├── public/
    └── package.json
```

---

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# (Optional) Create admin user
python manage.py createsuperuser

# Start server
python manage.py runserver
```

Django API will be running at: **http://localhost:8000**

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm start
```

React app will be running at: **http://localhost:3000**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload/` | Upload a file (multipart/form-data) |
| `GET` | `/api/files/` | List all uploaded files |
| `GET` | `/api/files/<token>/` | Get file metadata by share token |
| `DELETE` | `/api/files/<token>/delete/` | Delete a file |
| `GET` | `/api/download/<token>/` | Download file (increments counter) |

### Upload Request Body (form-data)
| Field | Type | Required |
|-------|------|----------|
| `file` | File | ✅ Yes |
| `uploader_name` | string | No |
| `message` | string | No |
| `expires_at` | datetime ISO | No |

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Upload page with drag-and-drop |
| `/share/:token` | Post-upload page with share link |
| `/receive/:token` | Friend's download page |
| `/my-files` | Dashboard — view, copy, delete files |

---

## Production Notes

Before deploying to production:

1. **Change `SECRET_KEY`** in `settings.py` (use an environment variable)
2. **Set `DEBUG = False`**
3. **Configure `ALLOWED_HOSTS`** to your domain
4. **Use PostgreSQL** instead of SQLite
5. **Store uploads on S3/GCS** using `django-storages`
6. **Set `CORS_ALLOWED_ORIGINS`** to your frontend domain only
7. **Run** `python manage.py collectstatic`
8. **Add authentication** — currently any user can see all files

---

## Admin Panel

Visit **http://localhost:8000/admin** to manage files via Django's built-in admin.
