export interface CoachStudentRelation {
  id: number;
  campId: number;
  coachId: string;
  coachName: string;
  studentId: number;
  studentName: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'ended' | 'transferred';
  createTime: string;
  updateTime: string;
}

export const coachStudentRelations: CoachStudentRelation[] = [
  {
    id: 1,
    campId: 101,
    coachId: 'emp003',
    coachName: '王丽',
    studentId: 1001,
    studentName: '刘阳',
    startDate: '2025-10-01',
    status: 'active',
    createTime: '2025-10-01T10:00:00.000Z',
    updateTime: '2025-10-01T10:00:00.000Z',
  },
  {
    id: 2,
    campId: 101,
    coachId: 'emp003',
    coachName: '王丽',
    studentId: 1002,
    studentName: '张伟',
    startDate: '2025-10-02',
    status: 'active',
    createTime: '2025-10-02T11:00:00.000Z',
    updateTime: '2025-10-02T11:00:00.000Z',
  }
];
