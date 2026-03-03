export interface Course {
  id: number;
  courseId: number;
  title: string;
  campId: number;
  coachId: string;
  schedule: string;
  location: string;
  status: number;
  createTime: string;
  updateTime: string;
}

export interface CourseCoachRelation {
  id: number;
  courseId: number;
  coachId: string;
  coachName: string;
}

// 公共课数据
export const course: Course[] = [
  { 
    id: 1,
    courseId: 20001, 
    title: "团体有氧", 
    campId: 101, 
    coachId: "emp002", 
    schedule: "每日 08:00", 
    location: "操场",
    status: 1, 
    createTime: "2025-02-25T07:05:34.930Z", 
    updateTime: "2025-02-25T07:05:34.930Z" 
  },
  { 
    id: 2,
    courseId: 20002, 
    title: "力量训练", 
    campId: 102, 
    coachId: "emp012", 
    schedule: "每日 09:00", 
    location: "力量房",
    status: 1, 
    createTime: "2025-03-23T16:45:40.625Z", 
    updateTime: "2025-03-23T16:45:40.625Z" 
  }
];

// 课程与教练关系表 (平铺)
export const courseCoachRelations: CourseCoachRelation[] = [
  { id: 1, courseId: 20001, coachId: "emp002", coachName: "李强" },
  { id: 2, courseId: 20002, coachId: "emp012", coachName: "王伟" }
];
