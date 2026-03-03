export interface Tuition {
  id: number;
  stuId: number;
  studentName: string;
  campId: number;
  type: string;
  source: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'rejected' | 3 | 4; // 兼容多种状态格式
  description: string;
  salespersonId?: string;
  createTime: string;
  updateTime: string;
}

export const tuition: Tuition[] = [
    {
      "id": 1,
      "stuId": 1001,
      "studentName": "刘阳",
      "campId": 101,
      "type": "收入",
      "source": "学费(入住)",
      "amount": 5000,
      "date": "2026-01-05",
      "status": "paid",
      "description": "首期学费",
      "salespersonId": "emp002", // 李强
      "createTime": "2026-01-05T07:19:46.750Z", 
      "updateTime": "2026-01-05T07:19:46.750Z"
    },
    {
      "id": 2,
      "stuId": 1002,
      "studentName": "陈明",
      "campId": 101,
      "type": "收入",
      "source": "学费(入住)",
      "amount": 4000,
      "date": "2026-01-10",
      "status": "paid",
      "description": "首期学费",
      "salespersonId": "emp003", // 王丽
      "createTime": "2026-01-10T18:03:22.460Z", 
      "updateTime": "2026-01-10T18:03:22.460Z"
    },
    {
      "id": 3,
      "stuId": 1003,
      "studentName": "李婷",
      "campId": 101,
      "type": "收入",
      "source": "学费(续住)",
      "amount": 3000,
      "date": "2026-01-15",
      "status": "paid",
      "description": "续住费用",
      "salespersonId": "emp002", // 李强
      "createTime": "2026-01-15T09:00:00.000Z",
      "updateTime": "2026-01-15T09:00:00.000Z"
    },
    // 2025-12 历史数据
    {
      "id": 4,
      "stuId": 1004,
      "studentName": "张伟",
      "campId": 101,
      "type": "收入",
      "source": "学费(入住)",
      "amount": 45000,
      "date": "2025-12-05",
      "status": "paid",
      "description": "12月批量招商收入",
      "salespersonId": "emp002",
      "createTime": "2025-12-05T09:00:00.000Z",
      "updateTime": "2025-12-05T09:00:00.000Z"
    },
    {
      "id": 5,
      "stuId": 1005,
      "studentName": "赵敏",
      "campId": 101,
      "type": "收入",
      "source": "学费(续住)",
      "amount": 18000,
      "date": "2025-12-10",
      "status": "paid",
      "description": "12月续住",
      "salespersonId": "emp002",
      "createTime": "2025-12-10T09:00:00.000Z",
      "updateTime": "2025-12-10T09:00:00.000Z"
    },
    {
      "id": 6,
      "stuId": 1006,
      "studentName": "周泰",
      "campId": 101,
      "type": "收入",
      "source": "学费(入住)",
      "amount": 48000,
      "date": "2025-12-15",
      "status": "paid",
      "description": "12月个人招生",
      "salespersonId": "emp003",
      "createTime": "2025-12-15T09:00:00.000Z",
      "updateTime": "2025-12-15T09:00:00.000Z"
    },
    // 2025-11 历史数据
    {
      "id": 7,
      "stuId": 1007,
      "studentName": "孙尚香",
      "campId": 101,
      "type": "收入",
      "source": "学费(入住)",
      "amount": 55000,
      "date": "2025-11-05",
      "status": "paid",
      "description": "11月大单",
      "salespersonId": "emp002",
      "createTime": "2025-11-05T09:00:00.000Z",
      "updateTime": "2025-11-05T09:00:00.000Z"
    },
    {
      "id": 8,
      "stuId": 1008,
      "studentName": "陆逊",
      "campId": 101,
      "type": "收入",
      "source": "学费(续住)",
      "amount": 12000,
      "date": "2025-11-12",
      "status": "paid",
      "description": "11月续住",
      "salespersonId": "emp002",
      "createTime": "2025-11-12T09:00:00.000Z",
      "updateTime": "2025-11-12T09:00:00.000Z"
    },
    // 补全 2025-12 数据以达到“达成”状态
    {
      "id": 9,
      "stuId": 1009,
      "studentName": "关羽",
      "campId": 101,
      "type": "收入",
      "source": "学费(入住)",
      "amount": 20000,
      "date": "2025-12-20",
      "status": "paid",
      "description": "12月追加招生",
      "salespersonId": "emp002",
      "createTime": "2025-12-20T09:00:00.000Z",
      "updateTime": "2025-12-20T09:00:00.000Z"
    },
    {
      "id": 10,
      "stuId": 1010,
      "studentName": "张飞",
      "campId": 101,
      "type": "收入",
      "source": "学费(续住)",
      "amount": 15000,
      "date": "2025-12-25",
      "status": "paid",
      "description": "12月追加续住",
      "salespersonId": "emp003",
      "createTime": "2025-12-25T09:00:00.000Z",
      "updateTime": "2025-12-25T09:00:00.000Z"
    }
];
