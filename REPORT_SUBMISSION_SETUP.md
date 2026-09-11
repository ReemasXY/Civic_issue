# Report Submission Setup - Complete

## ✅ What We've Implemented

### 1. Database Schema (`server/db/create_reports_table.sql`)
- ✅ Reports table with all required fields:
  - `report_id` (UUID, primary key)
  - `user_id` (UUID, references users table)
  - `title`, `description`, `category`
  - Location fields: `location_short_label`, `location_full_label`, `latitude`, `longitude`
  - `image_url` (stored in filesystem)
  - Severity fields: `severity_score`, `severity_level`
  - `status` (pending, verified, in-progress, resolved, rejected)
  - Timestamps: `created_at`, `updated_at`

### 2. Backend Controller (`server/controllers/reportControllers.js`)
- ✅ `createReport` function fully implemented:
  - Authenticates user via JWT (`checkToken` middleware)
  - Validates required fields (title, description, category, image)
  - Saves uploaded image to `server/uploads/reports/`
  - Inserts complete report into PostgreSQL `reports` table
  - Returns success response with created report

### 3. Backend Routes (`server/routes/reportRoutes.js`)
- ✅ POST `/api/reports/create-report` route added
  - Uses `checkToken` middleware for authentication
  - Uses `upload.single("image")` middleware for image handling
  - Calls `createReport` controller

### 4. Static File Serving (`server/index.js`)
- ✅ Static file serving configured:
  - `/uploads` endpoint serves uploaded images
  - Images accessible at `http://localhost:5000/uploads/reports/{filename}`

### 5. Frontend Submission (`client/src/pages/Citizen/ReportIssue/ReportIssue.jsx`)
- ✅ `handleQuestionnaireComplete` updated to:
  - Build `FormData` with all report fields
  - POST to `http://localhost:5000/api/reports/create-report`
  - Include authentication cookies (`withCredentials: true`)
  - Show loading overlay while submitting
  - Navigate to dashboard on success
  - Display error alerts on failure

---

## 🔧 What Needs to Be Done Before Testing

### 1. **Create the Database Tables**
Run these SQL files in your PostgreSQL database in order:

```bash
# 1. Create users table (if not already created)
psql -U your_username -d your_database -f server/db/LoginDB.sql

# 2. Create pending tables (if not already created)
psql -U your_username -d your_database -f server/db/create_pending_tables.sql

# 3. Create reports table
psql -U your_username -d your_database -f server/db/create_reports_table.sql
```

### 2. **Ensure Environment Variables Are Set**
Check your `server/.env` file has:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/your_database
JWT_SECRET=your_secret_key
PORT=5000
```

### 3. **Test the Complete Flow**

#### Step 1: Start the server
```bash
cd server
npm start
```

#### Step 2: Start the client
```bash
cd client
npm run dev
```

#### Step 3: Test Report Submission
1. Log in as a citizen user
2. Navigate to `/citizen/report`
3. Fill in the form:
   - Select a category
   - Add a title and description
   - Pick a location on the map
   - Upload an image
4. Click "Submit" → Image verification happens
5. If valid, complete the severity questionnaire
6. Submit the complete report
7. Should see loading overlay → success alert → redirect to dashboard

---

## 🔍 How to Verify It Worked

### Check the Database
```sql
-- View all reports
SELECT * FROM reports ORDER BY created_at DESC;

-- View a specific report with user info
SELECT 
    r.report_id,
    r.title,
    r.category,
    r.severity_level,
    r.status,
    u.username,
    u.email,
    r.created_at
FROM reports r
JOIN users u ON r.user_id = u.user_id
ORDER BY r.created_at DESC;
```

### Check Uploaded Images
```bash
# Navigate to uploads directory
cd server/uploads/reports
ls -la

# Files should be named: {user_id}_{timestamp}.{ext}
```

### Check in Browser Console
- Open DevTools → Network tab
- Submit a report
- Look for POST request to `/api/reports/create-report`
- Should return status 201 with the created report object

---

## 🐛 Common Issues & Solutions

### Issue: "User not authenticated"
**Solution**: Make sure you're logged in and the JWT token cookie is being sent with the request.

### Issue: Database insert fails
**Solution**: Verify the `reports` table exists and the `users` table has the user_id being referenced.

### Issue: Image not saving
**Solution**: Check that `server/uploads/reports/` directory exists (it's created automatically by the controller).

### Issue: CORS errors
**Solution**: Verify `server/index.js` has CORS configured for `http://localhost:5173` with `credentials: true`.

### Issue: 404 on image URL
**Solution**: Verify static file serving is set up in `server/index.js`:
```javascript
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
```

---

## 📋 Next Steps (Optional Enhancements)

1. **Add proper toast notifications** instead of `alert()` (use a library like `react-hot-toast`)
2. **Add form reset** after successful submission
3. **Display uploaded images** on the Citizen Dashboard
4. **Add edit/delete functionality** for submitted reports
5. **Add validation** for duplicate reports
6. **Add image compression** before upload
7. **Add progress indicator** for large image uploads

---

## ✨ Summary

Your report submission flow is now complete! Users can:
1. Fill out the report form with all required details
2. Upload and verify an image with AI
3. Complete a severity assessment questionnaire
4. Submit everything to the database in one transaction
5. See their report stored with all metadata

The backend stores everything properly in PostgreSQL, and the uploaded images are saved to the filesystem and served statically.
