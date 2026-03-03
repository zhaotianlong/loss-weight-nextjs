# 减肥训练营管理系统 - 完整 Mermaid 图表

## 1. 系统整体架构

```mermaid
graph TB
    User["👤 用户"]
    
    subgraph Client["客户端层"]
        Browser["浏览器"]
        Mobile["移动端<br/>小程序"]
    end
    
    subgraph Frontend["前端应用<br/>Next.js 16 + React 19"]
        Auth["身份认证"]
        Dashboard["仪表板"]
        StudentMgmt["学员管理"]
        CourseMgmt["课程管理"]
        MealMgmt["菜谱管理"]
        FeeMgmt["费用管理"]
        StaffMgmt["员工管理"]
        Reports["报表统计"]
    end
    
    subgraph API["API 层<br/>Next.js Route Handlers"]
        UserAPI["users/*"]
        StudentAPI["students/*"]
        CourseAPI["courses/*"]
        RecipeAPI["recipes/*"]
        CampAPI["camps/*"]
        TuitionAPI["tuition/*"]
        StatsAPI["stats/*"]
    end
    
    subgraph Service["业务服务层"]
        AuthService["认证服务"]
        UserService["用户服务"]
        StudentService["学员服务"]
        CourseService["课程服务"]
        RecipeService["菜谱服务"]
        PaymentService["支付服务"]
        NotificationService["通知服务"]
    end
    
    subgraph Database["数据存储"]
        PG["PostgreSQL<br/>主数据库"]
        Redis["Redis<br/>缓存"]
        FileStorage["文件存储<br/>学员照片、菜谱图片"]
    end
    
    User --> Browser
    Browser --> Client
    Client --> Frontend
    Frontend --> Auth
    Auth --> AuthService
    Frontend --> Dashboard
    Dashboard --> API
    StudentMgmt --> API
    CourseMgmt --> API
    MealMgmt --> API
    FeeMgmt --> API
    
    API --> Service
    Service --> Database
    Service --> FileStorage
```

## 2. 用户权限树状结构

```mermaid
graph TD
    A["系统管理<br/>Admin"]
    B["营地经理<br/>Manager"]
    C1["教练<br/>Coach"]
    C2["厨师<br/>Chef"]
    C3["保洁<br/>Cleaner"]
    C4["前台<br/>Receptionist"]
    
    A -->|管理所有| A1["用户管理"]
    A -->|管理所有| A2["营地管理"]
    A -->|查看所有| A3["报表统计"]
    A -->|审核所有| A4["支付记录"]
    
    B -->|管理营地| B1["员工管理"]
    B -->|管理营地| B2["房间/床位"]
    B -->|查看| B3["经营报表"]
    B -->|发布| B4["菜谱审核"]
    
    C1 -->|编辑| C1A["我的课程"]
    C1 -->|记录| C1B["学员进度"]
    C1 -->|查看| C1C["学员身体数据"]
    C1 -->|预约| C1D["私教课程"]
    
    C2 -->|创建| C2A["菜谱库"]
    C2 -->|编辑| C2B["每日菜单"]
    C2 -->|查看| C2C["营养分析"]
    
    C3 -->|记录| C3A["卫生巡查"]
    C3 -->|查看| C3B["房间状态"]
    
    C4 -->|办理| C4A["学员入住"]
    C4 -->|收取| C4B["学费费用"]
    C4 -->|报名| C4C["公共课程"]
    C4 -->|预约| C4D["私教课程"]
```

## 3. 学员入营与离营流程

```mermaid
sequenceDiagram
    participant Student as 学员
    participant Receptionist as 前台
    participant System as 系统
    participant DB as 数据库
    
    rect rgb(200, 220, 255)
        Note over Student,DB: 入营流程
        Student ->> Receptionist: 报名申请
        Receptionist ->> System: 创建学员档案
        System ->> DB: 保存学员基本信息
        DB -->> System: 成功
        Receptionist ->> System: 记录身体数据
        System ->> DB: 初始体重、身高等
        Receptionist ->> System: 选择房间/床位
        System ->> DB: 分配床位
        Receptionist ->> System: 收取首期学费
        System ->> DB: 记录学费和过期日期
        System -->> Receptionist: 入营完成
        Receptionist -->> Student: 发放房卡、手册
    end
    
    rect rgb(200, 255, 220)
        Note over Student,DB: 在营期间
        Student ->> System: 参加课程
        System ->> DB: 更新课程签到
        Receptionist ->> System: 定期测量身体数据
        System ->> DB: 记录体重、BMI等
    end
    
    rect rgb(255, 220, 200)
        Note over Student,DB: 离营流程
        Student ->> Receptionist: 申请离营
        Receptionist ->> System: 记录最终身体数据
        System ->> DB: 保存离营前数据
        Receptionist ->> System: 办理退房
        System ->> DB: 更新房间状态
        System -->> Receptionist: 离营完成
        Receptionist -->> Student: 发放结业证书
    end
```

