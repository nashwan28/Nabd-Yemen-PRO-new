# 🚀 نبض اليمن برو - Backend API Documentation

## نظرة عامة

هذا هو Backend API لمنصة نبض اليمن برو، المبني باستخدام Node.js و Express و MongoDB. يوفر النظام الكامل لإدارة المستخدمين والوظائف والطلبات مع نظام مصادقة آمن وخوارزمية مطابقة ذكية.

## 🏗️ البنية التقنية

### التقنيات المستخدمة
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **compression** - Response compression
- **morgan** - HTTP request logger
- **express-rate-limit** - Rate limiting

## 📁 هيكل المشروع

```
nabd-yemen-pro-backend/
├── server.js                 # Main server file
├── package.json              # Dependencies and scripts
├── .env.example              # Environment variables template
├── models/                   # MongoDB Schemas
│   ├── User.js              # User model
│   ├── Job.js               # Job model
│   └── Application.js       # Application model
├── controllers/              # Business logic
│   ├── authController.js    # Authentication logic
│   ├── jobController.js     # Job management logic
│   └── applicationController.js # Application logic
├── routes/                   # API endpoints
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── jobs.js              # Job routes
│   ├── applications.js      # Application routes
│   └── admin.js             # Admin routes
├── middleware/               # Custom middleware
│   └── auth.js              # Authentication middleware
├── utils/                   # Utility functions
├── uploads/                 # File upload directory
└── api-client.js           # Frontend API client
```

## 🚀 التثبيت والتشغيل

### المتطلبات الأساسية
- Node.js 16+ 
- MongoDB 4.4+
- npm أو yarn

### خطوات التثبيت

1. **تثبيت الاعتماديات**
```bash
npm install
```

2. **إعداد متغيرات البيئة**
```bash
cp .env.example .env
```

3. **تحديث متغيرات البيئة في ملف .env**
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/nabd-yemen-pro

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# WhatsApp API (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Commission Settings
COMMISSION_PERCENTAGE=5
FOLLOW_UP_DAYS=7
```

4. **تشغيل الخادم**
```bash
# للتطوير
npm run dev

# للإنتاج
npm start
```

## 📚 وثائق API

### المصادقة (Authentication)

#### تسجيل مستخدم جديد
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "أحمد",
  "lastName": "محمد",
  "email": "ahmed@example.com",
  "password": "Password123",
  "userType": "doctor",
  "phone": "+967123456789",
  "specialization": "general-practitioner",
  "highestDegree": "bachelor",
  "university": "جامعة صنعاء",
  "graduationYear": 2020,
  "yearsOfExperience": 3,
  "commissionAgreement": true
}
```

#### تسجيل الدخول
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "ahmed@example.com",
  "password": "Password123",
  "rememberMe": true
}
```

#### الحصول على الملف الشخصي
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### الوظائف (Jobs)

#### الحصول على كل الوظائف
```http
GET /api/jobs?page=1&limit=20&specialization=general-practitioner&governorate=sanaa
Authorization: Bearer <token>
```

#### إنشاء وظيفة جديدة (لأصحاب العمل)
```http
POST /api/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "طبيب عام",
  "description": "نحتاج طبيب عام للعمل في مستشفينا...",
  "jobType": "full-time",
  "specialization": "general-practitioner",
  "educationRequirements": {
    "highestDegree": "bachelor"
  },
  "experienceRequirements": {
    "minimumYears": 2
  },
  "location": {
    "governorate": "sanaa",
    "city": "صنعاء",
    "address": "شارع العرضي"
  },
  "workSchedule": {
    "shiftType": "morning"
  },
  "compensation": {
    "salaryRange": {
      "min": 150000,
      "max": 250000,
      "currency": "YER"
    }
  },
  "applicationProcess": {
    "applicationDeadline": "2024-12-31T23:59:59Z"
  }
}
```

#### الحصول على الوظائف المطابقة (للأطباء)
```http
GET /api/jobs/matching?minMatchScore=60
Authorization: Bearer <token>
```

### الطلبات (Applications)

#### تقديم طلب وظيفة
```http
POST /api/applications/jobs/<jobId>
Authorization: Bearer <token>
Content-Type: application/json

