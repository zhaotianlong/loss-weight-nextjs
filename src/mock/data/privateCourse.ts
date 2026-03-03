export interface PrivateCourse {
  id: number;
  courseId: number;
  campId: number; // 区分营地
  type: string;
  paymentType: string; // '包月,单节'
  price?: number;
  monthlyPrice?: number;
  monthlySessions?: number;
  duration: number;
  status: number;
  createTime: string;
  updateTime: string;
}

// 私教课数据
export const privateCourse: PrivateCourse[] = [
  {
    id: 1,
    courseId: 10001,
    campId: 101, // 假设属于101营地
    type: '常规',
    paymentType: '包月,单节',
    price: 300,
    monthlyPrice: 3000,
    monthlySessions: 30,
    duration: 60,
    status: 1,
    createTime: '2024-08-02T08:37:03.978Z',
    updateTime: '2024-08-02T08:37:03.978Z',
  },
  {
    id: 2,
    courseId: 10002,
    campId: 101, // 假设属于101营地
    type: '拉伸',
    paymentType: '包月',
    monthlyPrice: 2000,
    monthlySessions: 30,
    duration: 45,
    status: 1,
    createTime: '2025-05-08T13:29:11.857Z',
    updateTime: '2025-05-08T13:29:11.857Z',
  },
  {
    id: 3,
    courseId: 10003,
    campId: 101, // 假设属于101营地
    type: '瑜伽',
    paymentType: '单节',
    price: 350,
    duration: 90,
    status: 1,
    createTime: '2025-05-03T16:27:39.921Z',
    updateTime: '2025-05-03T16:27:39.921Z',
  },
  {
    id: 4,
    courseId: 10004,
    campId: 102, // 假设属于102营地
    type: '普拉提',
    paymentType: '单节',
    price: 400,
    duration: 60,
    status: 1,
    createTime: '2025-05-03T16:27:39.921Z',
    updateTime: '2025-05-03T16:27:39.921Z',
  },
  {
    id: 5,
    courseId: 10005,
    campId: 102, // 假设属于102营地
    type: '筋膜刀',
    paymentType: '单节',
    price: 500,
    duration: 30,
    status: 1,
    createTime: '2025-05-03T16:27:39.921Z',
    updateTime: '2025-05-03T16:27:39.921Z',
  }
];

// 私教课与教练关系表 (平铺)
export const privateCourseCoachRelations = [
  // 课程 10001 (营地 101)
  { "id": 100, "courseId": 10001, "coachId": "emp002", "coachName": "李强" },
  { "id": 101, "courseId": 10001, "coachId": "emp003", "coachName": "王丽" },
  { "id": 102, "courseId": 10001, "coachId": "emp004", "coachName": "赵刚" },
  { "id": 103, "courseId": 10001, "coachId": "emp005", "coachName": "陈明" },

  // 课程 10002 (营地 101)
  { "id": 104, "courseId": 10002, "coachId": "emp002", "coachName": "李强" },
  { "id": 105, "courseId": 10002, "coachId": "emp003", "coachName": "王丽" },
  { "id": 106, "courseId": 10002, "coachId": "emp004", "coachName": "赵刚" },
  { "id": 107, "courseId": 10002, "coachId": "emp005", "coachName": "陈明" },

  // 课程 10003 (营地 101)
  { "id": 108, "courseId": 10003, "coachId": "emp002", "coachName": "李强" },
  { "id": 109, "courseId": 10003, "coachId": "emp003", "coachName": "王丽" },
  { "id": 110, "courseId": 10003, "coachId": "emp004", "coachName": "赵刚" },
  { "id": 111, "courseId": 10003, "coachId": "emp005", "coachName": "陈明" },

  // 课程 10004 (营地 102)
  { "id": 112, "courseId": 10004, "coachId": "emp011", "coachName": "林丽" },
  { "id": 113, "courseId": 10004, "coachId": "emp012", "coachName": "黄涛" },
  { "id": 114, "courseId": 10004, "coachId": "emp013", "coachName": "孙颖" },
  { "id": 115, "courseId": 10004, "coachId": "emp014", "coachName": "吴昊" },

  // 课程 10005 (营地 102)
  { "id": 116, "courseId": 10005, "coachId": "emp011", "coachName": "林丽" },
  { "id": 117, "courseId": 10005, "coachId": "emp012", "coachName": "黄涛" },
  { "id": 118, "courseId": 10005, "coachId": "emp013", "coachName": "孙颖" },
  { "id": 119, "courseId": 10005, "coachId": "emp014", "coachName": "吴昊" }
];