## 4. 学费与续费管理流程

```mermaid
stateDiagram-v2
    [*] --> 待支付
    待支付 --> 已支付: 学员支付
    待支付 --> 退款中: 学员申请退费
    已支付 --> 生效: 系统确认
    生效 --> 即将过期: 7天内
    即将过期 --> 已过期: 时间到达
    已过期 --> 续费中: 学员选择续费
    续费中 --> 续费待支付: 生成续费单
    续费待支付 --> 续费已支付: 学员支付
    续费已支付 --> 生效: 更新过期日期
    已过期 --> 离营: 学员不续费
    退款中 --> [*]
    离营 --> [*]
```

## 5. 课程参加管理

```mermaid
graph TB
    Start["学员入营"] 
    
    subgraph PublicCourse["公共课程 - 免费<br/>每日固定课程"]
        PCheck["查看课程表"]
        PSign["自由报名参加"]
        PAttend["参加课程"]
        PRecord["系统记录签到"]
    end
    
    subgraph PrivateCourse["私教课程 - 付费<br/>个人定制"]
        PrivCheck["查看可用教练"]
        PrivBuy["购买课时"]
        PrivPay["支付费用"]
        PrivBook["预约课程时间"]
        PrivAttend["进行私教课"]
        PrivRecord["更新完成课时"]
    end
    
    Start --> PCheck
    Start --> PrivCheck
    PCheck --> PSign
    PSign --> PAttend
    PAttend --> PRecord
    
    PrivCheck --> PrivBuy
    PrivBuy --> PrivPay
    PrivPay --> PrivBook
    PrivBook --> PrivAttend
    PrivAttend --> PrivRecord
    
    PRecord --> Progress["生成进度报告"]
    PrivRecord --> Progress
    Progress --> End["结业或续费"]
```

## 6. 菜谱与每日菜单系统

```mermaid
graph LR
    subgraph RecipeDB["菜谱库<br/>共享库"]
        R1["菜谱1<br/>鸡胸肉沙拉<br/>350kcal"]
        R2["菜谱2<br/>糙米粥<br/>200kcal"]
        R3["菜谱3<br/>清蒸鱼<br/>280kcal"]
        R4["菜谱N<br/>..."]
    end
    
    subgraph Chef["厨师<br/>Chef"]
        CCreate["创建菜谱"]
        CEdit["编辑菜谱"]
        CArrange["安排每日菜单"]
    end
    
    subgraph DailyMenu["每日菜单"]
        D1["早餐<br/>燕麦粥<br/>250kcal<br/>7:00"]
        D2["加餐<br/>低脂酸奶<br/>120kcal<br/>10:00"]
        D3["午餐<br/>鸡+米+菜<br/>480kcal<br/>12:00"]
        D4["晚餐<br/>鱼+蒸菜<br/>350kcal<br/>18:00"]
    end
    
    subgraph Student["学员查看"]
        SView["查看每日菜单"]
        SNutrition["查看营养信息"]
    end
    
    CCreate --> RecipeDB
    CEdit --> RecipeDB
    CArrange --> DailyMenu
    RecipeDB --> CArrange
    
    DailyMenu --> SView
    DailyMenu --> SNutrition
    
    style RecipeDB fill:#e1f5ff
    style DailyMenu fill:#f1f8e9
    style Student fill:#fff3e0
```

## 7. 营地床位与房间管理

```mermaid
graph TD
    Camp["营地<br/>北京减肥营"]
    
    Camp --> Floor1["1楼"]
    Camp --> Floor2["2楼"]
    Camp --> Floor3["3楼"]
    
    Floor1 --> R101["101房<br/>3张床"]
    Floor1 --> R102["102房<br/>2张床"]
    Floor1 --> R103["103房<br/>2张床"]
    
    Floor2 --> R201["201房<br/>3张床"]
    Floor2 --> R202["202房<br/>4张床"]
    
    Floor3 --> R301["301房<br/>3张床"]
    
    R101 --> B101A["床位1A<br/>已入住<br/>张某"]
    R101 --> B101B["床位1B<br/>已入住<br/>李某"]
    R101 --> B101C["床位1C<br/>空闲"]
    
    R102 --> B102A["床位2A<br/>已入住<br/>王某"]
    R102 --> B102B["床位2B<br/>空闲"]
    
    style R101 fill:#c8e6c9
    style R102 fill:#fff9c4
    style R201 fill:#c8e6c9
    style B101A fill:#81c784
    style B101C fill:#e0e0e0
    style B102B fill:#e0e0e0
```