{
  "coverLetter": "أنا مهتم جداً بهذه الوظيفة...",
  "expectedSalary": 200000,
  "availableStartDate": "2024-02-01",
  "documents": [
    {
      "type": "cv",
      "fileUrl": "https://example.com/cv.pdf"
    }
  ]
}
```

#### الحصول على طلبات صاحب العمل
```http
GET /api/applications/employer?status=pending
Authorization: Bearer <token>
```

#### تحديث حالة الطلب
```http
PATCH /api/applications/<applicationId>/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "accepted",
  "notes": "المتقدم مناسب للوظيفة",
  "interviewDetails": {
    "scheduledDate": "2024-01-15T10:00:00Z",
    "interviewType": "in-person"
  }
}
```

## 🔒 الأمان والخصوصية

### حماية البيانات الشخصية
- بيانات التواصل (رقم الهاتف والبريد الإلكتروني) مخفية افتراضياً
- يتم الكشف عن البيانات فقط عند قبول الطلب
- تسجيل جميع عمليات كشف البيانات للتدقيق

### المصادقة
- استخدام JWT tokens آمنة
- انتهاء صلاحية تلقائي
- إمكانية تجديد الـ tokens
- حماية من هجمات Brute Force

### التحقق من المدخلات
- تحقق صارم من جميع المدخلات
- حماية من XSS و SQL Injection
- تحقق من صحة الملفات المرفوعة

## 🧠 خوارزمية المطابقة الذكية

### نظام النقاط
- **التخصص**: 40 نقطة
- **الخبرة**: 30 نقطة
- **الموقع**: 30 نقطة
- **عوامل إضافية**: 10 نقاط (اللغة، التوفر الفوري، الراتب)

### شروط القبول
- الحد الأدنى للقبول: 60 نقطة
- مطابقة التخصص إلزامية
- الخبرة لا تقل عن المطلوب بسنة واحدة

## 💰 نظام العمولات

### المتابعة المالية
- تتبع تلقائي للحالات المالية
- تنبيهات بعد 5-7 أيام من القبول
- حساب العمولة تلقائياً (5% من الراتب الأول)

### الحالات المالية
1. `pending` - في انتظار نتيجة المقابلة
2. `follow-up-required` - يحتاج متابعة
3. `hired` - تم التوظيف
4. `commission-due` - العمولة مستحقة
5. `commission-paid` - تم تحصيل العمولة

## 📊 الإحصائيات والتقارير

### لوحة تحكم الإدارة
- إحصائيات شاملة عن المستخدمين والوظائف
- متابعة العمولات والإيرادات
- تقارير مالية مفصلة

### تقارير مالية
- تقارير حسب الفترة الزمنية
- تحليل الإيرادات الشهرية/ربع سنوية/سنوية
- متوسط العمولات وعدد التوظيفات

## 🔄 سير العمل (Workflow)

### سيناريو التقديم على وظيفة
1. الطبيب يبحث عن وظائف مطابقة
2. النظام يحسب نقاط المطابقة تلقائياً
3. الطبيب يقدم الطلب مع الموافقة على شروط العمولة
4. صاحب العمل يرى الطلب (بدون بيانات تواصل)
5. صاحب العمل يقبل الطلب → يتم كشف بيانات التواصل
6. النظام يبدأ المتابعة المالية تلقائياً

### سيناريو المتابعة المالية
1. بعد قبول الطلب، يتم تحديد موعد للمتابعة (5 أيام)
2. النظام يرسل تنبيهات للمتابعة
3. عند تأكيد التوظيف، يتم حساب العمولة
4. الإدارة تقوم بتحصيل العمولة وتحديث الحالة

## 🚀 النشر (Deployment)

### متطلبات الإنتاج
- Node.js 16+
- MongoDB 4.4+
- Reverse proxy (Nginx)
- SSL certificate
- Process manager (PM2)

### خطوات النشر
1. إعداد قاعدة البيانات
2. تكوين متغيرات البيئة
3. تثبيت الاعتماديات
4. بناء المشروع للإنتاج
5. تشغيل الخادم باستخدام process manager

## 🧪 الاختبار

### اختبار الـ API
```bash
# استخدام Postman أو curl
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'
```

### اختبار الوحدات
```bash
npm test
```

## 🐛 حل المشاكل الشائعة

### مشاكل الاتصال بقاعدة البيانات
- تأكد من تشغيل MongoDB
- تحقق من صلة الاتصال في MONGODB_URI
- تأكد من صلاحيات المستخدم

### مشاكل المصادقة
- تحقق من JWT_SECRET
- تأكد من انتهاء صلاحية الـ token
- تحقق من إعدادات CORS

## 📞 الدعم

للحصول على الدعم الفني:
- البريد الإلكتروني: support@nabd-yemen.pro
- التوثيق: https://docs.nabd-yemen.pro
- Issues: GitHub Repository

---

**© 2026 نبض اليمن برو - جميع الحقوق محفوظة**
