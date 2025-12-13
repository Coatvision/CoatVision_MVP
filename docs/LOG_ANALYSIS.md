# Log File Analysis Feature

## Overview

The CoatVision application now includes a log file analysis feature that allows users to upload and analyze log files to identify error frequencies and trends.

## Features

- **File Upload**: Upload log files in `.log`, `.txt`, or `.out` formats
- **Error Detection**: Automatically detects ERROR, FATAL, and CRITICAL level messages
- **Warning Detection**: Identifies WARN and WARNING level messages
- **Info Detection**: Tracks INFO and DEBUG level messages
- **Error Frequency Analysis**: Shows the most common error messages with counts and percentages
- **Trend Analysis**: Groups errors by time to show when errors occurred
- **Summary Statistics**: Displays aggregate statistics across all analyzed files

## API Endpoints

### Upload Log File
```
POST /api/logs/upload
Content-Type: multipart/form-data

Parameters:
  - file: Log file to analyze

Response:
{
  "status": "success",
  "analysis": {
    "id": "log_1",
    "filename": "application.log",
    "total_lines": 100,
    "error_count": 15,
    "warning_count": 8,
    "info_count": 77,
    "error_frequencies": {...},
    "error_trends": [...],
    "top_errors": [...],
    "analyzed_at": "2024-12-07T21:00:00"
  }
}
```

### List All Analyses
```
GET /api/logs/

Response:
{
  "count": 2,
  "analyses": [...]
}
```

### Get Specific Analysis
```
GET /api/logs/{log_id}

Response:
{
  "id": "log_1",
  "filename": "application.log",
  ...
}
```

### Get Summary Statistics
```
GET /api/logs/stats/summary

Response:
{
  "total_analyses": 5,
  "total_errors": 123,
  "total_warnings": 45,
  "avg_errors_per_file": 24.6
}
```

### Delete Analysis
```
DELETE /api/logs/{log_id}

Response:
{
  "status": "deleted",
  "analysis": {...}
}
```

## Frontend Usage

### React Component
The Logs page is available at `/logs` in the React dashboard. It provides:
- File upload form with validation
- Real-time analysis results display
- Interactive tables showing error frequencies
- Visual trend charts
- Summary statistics across all analyses

### Accessing the Feature
1. Navigate to the Logs section in the sidebar
2. Click "Choose File" and select a log file
3. Click "Upload & Analyze" to process the file
4. View the analysis results including:
   - Total lines, errors, warnings, and info messages
   - Top error messages with frequencies
   - Error trends over time
   - Summary statistics

## Log Format Support

The analyzer supports common log formats including:
- ISO 8601 timestamps: `2024-12-07T10:15:23`
- Apache format: `07/Dec/2024:10:15:23`
- Common format: `07-12-2024 10:15:23`

## Implementation Details

### Backend
- **Router**: `/backend/routers/logs.py`
- **Pattern Matching**: Uses regex to identify log levels and timestamps
- **Error Extraction**: Extracts error messages after the log level keyword
- **In-Memory Storage**: Results are stored in memory (can be replaced with database)

### Frontend
- **Page Component**: `/frontend/src/pages/Logs.jsx`
- **API Integration**: Connects to backend API at `/api/logs`
- **Responsive Design**: Grid-based layout adapts to different screen sizes

### Testing
- **Test File**: `/tests/test_logs.py`
- **Coverage**: 10 comprehensive test cases covering all endpoints and edge cases

## Example Log File

```
2024-12-07 10:00:00 INFO Application started
2024-12-07 10:00:15 ERROR Failed to connect to database: timeout
2024-12-07 10:00:16 WARN Retrying database connection (1/3)
2024-12-07 10:00:17 ERROR Failed to connect to database: timeout
2024-12-07 10:00:18 WARN Retrying database connection (2/3)
2024-12-07 10:00:19 ERROR Failed to connect to database: timeout
```

## Future Enhancements

- Database persistence for log analyses
- Export analysis results to PDF/CSV
- Advanced filtering and search
- Real-time log streaming
- Alert configuration for critical errors
- Machine learning-based anomaly detection