## 8. 支付与财务流程

```mermaid
graph TB
    subgraph Payment["支付入口"]
        FirstPay["首期学费"]
        Renewal["续费学费"]
        PrivateCourse["私教课程"]
    end
    
    subgraph Gateway["支付网关"]
        Alipay["支付宝"]
        Wechat["微信支付"]
        Card["银行卡"]
    end
    
    subgraph System["系统处理"]
        Verify["验证支付"]
        Update["更新记录"]
        Notify["发送通知"]
    end
    
    subgraph Record["财务记录"]
        Tuition["学费记录"]
        Income["收入统计"]
        Report["财务报表"]
    end
    
    FirstPay --> Alipay
    FirstPay --> Wechat
    Renewal --> Alipay
    Renewal --> Wechat
    PrivateCourse --> Card
    
    Alipay --> Verify
    Wechat --> Verify
    Card --> Verify
    
    Verify --> Update
    Update --> Notify
    Update --> Tuition
    
    Tuition --> Income
    Income --> Report
```

## 9. 学员身体数据追踪

```mermaid
graph LR
    Start["入营<br/>初始数据"]
    
    Start --> Week1["第1周<br/>测量"]
    Week1 --> W1D["体重: 85kg<br/>BMI: 28.3<br/>体脂: 32%"]
    
    W1D --> Week2["第2周<br/>测量"]
    Week2 --> W2D["体重: 83kg<br/>BMI: 27.7<br/>体脂: 31%"]
    
    W2D --> Week4["第4周<br/>测量"]
    Week4 --> W4D["体重: 80kg<br/>BMI: 26.7<br/>体脂: 29%"]
    
    W4D --> Month3["3月<br/>测量"]
    Month3 --> M3D["体重: 75kg<br/>BMI: 25.0<br/>体脂: 26%"]
    
    M3D --> End["离营<br/>最终数据"]
    
    W1D --> Chart1["📊 进度曲线"]
    W2D --> Chart1
    W4D --> Chart1
    M3D --> Chart1
    
    Chart1 --> Analysis["体重下降: 10kg<br/>BMI下降: 3.3<br/>体脂下降: 6%"]
    Analysis --> Report["生成结业报告"]
    
    style Start fill:#e3f2fd
    style End fill:#c8e6c9
    style Chart1 fill:#fff9c4
```

## 10. 系统统计仪表板

```mermaid
graph TB
    Dashboard["仪表板"]
    
    Dashboard --> StudentStats["👥 学员统计"]
    StudentStats --> SS1["总学员: 150"]
    StudentStats --> SS2["在训: 125"]
    StudentStats --> SS3["暂停: 15"]
    StudentStats --> SS4["已结业: 10"]
    
    Dashboard --> CampStats["🏕️ 营地统计"]
    CampStats --> CS1["总床位: 200"]
    CampStats --> CS2["已占用: 125"]
    CampStats --> CS3["入住率: 62.5%"]
    
    Dashboard --> FinanceStats["💰 财务统计"]
    FinanceStats --> FS1["本月收入: ¥125万"]
    FinanceStats --> FS2["待收费用: ¥5万"]
    FinanceStats --> FS3["续费率: 85%"]
    
    Dashboard --> CourseStats["📚 课程统计"]
    CourseStats --> CS1A["公共课: 12门"]
    CourseStats --> CS2A["私教: 45节"]
    CourseStats --> CS3A["平均参加率: 92%"]
    
    Dashboard --> AlertStats["⚠️ 预警信息"]
    AlertStats --> AS1["7天内到期: 5人"]
    AlertStats --> AS2["待收费用: 8笔"]
    AlertStats --> AS3["床位故障: 2张"]
```

## 11. 数据库关系图（简化版）

