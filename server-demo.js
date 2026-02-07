const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:8000', 'http://127.0.0.1:8000'],
  credentials: true
}));

// Body parsing middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// In-memory database for demo
const demoData = {
  users: [],
  jobs: [],
  applications: []
};

// Demo middleware to simulate database
const simulateDB = (req, res, next) => {
  req.db = demoData;
  next();
};

app.use('/api', simulateDB);

// Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'نبض اليمن برو API is running (Demo Mode)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mode: 'DEMO - In-memory database'
  });
});

// Demo Authentication Routes
app.post('/api/auth/register', (req, res) => {
  try {
    const { firstName, lastName, email, password, userType, phone } = req.body;
    
    // Simple validation
    if (!firstName || !lastName || !email || !password || !userType || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Check if user exists
    const existingUser = req.db.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Create user
    const user = {
      id: Date.now().toString(),
      firstName,
      lastName,
      email,
      userType,
      phone,
      isActive: true,
      isEmailVerified: false,
      createdAt: new Date()
    };
    
    req.db.users.push(user);
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userType: user.userType,
          isActive: user.isActive
        },
        token: 'demo-jwt-token-' + user.id,
        refreshToken: 'demo-refresh-token-' + user.id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find user
    const user = req.db.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userType: user.userType,
          isActive: user.isActive
        },
        token: 'demo-jwt-token-' + user.id,
        refreshToken: 'demo-refresh-token-' + user.id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

app.get('/api/auth/profile', (req, res) => {
  try {
    // In demo, we'll return a mock profile
    const mockUser = {
      id: '1',
      firstName: 'أحمد',
      lastName: 'محمد',
      email: 'ahmed@demo.com',
      userType: 'doctor',
      isActive: true,
      isEmailVerified: true,
      doctorInfo: {
        specialization: 'general-practitioner',
        highestDegree: 'bachelor',
        university: 'جامعة صنعاء',
        yearsOfExperience: 3,
        commissionAgreement: {
          agreed: true,
          percentage: 5
        }
      }
    };
    
    res.json({
      success: true,
      data: {
        user: mockUser
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// Demo Jobs Routes
app.get('/api/jobs', (req, res) => {
  try {
    const mockJobs = [
      {
        id: '1',
        title: 'طبيب عام',
        description: 'نحتاج طبيب عام للعمل في مستشفانا الحكومي',
        jobType: 'full-time',
        specialization: 'general-practitioner',
        location: {
          governorate: 'sanaa',
          city: 'صنعاء'
        },
        compensation: {
          salaryRange: {
            min: 150000,
            max: 250000,
            currency: 'YER'
          }
        },
        urgencyLevel: 'normal',
        status: 'active',
        createdAt: new Date(),
        employer: {
          id: '1',
          organizationName: 'مستشفى الأمل'
        }
      },
      {
        id: '2',
        title: 'طبيب أطفال',
        description: 'مطلوب طبيب أطفال ذو خبرة لعيادة خاصة',
        jobType: 'part-time',
        specialization: 'pediatrician',
        location: {
          governorate: 'aden',
          city: 'عدن'
        },
        compensation: {
          salaryRange: {
            min: 200000,
            max: 300000,
            currency: 'YER'
          }
        },
        urgencyLevel: 'high',
        status: 'active',
        createdAt: new Date(),
        employer: {
          id: '2',
          organizationName: 'عيادة الأطفال الصغار'
        }
      }
    ];
    
    res.json({
      success: true,
      data: {
        jobs: mockJobs,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalJobs: mockJobs.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching jobs'
    });
  }
});

app.post('/api/jobs', (req, res) => {
  try {
    const jobData = {
      id: Date.now().toString(),
      ...req.body,
      status: 'active',
      createdAt: new Date()
    };
    
    req.db.jobs.push(jobData);
    
    res.status(201).json({
      success: true,
      data: {
        job: jobData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while creating job'
    });
  }
});

// Demo Applications Routes
app.post('/api/applications/jobs/:jobId', (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter, expectedSalary } = req.body;
    
    const application = {
      id: Date.now().toString(),
      jobId,
      applicantId: '1',
      status: 'pending',
      coverLetter,
      expectedSalary,
      matchScore: 85,
      submittedAt: new Date()
    };
    
    req.db.applications.push(application);
    
    res.status(201).json({
      success: true,
      data: {
        application,
        matchScore: 85,
        matchDetails: {
          specializationMatch: true,
          experienceMatch: true,
          locationMatch: false
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while submitting application'
    });
  }
});

app.get('/api/applications/employer', (req, res) => {
  try {
    const mockApplications = [
      {
        id: '1',
        job: {
          id: '1',
          title: 'طبيب عام'
        },
        applicant: {
          id: '1',
          firstName: 'أحمد',
          lastName: 'محمد',
          doctorInfo: {
            specialization: 'general-practitioner',
            yearsOfExperience: 3
          }
        },
        status: 'pending',
        matchScore: 85,
        submittedAt: new Date(),
        isContactInfoVisible: false
      }
    ];
    
    res.json({
      success: true,
      data: {
        applications: mockApplications,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalApplications: mockApplications.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications'
    });
  }
});

// Demo Admin Routes
app.get('/api/admin/dashboard', (req, res) => {
  try {
    const mockStats = {
      users: {
        total: 150,
        doctors: 120,
        employers: 30
      },
      jobs: {
        total: 45,
        active: 32
      },
      applications: {
        total: 280,
        pending: 45,
        accepted: 12,
        hired: 8
      },
      financial: {
        totalCommission: 2500000,
        averageCommission: 125000,
        totalHires: 20
      }
    };
    
    res.json({
      success: true,
      data: mockStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Error:', error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Mode: DEMO - In-memory database (No MongoDB required)`);
  console.log(`📝 Available endpoints:`);
  console.log(`   POST /api/auth/register - Register new user`);
  console.log(`   POST /api/auth/login - User login`);
  console.log(`   GET  /api/auth/profile - Get user profile`);
  console.log(`   GET  /api/jobs - Get all jobs`);
  console.log(`   POST /api/jobs - Create new job`);
  console.log(`   POST /api/applications/jobs/:jobId - Submit application`);
  console.log(`   GET  /api/applications/employer - Get employer applications`);
  console.log(`   GET  /api/admin/dashboard - Get admin dashboard`);
});

module.exports = app;
