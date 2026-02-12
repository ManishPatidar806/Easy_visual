# EasyVisual

A modern, no-code machine learning pipeline builder with a visual drag-and-drop interface. Build, train, and evaluate ML models without writing code.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-green.svg)
![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)

## 🌟 Features

- **Visual Pipeline Builder**: Drag-and-drop interface for creating ML workflows
- **Real-time Execution**: Watch your pipeline execute step-by-step
- **Multiple ML Algorithms**: Support for Logistic Regression, Decision Tree, and Random Forest
- **Data Preprocessing**: Built-in standardization and normalization
- **Interactive Configuration**: Configure each node with a clean, intuitive panel
- **Performance Metrics**: View accuracy, precision, recall, and F1-score
- **Dark Mode Support**: Seamless light/dark theme switching
- **Responsive Design**: Works on desktop and tablet devices

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **State Management**: Zustand
- **UI Components**: Radix UI, Tailwind CSS
- **Workflow Canvas**: ReactFlow 11
- **Type Safety**: Full TypeScript support

### Backend
- **Framework**: FastAPI (Python)
- **ML Library**: scikit-learn
- **Data Processing**: pandas, numpy
- **API Documentation**: Auto-generated Swagger/OpenAPI
- **Architecture**: Layered (API → Service → Storage)

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.12+
- **pip** for Python package management

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/ManishPatidar806/Easy_visual.git
cd EasyVisual
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python main.py
```

Backend will be available at: **http://localhost:8000**

### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: **http://localhost:3000**

## 📖 Usage Guide

### Building Your First Pipeline

1. **Upload Dataset**
   - Drag the "Upload Dataset" node to the canvas
   - Double-click to configure
   - Upload a CSV or Excel file (e.g., iris.csv)

2. **Preprocess Data**
   - Add "Preprocess Data" node
   - Connect it to the Upload node
   - Select columns to normalize/standardize

3. **Split Data**
   - Add "Train-Test Split" node
   - Choose split ratio (60/40, 70/30, 80/20)
   - Select target column for prediction

4. **Train Model**
   - Add "Train Model" node
   - Select algorithm (Logistic Regression, Decision Tree, Random Forest)
   - Connect to Split node

5. **View Results**
   - Add "View Results" node
   - Connect to Train node
   - Click "Run Pipeline" to execute

### Supported Datasets

- **Format**: CSV, XLSX, XLS
- **Size**: Up to 50MB
- **Requirements**: Numeric features for preprocessing and training

### Example Datasets

A sample iris dataset is included in `sample_iris.csv`:
- 150 rows
- 5 columns (4 features + 1 target)
- Perfect for testing classification models

## 🎯 ML Pipeline Nodes

| Node | Description | Configuration |
|------|-------------|---------------|
| **Upload Dataset** | Load CSV/Excel files | File selection |
| **Preprocess Data** | Scale numeric features | Scaler type, columns |
| **Train-Test Split** | Divide data for training | Split ratio, target column |
| **Train Model** | Train ML algorithm | Model type selection |
| **View Results** | Display metrics | Auto-populated |

## 🛠️ API Endpoints

### Backend API (http://localhost:8000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information |
| `/health` | GET | Health check |
| `/docs` | GET | Interactive API docs |
| `/api/ml/upload` | POST | Upload dataset |
| `/api/ml/preprocess` | POST | Preprocess data |
| `/api/ml/split` | POST | Split dataset |
| `/api/ml/train` | POST | Train model |
| `/api/ml/results/{id}` | GET | Get results |

## 📊 Performance Metrics

The application tracks and displays:

- **Accuracy**: Overall correctness of predictions
- **Precision**: Positive prediction accuracy
- **Recall**: True positive rate
- **F1-Score**: Harmonic mean of precision and recall
- **Train/Test Split**: Separate metrics for validation

## 🔧 Configuration

### Backend Configuration

Edit `Backend/.env` or `Backend/app/core/config.py`:

```python
# Server
HOST = "0.0.0.0"
PORT = 8000
DEBUG = True

# CORS
CORS_ORIGINS = ["http://localhost:3000", "http://localhost:3001"]

# ML
RANDOM_STATE = 42
MAX_UPLOAD_SIZE = 52428800  # 50MB
```

### Frontend Configuration

Edit `Frontend/vite.config.ts`:

```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

## 🏭 Production Deployment

### Backend (Docker)

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY Backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY Backend/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend (Build)

```bash
cd Frontend
npm run build
# Serve the dist/ directory with Nginx or similar
```

### Environment Variables

**Backend (.env)**:
```
DEBUG=False
CORS_ORIGINS=https://your-domain.com
```

**Frontend**:
```
VITE_API_URL=https://api.your-domain.com/api
```

## 📁 Project Structure

```
ML-workflow/
├── Backend/
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   ├── core/             # Configuration
│   │   ├── models/           # Pydantic models
│   │   ├── services/         # Business logic
│   │   └── utils/            # Utilities
│   ├── main.py               # Application entry
│   ├── requirements.txt      # Python dependencies
│   └── README.md            # Backend docs
├── Frontend/
│   ├── src/
│   │   ├── api/             # API client
│   │   ├── components/      # React components
│   │   ├── lib/             # Core logic
│   │   └── pages/           # Page components
│   ├── package.json         # Node dependencies
│   └── vite.config.ts       # Vite configuration
└── README.md                # This file
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
---