```mermaid
graph LR
    User["User<br/>用户表"]
    Camp["Camp<br/>营地表"]
    Room["Room<br/>房间表"]
    Bed["Bed<br/>床位表"]
    Student["Student<br/>学员表"]
    StudentPhysical["StudentPhysicalInfo<br/>身体数据表"]
    StudentCheckIn["StudentCheckIn<br/>入住记录表"]
    PublicCourse["PublicCourse<br/>公共课程表"]
    PrivateCourse["PrivateCourse<br/>私教课程表"]
    Recipe["Recipe<br/>菜谱表"]
    DailyMenu["DailyMenu<br/>每日菜单表"]
    Tuition["StudentTuition<br/>学费表"]
    TuitionRenewal["TuitionRenewal<br/>续费表"]
    
    User -->|管理| Camp
    Camp -->|包含| Room
    Room -->|包含| Bed
    
    User -->|教授| PublicCourse
    User -->|教授| PrivateCourse
    User -->|创建| Recipe
    
    Student -->|入住| Bed
    Student -->|拥有| StudentPhysicalInfo
    Student -->|生成| StudentCheckIn
    Student -->|参加| PublicCourse
    Student -->|购买| PrivateCourse
    Student -->|支付| Tuition
    
    Tuition -->|续费| TuitionRenewal
    
    Recipe -->|组成| DailyMenu
    Camp -->|使用| DailyMenu
```

## 12. 部署架构

```mermaid
graph TB
    CDN["CDN<br/>静态资源加速"]
    
    subgraph Frontend["前端部署<br/>Vercel / 自建"]
        Next["Next.js App"]
    end
    
    subgraph Backend["后端服务<br/>Node.js"]
        API["API Routes<br/>app/api"]
        Auth["JWT 认证"]
        Business["业务逻辑"]
    end
    
    subgraph Database["数据存储"]
        PostgreSQL["PostgreSQL<br/>主数据库"]
        Redis["Redis<br/>缓存/会话"]
    end
    
    subgraph External["外部服务"]
        Payment["支付网关<br/>支付宝/微信"]
        Email["邮件服务<br/>通知"]
        SMS["短信服务<br/>提醒"]
    end
    
    Client["客户端<br/>浏览器"]
    
    Client -->|静态资源| CDN
    Client -->|API请求| Frontend
    Frontend -->|服务| Next
    Next -->|调用| Backend
    Backend -->|验证| Auth
    Backend -->|执行| Business
    Business -->|读写| Database
    Backend -->|调用| External
    
    style Frontend fill:#bbdefb
    style Backend fill:#c8e6c9
    style Database fill:#fff9c4
    style External fill:#ffccbc
```

## 13. 完整用户流程图

```mermaid
stateDiagram-v2
    [*] --> 登录
    登录 --> 身份验证: 输入账号密码
    身份验证 --> 权限检查: 验证成功
    权限检查 --> 仪表板: Admin/Manager
    权限检查 --> CoachPanel: Coach
    权限检查 --> ChefPanel: Chef
    权限检查 --> ReceptionPanel: Receptionist
    
    仪表板 --> 查看统计
    查看统计 --> 管理功能
    管理功能 --> 学员管理
    管理功能 --> 营地管理
    管理功能 --> 报表统计
    
    CoachPanel --> 查看课程
    查看课程 --> 教学
    教学 --> 记录学员进度
    
    ChefPanel --> 浏览菜谱库
    浏览菜谱库 --> 创建菜谱
    创建菜谱 --> 安排菜单
    
    ReceptionPanel --> 办理入住
    办理入住 --> 收取学费
    收取学费 --> 报名课程
    报名课程 --> 其他业务
    
    学员管理 --> 记录身体数据
    记录身体数据 --> 追踪进度
    追踪进度 --> 生成报告
    
    其他业务 --> 退出登录
    生成报告 --> 退出登录
    [*] <-- 退出登录
```

---

## 图表说明

1. **系统整体架构** - 展示前端、API、服务和数据库的分层结构
2. **权限树状结构** - 不同角色的权限细分
3. **学员入营流程** - 时序图展示完整的入营、在营、离营过程
4. **学费续费管理** - 学费从待支付到离营的完整状态转移
5. **课程参加管理** - 公共课和私教课的不同流程
6. **菜谱与菜单系统** - 菜谱库和每日菜单的关系
7. **营地床位管理** - 营地层级结构和床位分配
8. **支付与财务流程** - 支付网关到财务记录的流程
9. **学员身体数据** - 长期追踪的数据和进度报告
10. **仪表板统计** - 主要的 KPI 和预警信息
11. **数据库关系图** - 所有表之间的关系
12. **部署架构** - 生产环境的系统架构
13. **用户流程** - 完整的用户操作流程

