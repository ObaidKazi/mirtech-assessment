# High-Performance Data Table

A full-stack application demonstrating high-performance data handling with 100,000+ records, featuring instantaneous response times and smooth user experience.

## 🚀 Features

- **Backend (FastAPI)**
  - REST API with filtering, sorting, and pagination
  - 100,000+ realistic seeded records
  - Redis caching for <100ms response times
  - Optimized PostgreSQL queries with indexing
  - Comprehensive error handling and validation

- **Frontend (Next.js + TypeScript)**
  - Virtual scrolling for smooth performance
  - Real-time search and filtering
  - Responsive design with shadcn/ui components
  - Detailed item view pages
  - Loading states and error handling

- **Performance Optimizations**
  - Database connection pooling
  - Query optimization with proper indexing
  - Redis caching layer
  - Virtual scrolling for large datasets
  - Debounced search inputs
  - Efficient pagination

## 🛠 Tech Stack

- **Backend**: FastAPI, PostgreSQL, Redis, SQLAlchemy
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Deployment**: Docker Compose
- **Performance**: Virtual scrolling, caching, query optimization

## 🚀 Quick Start

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd mirtech-assessment
   ```

2. **Start the application**:
   ```bash
   docker-compose up --build
   ```

3. **Seed the database**:
   ```bash
   curl -X POST http://localhost:8000/seed-data
   ```
   or you can directly open frontend and click the button for seeding sample data

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 📊 Performance Metrics

- **API Response Times**: <100ms (with caching)
- **Initial Page Load**: <2 seconds
- **Search Response**: <300ms (debounced)
- **Memory Usage**: Optimized for large datasets

## 🏗 Architecture

### Backend Architecture
- **FastAPI**: High-performance async web framework
- **PostgreSQL**: Optimized with proper indexing
- **Redis**: Caching layer for frequent queries
- **SQLAlchemy**: ORM with connection pooling

### Frontend Architecture
- **Next.js 14**: App Router with TypeScript
- **Virtual Scrolling**: @tanstack/react-virtual
- **State Management**: React hooks with optimized re-renders
- **UI Components**: shadcn/ui with Tailwind CSS

### Performance Optimizations

1. **Database Level**:
   - Proper indexing on searchable/sortable columns
   - Connection pooling (20 connections, 30 overflow)
   - Optimized queries with selective loading

2. **Caching Strategy**:
   - Redis caching with 5-minute TTL
   - Cache invalidation on data changes
   - Efficient cache key generation

3. **Frontend Optimizations**:
   - Virtual scrolling for large lists
   - Debounced search (300ms)
   - Optimized re-renders with React.memo
   - Lazy loading of components

## 🔧 Development

### Running Locally

1. **Backend only**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

2. **Frontend only**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. The application is containerized and you can run via docker also:

```bash
# Command
docker-compose up -d

```

### Database Management

- **Seed data**: `POST /seed-data`
- **View stats**: `GET /stats`
- **Clear cache**: Redis CLI `FLUSHALL`

## 📈 Monitoring

- Response times logged in `X-Process-Time` header
- Database query performance via SQLAlchemy logging
- Redis cache hit/miss rates
- Frontend performance via browser dev tools


## 🔮 Future Improvements

With more time, I would implement:

**Performance Enhancements**:
- Database read replicas for better query distribution
- CDN integration for static assets
- Server-side rendering optimization
- Advanced caching strategies (cache warming, intelligent invalidation)

**Feature Additions**:
- Advanced filtering with date ranges and complex queries
- Export functionality (CSV, Excel, PDF)
- User authentication and role-based access
- Audit logging for data changes
- Advanced analytics and reporting dashboard
- Mobile-optimized responsive design
  
The current implementation demonstrates solid architectural foundations that would support these enhancements while maintaining the high-performance characteristics required for large-scale data applications.
