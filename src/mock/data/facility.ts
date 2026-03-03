
export interface Facility {
  id: number;
  campId: number;
  name: string; // 场地名称
  location: string; // 具体地点
  capacity: number; // 容纳人数
  description: string; // 特点描述
  photos: string[]; // 照片
  createTime: string;
  updateTime: string;
}

export const facilities: Facility[] = [
  {
    id: 1,
    campId: 101,
    name: '有氧区',
    location: '主楼一层东侧',
    capacity: 30,
    description: '配备先进的跑步机、椭圆机，采光充足，视野开阔。',
    photos: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80'],
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
  },
  {
    id: 2,
    campId: 101,
    name: '器械区',
    location: '主楼一层西侧',
    capacity: 25,
    description: '全套力量训练器材，适合各个等级的训练者。',
    photos: ['https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80'],
    createTime: '2024-01-02 11:00:00',
    updateTime: '2024-01-02 11:00:00',
  },
  {
    id: 3,
    campId: 102,
    name: '单车室',
    location: '二号楼三层',
    capacity: 20,
    description: '动感单车教室，配备专业音响和灯光系统。',
    photos: ['https://images.unsplash.com/photo-1591117207239-7887392d7b57?w=800&q=80'],
    createTime: '2024-01-03 09:30:00',
    updateTime: '2024-01-03 09:30:00',
  },
  {
    id: 4,
    campId: 102,
    name: '操课区',
    location: '二号楼二层大厅',
    capacity: 50,
    description: '超大无柱空间，适合团体课程和大型活动。',
    photos: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80'],
    createTime: '2024-01-04 14:00:00',
    updateTime: '2024-01-04 14:00:00',
  },
];
