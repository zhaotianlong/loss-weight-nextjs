export const mockData = {
  // 营地表
  "camp": [
    {
      "campId": 101,
      "campName": "昆明西山封闭减肥营",
      "address": "云南省昆明市西山区碧鸡路298号西山度假园内",
      "capacity": 50,
      "currentNum": 20,
      "contactPerson": "emp001",
      "contactPhone": "13888880001",
      "status": 1
    },
    {
      "campId": 102,
      "campName": "贵阳花溪减重营地",
      "address": "贵州省贵阳市花溪区花溪大道南段1256号",
      "capacity": 45,
      "currentNum": 20,
      "contactPerson": "emp010",
      "contactPhone": "13888880010",
      "status": 1
    },
    {
      "campId": 103,
      "campName": "成都都江堰减脂基地",
      "address": "四川省成都市都江堰市青城山路88号",
      "capacity": 40,
      "currentNum": 20,
      "contactPerson": "emp019",
      "contactPhone": "13888880019",
      "status": 1
    },
    {
      "campId": 104,  
      "campName": "杭州西湖健康营地",
      "address": "浙江省杭州市西湖区灵隐路45号",
      "capacity": 60,
      "currentNum": 20,
      "contactPerson": "emp028",
      "contactPhone": "13888880028",
      "status": 0
    },{
      "campId": 105,
      "campName": "厦门鼓浪屿养生营地",
      "address": "福建省厦门市思明区鼓浪屿龙头路99号",
      "capacity": 55,
      "currentNum": 20,
      "contactPerson": "emp037",
      "contactPhone": "13888880037",
      "status": 1
    },
    {
      "campId": 106,
      "campName": "青岛海滨减肥营地",
      "address": "山东省青岛市市南区香港中路200号",
      "capacity": 50, 
      "currentNum": 20,
      "contactPerson": "emp046",  
      "contactPhone": "13888880046",  
      "status": 0
    },
        {
      "campId": 107,
      "campName": "青岛海滨减肥营地",
      "address": "107山东省青岛市市南区香港中路200号",
      "capacity": 50, 
      "currentNum": 20,
      "contactPerson": "emp046",  
      "contactPhone": "13888880046",  
      "status": 0
    },
        {
      "campId": 108,
      "campName": "108青岛海滨减肥营地",
      "address": "山东省青岛市市南区香港中路200号",
      "capacity": 50, 
      "currentNum": 20,
      "contactPerson": "emp046",  
      "contactPhone": "13888880046",  
      "status": 0
    },
    {
      "campId": 109,
      "campName": "109青岛海滨减肥营地",
      "address": "山东省青岛市市南区香港中路200号",
      "capacity": 50,
      "currentNum": 20,
      "contactPerson": "emp046",
      "contactPhone": "13888880046",
      "status": 0
    },{
      "campId": 110,
      "campName": "110青岛海滨减肥营地",
      "address": "山东省青岛市市南区香港中路200号",
      "capacity": 50,
      "currentNum": 20,
      "contactPerson": "emp046",
      "contactPhone": "13888880046",
      "status": 0
    }
  ],
  // 房间类型表
  "campRoomType": [
    {
      "roomTypeId": 10101,
      "campId": 101,
      "roomName": "单人间",
      "bedCount": 1,
      "totalRooms": 5,
      "remainingRooms": 0,
      "roomStatus": 1
    },
    {
      "roomTypeId": 10102,
      "campId": 101,
      "roomName": "双人间",
      "bedCount": 2,
      "totalRooms": 10,
      "remainingRooms": 0,
      "roomStatus": 1
    },
    {
      "roomTypeId": 10103,
      "campId": 101,
      "roomName": "四人间",
      "bedCount": 4,
      "totalRooms": 5,
      "remainingRooms": 3,
      "roomStatus": 1
    },
    {
      "roomTypeId": 10201,
      "campId": 102,
      "roomName": "单人间",
      "bedCount": 1,
      "totalRooms": 4,
      "remainingRooms": 0,
      "roomStatus": 1
    },
    {
      "roomTypeId": 10202,
      "campId": 102,
      "roomName": "双人间",
      "bedCount": 2,
      "totalRooms": 12,
      "remainingRooms": 0,
      "roomStatus": 1
    },
    {
      "roomTypeId": 10203,
      "campId": 102,
      "roomName": "四人间",
      "bedCount": 4,
      "totalRooms": 4,
      "remainingRooms": 2,
      "roomStatus": 1
    },
    {
      "roomTypeId": 10301,
      "campId": 103,
      "roomName": "单人间",
      "bedCount": 1,
      "totalRooms": 6,
      "remainingRooms": 0,
      "roomStatus": 1
    },
    {
      "roomTypeId": 10302,
      "campId": 103,
      "roomName": "双人间",
      "bedCount": 2,
      "totalRooms": 8,
      "remainingRooms": 0,
      "roomStatus": 1
    },
    {
      "roomTypeId": 10303,
      "campId": 103,
      "roomName": "四人间",
      "bedCount": 4,
      "totalRooms": 6,
      "remainingRooms": 4,
      "roomStatus": 1
    }
  ],
  // 房间表
  "room": [

    { "roomId": 101001, "campId": 101, "typeId": 10101, "roomNum": "A1-101", "bedCount": 1, "status": 1 },
    { "roomId": 101002, "campId": 101, "typeId": 10101, "roomNum": "A1-102", "bedCount": 1, "status": 1 },
    { "roomId": 101003, "campId": 101, "typeId": 10101, "roomNum": "A1-103", "bedCount": 1, "status": 1 },
    { "roomId": 101004, "campId": 101, "typeId": 10101, "roomNum": "A1-104", "bedCount": 1, "status": 1 },
    { "roomId": 101005, "campId": 101, "typeId": 10101, "roomNum": "A1-105", "bedCount": 1, "status": 1 },
    { "roomId": 101006, "campId": 101, "typeId": 10102, "roomNum": "A1-106", "bedCount": 2, "status": 1 },
    { "roomId": 101007, "campId": 101, "typeId": 10102, "roomNum": "A1-107", "bedCount": 2, "status": 1 },
    { "roomId": 101008, "campId": 101, "typeId": 10102, "roomNum": "A1-108", "bedCount": 2, "status": 1 },
    { "roomId": 101009, "campId": 101, "typeId": 10102, "roomNum": "A1-109", "bedCount": 2, "status": 1 },
    { "roomId": 101010, "campId": 101, "typeId": 10102, "roomNum": "A1-110", "bedCount": 2, "status": 1 },
    { "roomId": 101011, "campId": 101, "typeId": 10102, "roomNum": "A1-111", "bedCount": 2, "status": 1 },
    { "roomId": 101012, "campId": 101, "typeId": 10102, "roomNum": "A1-112", "bedCount": 2, "status": 1 },
    { "roomId": 101013, "campId": 101, "typeId": 10102, "roomNum": "A1-113", "bedCount": 2, "status": 1 },
    { "roomId": 101014, "campId": 101, "typeId": 10102, "roomNum": "A1-114", "bedCount": 2, "status": 1 },
    { "roomId": 101015, "campId": 101, "typeId": 10102, "roomNum": "A1-115", "bedCount": 2, "status": 1 },
    { "roomId": 101016, "campId": 101, "typeId": 10103, "roomNum": "A1-116", "bedCount": 4, "status": 0 },
    { "roomId": 101017, "campId": 101, "typeId": 10103, "roomNum": "A1-117", "bedCount": 4, "status": 0 },
    { "roomId": 101018, "campId": 101, "typeId": 10103, "roomNum": "A1-118", "bedCount": 4, "status": 1 },
    { "roomId": 101019, "campId": 101, "typeId": 10103, "roomNum": "A1-119", "bedCount": 4, "status": 0 },
    { "roomId": 101020, "campId": 101, "typeId": 10103, "roomNum": "A1-120", "bedCount": 4, "status": 0 },
    { "roomId": 102001, "campId": 102, "typeId": 10201, "roomNum": "B1-101", "bedCount": 1, "status": 1 },
    { "roomId": 102002, "campId": 102, "typeId": 10201, "roomNum": "B1-102", "bedCount": 1, "status": 1 },
    { "roomId": 102003, "campId": 102, "typeId": 10201, "roomNum": "B1-103", "bedCount": 1, "status": 1 },
    { "roomId": 102004, "campId": 102, "typeId": 10201, "roomNum": "B1-104", "bedCount": 1, "status": 1 },
    { "roomId": 102005, "campId": 102, "typeId": 10202, "roomNum": "B1-105", "bedCount": 2, "status": 1 },
    { "roomId": 102006, "campId": 102, "typeId": 10202, "roomNum": "B1-106", "bedCount": 2, "status": 1 },
    { "roomId": 102007, "campId": 102, "typeId": 10202, "roomNum": "B1-107", "bedCount": 2, "status": 1 },
    { "roomId": 102008, "campId": 102, "typeId": 10202, "roomNum": "B1-108", "bedCount": 2, "status": 1 },
    { "roomId": 102009, "campId": 102, "typeId": 10202, "roomNum": "B1-109", "bedCount": 2, "status": 1 },
    { "roomId": 102010, "campId": 102, "typeId": 10202, "roomNum": "B1-110", "bedCount": 2, "status": 1 },
    { "roomId": 102011, "campId": 102, "typeId": 10202, "roomNum": "B1-111", "bedCount": 2, "status": 1 },
    { "roomId": 102012, "campId": 102, "typeId": 10202, "roomNum": "B1-112", "bedCount": 2, "status": 1 },
    { "roomId": 102013, "campId": 102, "typeId": 10202, "roomNum": "B1-113", "bedCount": 2, "status": 1 },
    { "roomId": 102014, "campId": 102, "typeId": 10202, "roomNum": "B1-114", "bedCount": 2, "status": 1 },
    { "roomId": 102015, "campId": 102, "typeId": 10202, "roomNum": "B1-115", "bedCount": 2, "status": 1 },
    { "roomId": 102016, "campId": 102, "typeId": 10202, "roomNum": "B1-116", "bedCount": 2, "status": 1 },
    { "roomId": 102017, "campId": 102, "typeId": 10203, "roomNum": "B1-117", "bedCount": 4, "status": 0 },
    { "roomId": 102018, "campId": 102, "typeId": 10203, "roomNum": "B1-118", "bedCount": 4, "status": 1 },
    { "roomId": 102019, "campId": 102, "typeId": 10203, "roomNum": "B1-119", "bedCount": 4, "status": 0 },
    { "roomId": 102020, "campId": 102, "typeId": 10203, "roomNum": "B1-120", "bedCount": 4, "status": 0 },
    { "roomId": 103001, "campId": 103, "typeId": 10301, "roomNum": "C1-101", "bedCount": 1, "status": 1 },
    { "roomId": 103002, "campId": 103, "typeId": 10301, "roomNum": "C1-102", "bedCount": 1, "status": 1 },
    { "roomId": 103003, "campId": 103, "typeId": 10301, "roomNum": "C1-103", "bedCount": 1, "status": 1 },
    { "roomId": 103004, "campId": 103, "typeId": 10301, "roomNum": "C1-104", "bedCount": 1, "status": 1 },
    { "roomId": 103005, "campId": 103, "typeId": 10301, "roomNum": "C1-105", "bedCount": 1, "status": 1 },
    { "roomId": 103006, "campId": 103, "typeId": 10301, "roomNum": "C1-106", "bedCount": 1, "status": 1 },
    { "roomId": 103007, "campId": 103, "typeId": 10302, "roomNum": "C1-107", "bedCount": 2, "status": 1 },
    { "roomId": 103008, "campId": 103, "typeId": 10302, "roomNum": "C1-108", "bedCount": 2, "status": 1 },
    { "roomId": 103009, "campId": 103, "typeId": 10302, "roomNum": "C1-109", "bedCount": 2, "status": 1 },
    { "roomId": 103010, "campId": 103, "typeId": 10302, "roomNum": "C1-110", "bedCount": 2, "status": 1 },
    { "roomId": 103011, "campId": 103, "typeId": 10302, "roomNum": "C1-111", "bedCount": 2, "status": 1 },
    { "roomId": 103012, "campId": 103, "typeId": 10302, "roomNum": "C1-112", "bedCount": 2, "status": 1 },
    { "roomId": 103013, "campId": 103, "typeId": 10302, "roomNum": "C1-113", "bedCount": 2, "status": 1 },
    { "roomId": 103014, "campId": 103, "typeId": 10302, "roomNum": "C1-114", "bedCount": 2, "status": 1 },
    { "roomId": 103015, "campId": 103, "typeId": 10303, "roomNum": "C1-115", "bedCount": 4, "status": 0 },
    { "roomId": 103016, "campId": 103, "typeId": 10303, "roomNum": "C1-116", "bedCount": 4, "status": 0 },
    { "roomId": 103017, "campId": 103, "typeId": 10303, "roomNum": "C1-117", "bedCount": 4, "status": 1 },
    { "roomId": 103018, "campId": 103, "typeId": 10303, "roomNum": "C1-118", "bedCount": 4, "status": 0 },
    { "roomId": 103019, "campId": 103, "typeId": 10303, "roomNum": "C1-119", "bedCount": 4, "status": 0 },
    { "roomId": 103020, "campId": 103, "typeId": 10303, "roomNum": "C1-120", "bedCount": 4, "status": 0 }
  ],
  // 床位表
  "bed": [
    { "bedId": 101001, "roomId": 101001, "roomTypeId": 10101, "bedNum": "A1-101-1", "stuId": 1001, "checkinTime": "2025-10-01 09:00", "checkoutTime": null, "status": 1 },
    { "bedId": 101002, "roomId": 101002, "roomTypeId": 10101, "bedNum": "A1-102-1", "stuId": 1002, "checkinTime": "2025-10-01 09:10", "checkoutTime": null, "status": 1 },
    { "bedId": 101003, "roomId": 101003, "roomTypeId": 10101, "bedNum": "A1-103-1", "stuId": 1003, "checkinTime": "2025-10-01 09:20", "checkoutTime": null, "status": 1 },
    { "bedId": 101004, "roomId": 101004, "roomTypeId": 10101, "bedNum": "A1-104-1", "stuId": 1004, "checkinTime": "2025-10-01 09:30", "checkoutTime": null, "status": 1 },
    { "bedId": 101005, "roomId": 101005, "roomTypeId": 10101, "bedNum": "A1-105-1", "stuId": 1005, "checkinTime": "2025-10-01 09:40", "checkoutTime": null, "status": 1 },
    { "bedId": 101006, "roomId": 101006, "roomTypeId": 10102, "bedNum": "A1-106-1", "stuId": 1006, "checkinTime": "2025-10-01 09:50", "checkoutTime": null, "status": 1 },
    { "bedId": 101007, "roomId": 101006, "roomTypeId": 10102, "bedNum": "A1-106-2", "stuId": 1007, "checkinTime": "2025-10-01 10:00", "checkoutTime": null, "status": 1 },
    { "bedId": 101008, "roomId": 101007, "roomTypeId": 10102, "bedNum": "A1-107-1", "stuId": 1008, "checkinTime": "2025-10-01 10:10", "checkoutTime": null, "status": 1 },
    { "bedId": 101009, "roomId": 101007, "roomTypeId": 10102, "bedNum": "A1-107-2", "stuId": 1009, "checkinTime": "2025-10-01 10:20", "checkoutTime": null, "status": 1 },
    { "bedId": 101010, "roomId": 101008, "roomTypeId": 10102, "bedNum": "A1-108-1", "stuId": 1010, "checkinTime": "2025-10-01 10:30", "checkoutTime": null, "status": 1 },
    { "bedId": 101011, "roomId": 101008, "roomTypeId": 10102, "bedNum": "A1-108-2", "stuId": 1011, "checkinTime": "2025-10-02 08:00", "checkoutTime": null, "status": 1 },
    { "bedId": 101012, "roomId": 101009, "roomTypeId": 10102, "bedNum": "A1-109-1", "stuId": 1012, "checkinTime": "2025-10-02 08:10", "checkoutTime": null, "status": 1 },
    { "bedId": 101013, "roomId": 101009, "roomTypeId": 10102, "bedNum": "A1-109-2", "stuId": 1013, "checkinTime": "2025-10-02 08:20", "checkoutTime": null, "status": 1 },
    { "bedId": 101014, "roomId": 101010, "roomTypeId": 10102, "bedNum": "A1-110-1", "stuId": 1014, "checkinTime": "2025-10-02 08:30", "checkoutTime": null, "status": 1 },
    { "bedId": 101015, "roomId": 101010, "roomTypeId": 10102, "bedNum": "A1-110-2", "stuId": 1015, "checkinTime": "2025-10-02 08:40", "checkoutTime": null, "status": 1 },
    { "bedId": 101016, "roomId": 101011, "roomTypeId": 10102, "bedNum": "A1-111-1", "stuId": 1016, "checkinTime": "2025-10-02 08:50", "checkoutTime": null, "status": 1 },
    { "bedId": 101017, "roomId": 101011, "roomTypeId": 10102, "bedNum": "A1-111-2", "stuId": 1017, "checkinTime": "2025-10-02 09:00", "checkoutTime": null, "status": 1 },
    { "bedId": 101018, "roomId": 101012, "roomTypeId": 10102, "bedNum": "A1-112-1", "stuId": 1018, "checkinTime": "2025-10-02 09:10", "checkoutTime": null, "status": 1 },
    { "bedId": 101019, "roomId": 101012, "roomTypeId": 10102, "bedNum": "A1-112-2", "stuId": 1019, "checkinTime": "2025-10-02 09:20", "checkoutTime": null, "status": 1 },
    { "bedId": 101020, "roomId": 101013, "roomTypeId": 10102, "bedNum": "A1-113-1", "stuId": 1020, "checkinTime": "2025-10-02 09:30", "checkoutTime": null, "status": 1 },
    { "bedId": 102001, "roomId": 102001, "roomTypeId": 10201, "bedNum": "B1-101-1", "stuId": 2001, "checkinTime": "2025-10-01 10:00", "checkoutTime": null, "status": 1 },
    { "bedId": 102002, "roomId": 102002, "roomTypeId": 10201, "bedNum": "B1-102-1", "stuId": 2002, "checkinTime": "2025-10-01 10:10", "checkoutTime": null, "status": 1 },
    { "bedId": 102003, "roomId": 102003, "roomTypeId": 10201, "bedNum": "B1-103-1", "stuId": 2003, "checkinTime": "2025-10-01 10:20", "checkoutTime": null, "status": 1 },
    { "bedId": 102004, "roomId": 102004, "roomTypeId": 10201, "bedNum": "B1-104-1", "stuId": 2004, "checkinTime": "2025-10-01 10:30", "checkoutTime": null, "status": 1 },
    { "bedId": 102005, "roomId": 102005, "roomTypeId": 10202, "bedNum": "B1-105-1", "stuId": 2005, "checkinTime": "2025-10-01 10:40", "checkoutTime": null, "status": 1 },
    { "bedId": 102006, "roomId": 102005, "roomTypeId": 10202, "bedNum": "B1-105-2", "stuId": 2006, "checkinTime": "2025-10-01 10:50", "checkoutTime": null, "status": 1 },
    { "bedId": 102007, "roomId": 102006, "roomTypeId": 10202, "bedNum": "B1-106-1", "stuId": 2007, "checkinTime": "2025-10-01 11:00", "checkoutTime": null, "status": 1 },
    { "bedId": 102008, "roomId": 102006, "roomTypeId": 10202, "bedNum": "B1-106-2", "stuId": 2008, "checkinTime": "2025-10-01 11:10", "checkoutTime": null, "status": 1 },
    { "bedId": 102009, "roomId": 102007, "roomTypeId": 10202, "bedNum": "B1-107-1", "stuId": 2009, "checkinTime": "2025-10-01 11:20", "checkoutTime": null, "status": 1 },
    { "bedId": 102010, "roomId": 102007, "roomTypeId": 10202, "bedNum": "B1-107-2", "stuId": 2010, "checkinTime": "2025-10-01 11:30", "checkoutTime": null, "status": 1 },
    { "bedId": 102011, "roomId": 102008, "roomTypeId": 10202, "bedNum": "B1-108-1", "stuId": 2011, "checkinTime": "2025-10-01 11:40", "checkoutTime": null, "status": 1 },
    { "bedId": 102012, "roomId": 102008, "roomTypeId": 10202, "bedNum": "B1-108-2", "stuId": 2012, "checkinTime": "2025-10-01 11:50", "checkoutTime": null, "status": 1 },
    { "bedId": 102013, "roomId": 102009, "roomTypeId": 10202, "bedNum": "B1-109-1", "stuId": 2013, "checkinTime": "2025-10-01 12:00", "checkoutTime": null, "status": 1 },
    { "bedId": 102014, "roomId": 102009, "roomTypeId": 10202, "bedNum": "B1-109-2", "stuId": 2014, "checkinTime": "2025-10-01 12:10", "checkoutTime": null, "status": 1 },
    { "bedId": 102015, "roomId": 102010, "roomTypeId": 10202, "bedNum": "B1-110-1", "stuId": 2015, "checkinTime": "2025-10-01 12:20", "checkoutTime": null, "status": 1 },
    { "bedId": 102016, "roomId": 102010, "roomTypeId": 10202, "bedNum": "B1-110-2", "stuId": 2016, "checkinTime": "2025-10-01 12:30", "checkoutTime": null, "status": 1 },
    { "bedId": 102017, "roomId": 102011, "roomTypeId": 10202, "bedNum": "B1-111-1", "stuId": 2017, "checkinTime": "2025-10-01 12:40", "checkoutTime": null, "status": 1 },
    { "bedId": 102018, "roomId": 102011, "roomTypeId": 10202, "bedNum": "B1-111-2", "stuId": 2018, "checkinTime": "2025-10-01 12:50", "checkoutTime": null, "status": 1 },
    { "bedId": 102019, "roomId": 102012, "roomTypeId": 10202, "bedNum": "B1-112-1", "stuId": 2019, "checkinTime": "2025-10-01 13:00", "checkoutTime": null, "status": 1 },
    { "bedId": 102020, "roomId": 102012, "roomTypeId": 10202, "bedNum": "B1-112-2", "stuId": 2020, "checkinTime": "2025-10-01 13:10", "checkoutTime": null, "status": 1 },
    { "bedId": 103001, "roomId": 103001, "roomTypeId": 10301, "bedNum": "C1-101-1", "stuId": 3001, "checkinTime": "2025-10-01 14:00", "checkoutTime": null, "status": 1 },
    { "bedId": 103002, "roomId": 103002, "roomTypeId": 10301, "bedNum": "C1-102-1", "stuId": 3002, "checkinTime": "2025-10-01 14:10", "checkoutTime": null, "status": 1 },
    { "bedId": 103003, "roomId": 103003, "roomTypeId": 10301, "bedNum": "C1-103-1", "stuId": 3003, "checkinTime": "2025-10-01 14:20", "checkoutTime": null, "status": 1 },
    { "bedId": 103004, "roomId": 103004, "roomTypeId": 10301, "bedNum": "C1-104-1", "stuId": 3004, "checkinTime": "2025-10-01 14:30", "checkoutTime": null, "status": 1 },
    { "bedId": 103005, "roomId": 103005, "roomTypeId": 10301, "bedNum": "C1-105-1", "stuId": 3005, "checkinTime": "2025-10-01 14:40", "checkoutTime": null, "status": 1 },
    { "bedId": 103006, "roomId": 103006, "roomTypeId": 10301, "bedNum": "C1-106-1", "stuId": 3006, "checkinTime": "2025-10-01 14:50", "checkoutTime": null, "status": 1 },
    { "bedId": 103007, "roomId": 103007, "roomTypeId": 10302, "bedNum": "C1-107-1", "stuId": 3007, "checkinTime": "2025-10-01 15:00", "checkoutTime": null, "status": 1 },
    { "bedId": 103008, "roomId": 103007, "roomTypeId": 10302, "bedNum": "C1-107-2", "stuId": 3008, "checkinTime": "2025-10-01 15:10", "checkoutTime": null, "status": 1 },
    { "bedId": 103009, "roomId": 103008, "roomTypeId": 10302, "bedNum": "C1-108-1", "stuId": 3009, "checkinTime": "2025-10-01 15:20", "checkoutTime": null, "status": 1 },
    { "bedId": 103010, "roomId": 103008, "roomTypeId": 10302, "bedNum": "C1-108-2", "stuId": 3010, "checkinTime": "2025-10-01 15:30", "checkoutTime": null, "status": 1 },
    { "bedId": 103011, "roomId": 103009, "roomTypeId": 10302, "bedNum": "C1-109-1", "stuId": 3011, "checkinTime": "2025-10-01 15:40", "checkoutTime": null, "status": 1 },
    { "bedId": 103012, "roomId": 103009, "roomTypeId": 10302, "bedNum": "C1-109-2", "stuId": 3012, "checkinTime": "2025-10-01 15:50", "checkoutTime": null, "status": 1 },
    { "bedId": 103013, "roomId": 103010, "roomTypeId": 10302, "bedNum": "C1-110-1", "stuId": 3013, "checkinTime": "2025-10-01 16:00", "checkoutTime": null, "status": 1 },
    { "bedId": 103014, "roomId": 103010, "roomTypeId": 10302, "bedNum": "C1-110-2", "stuId": 3014, "checkinTime": "2025-10-01 16:10", "checkoutTime": null, "status": 1 },
    { "bedId": 103015, "roomId": 103011, "roomTypeId": 10302, "bedNum": "C1-111-1", "stuId": 3015, "checkinTime": "2025-10-01 16:20", "checkoutTime": null, "status": 1 },
    { "bedId": 103016, "roomId": 103011, "roomTypeId": 10302, "bedNum": "C1-111-2", "stuId": 3016, "checkinTime": "2025-10-01 16:30", "checkoutTime": null, "status": 1 },
    { "bedId": 103017, "roomId": 103012, "roomTypeId": 10302, "bedNum": "C1-112-1", "stuId": 3017, "checkinTime": "2025-10-01 16:40", "checkoutTime": null, "status": 1 },
    { "bedId": 103018, "roomId": 103012, "roomTypeId": 10302, "bedNum": "C1-112-2", "stuId": 3018, "checkinTime": "2025-10-01 16:50", "checkoutTime": null, "status": 1 },
    { "bedId": 103019, "roomId": 103013, "roomTypeId": 10302, "bedNum": "C1-113-1", "stuId": 3019, "checkinTime": "2025-10-01 17:00", "checkoutTime": null, "status": 1 },
    { "bedId": 103020, "roomId": 103013, "roomTypeId": 10302, "bedNum": "C1-113-2", "stuId": 3020, "checkinTime": "2025-10-01 17:10", "checkoutTime": null, "status": 1 }
  ],
  // 员工数据
  "employee": [
    // 101营地（1管理者+4教练+2后勤）
    { "empId": "emp001", "name": "张敏", "phone": "13888880001", "position": "管理者", "campId": 101, "qualification": "企业管理资格证", "dutyArea": "昆明西山营管理", "hireDate": "2023-01-15", "status": 1 },
    { "empId": "emp002", "name": "李强", "phone": "13888880002", "position": "教练", "campId": 101, "qualification": "ACE国际健身教练认证", "dutyArea": "团体课+私教", "hireDate": "2023-03-20", "status": 1 },
    { "empId": "emp003", "name": "王丽", "phone": "13888880003", "position": "教练", "campId": 101, "qualification": "国家职业健身教练证", "dutyArea": "私教", "hireDate": "2023-04-10", "status": 1 },
    { "empId": "emp004", "name": "赵刚", "phone": "13888880004", "position": "教练", "campId": 101, "qualification": "普拉提教练认证", "dutyArea": "团体课", "hireDate": "2023-05-05", "status": 1 },
    { "empId": "emp005", "name": "陈明", "phone": "13888880005", "position": "教练", "campId": 101, "qualification": "康复训练师认证", "dutyArea": "私教", "hireDate": "2023-06-15", "status": 1 },
    { "empId": "emp006", "name": "刘芳", "phone": "13888880006", "position": "餐饮后勤", "campId": 101, "qualification": "中式厨师证", "dutyArea": "早餐+午餐", "hireDate": "2023-02-10", "status": 1 },
    { "empId": "emp007", "name": "周杰", "phone": "13888880007", "position": "清洁后勤", "campId": 101, "qualification": "保洁资格证", "dutyArea": "A1栋清洁", "hireDate": "2023-03-01", "status": 1 },
    // 102营地（1管理者+4教练+2后勤）
    { "empId": "emp010", "name": "陈杰", "phone": "13888880010", "position": "管理者", "campId": 102, "qualification": "体育场馆运营证书", "dutyArea": "贵阳花溪营管理", "hireDate": "2022-11-30", "status": 1 },
    { "empId": "emp011", "name": "林丽", "phone": "13888880011", "position": "教练", "campId": 102, "qualification": "ACE认证", "dutyArea": "团体课", "hireDate": "2023-01-20", "status": 1 },
    { "empId": "emp012", "name": "黄涛", "phone": "13888880012", "position": "教练", "campId": 102, "qualification": "国家健身教练证", "dutyArea": "私教", "hireDate": "2023-02-25", "status": 1 },
    { "empId": "emp013", "name": "孙颖", "phone": "13888880013", "position": "教练", "campId": 102, "qualification": "瑜伽教练认证", "dutyArea": "团体课+私教", "hireDate": "2023-03-30", "status": 1 },
    { "empId": "emp014", "name": "吴昊", "phone": "13888880014", "position": "教练", "campId": 102, "qualification": "力量训练认证", "dutyArea": "私教", "hireDate": "2023-04-20", "status": 1 },
    { "empId": "emp015", "name": "郑婷", "phone": "13888880015", "position": "餐饮后勤", "campId": 102, "qualification": "西式厨师证", "dutyArea": "午餐+晚餐", "hireDate": "2023-02-15", "status": 1 },
    { "empId": "emp016", "name": "马强", "phone": "13888880016", "position": "清洁后勤", "campId": 102, "qualification": "保洁资格证", "dutyArea": "B1栋清洁", "hireDate": "2023-03-05", "status": 1 },
    // 103营地（1管理者+4教练+2后勤）
    { "empId": "emp019", "name": "郑华", "phone": "13888880019", "position": "管理者", "campId": 103, "qualification": "企业管理资格证", "dutyArea": "都江堰营管理", "hireDate": "2023-01-10", "status": 1 },
    { "empId": "emp020", "name": "马丽", "phone": "13888880020", "position": "教练", "campId": 103, "qualification": "ACE认证", "dutyArea": "团体课", "hireDate": "2023-02-15", "status": 1 },
    { "empId": "emp021", "name": "朱强", "phone": "13888880021", "position": "教练", "campId": 103, "qualification": "国家健身教练证", "dutyArea": "私教", "hireDate": "2023-03-20", "status": 1 },
    { "empId": "emp022", "name": "何敏", "phone": "13888880022", "position": "教练", "campId": 103, "qualification": "普拉提认证", "dutyArea": "私教+团体课", "hireDate": "2023-04-15", "status": 1 },
    { "empId": "emp023", "name": "郭涛", "phone": "13888880023", "position": "教练", "campId": 103, "qualification": "康复认证", "dutyArea": "私教", "hireDate": "2023-05-10", "status": 1 },
    { "empId": "emp024", "name": "林敏", "phone": "13888880024", "position": "餐饮后勤", "campId": 103, "qualification": "中式厨师证", "dutyArea": "早餐+晚餐", "hireDate": "2023-02-20", "status": 1 },
    { "empId": "emp025", "name": "周凯", "phone": "13888880025", "position": "清洁后勤", "campId": 103, "qualification": "保洁资格证", "dutyArea": "C1栋清洁", "hireDate": "2023-03-10", "status": 1 }
  ],
  //  营地学员数据
  "student": [
    // 101营地20学员（1001-1020）
    { "stuId": 1001, "name": "刘阳", "idCard": "530102199001010011", "phone": "13588880001", "campId": 101, "bedId": 101001, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "海鲜过敏", "paymentStatus": 1, "status": 1 },
    { "stuId": 1002, "name": "陈明", "idCard": "530102198802020022", "phone": "13588880002", "campId": 101, "bedId": 101002, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "无", "paymentStatus": 1, "status": 1 },
    { "stuId": 1003, "name": "李娜", "idCard": "530102199203030033", "phone": "13588880003", "campId": 101, "bedId": 101003, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "乳糖不耐受", "paymentStatus": 1, "status": 1 },
    { "stuId": 1004, "name": "王浩", "idCard": "530102198504040044", "phone": "13588880004", "campId": 101, "bedId": 101004, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "辛辣食物", "paymentStatus": 1, "status": 1 },
    { "stuId": 1005, "name": "赵琳", "idCard": "530102199305050055", "phone": "13588880005", "campId": 101, "bedId": 101005, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "无", "paymentStatus": 1, "status": 1 },
    { "stuId": 1006, "name": "孙超", "idCard": "530102198906060066", "phone": "13588880006", "campId": 101, "bedId": 101006, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "海鲜过敏", "paymentStatus": 1, "status": 1 },
    { "stuId": 1007, "name": "周婷", "idCard": "530102199107070077", "phone": "13588880007", "campId": 101, "bedId": 101007, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "无", "paymentStatus": 1, "status": 1 },
    { "stuId": 1008, "name": "吴凯", "idCard": "530102198708080088", "phone": "13588880008", "campId": 101, "bedId": 101008, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "乳糖不耐受", "paymentStatus": 1, "status": 1 },
    { "stuId": 1009, "name": "郑敏", "idCard": "530102199409090099", "phone": "13588880009", "campId": 101, "bedId": 101009, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "辛辣食物", "paymentStatus": 1, "status": 1 },
    { "stuId": 1010, "name": "马强", "idCard": "530102198610100100", "phone": "13588880010", "campId": 101, "bedId": 101010, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "无", "paymentStatus": 1, "status": 1 },
    { "stuId": 1011, "name": "朱婷", "idCard": "530102199511110111", "phone": "13588880011", "campId": 101, "bedId": 101011, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "海鲜过敏", "paymentStatus": 1, "status": 1 },
    { "stuId": 1012, "name": "何杰", "idCard": "530102198412120122", "phone": "13588880012", "campId": 101, "bedId": 101012, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "无", "paymentStatus": 1, "status": 1 },
    { "stuId": 1013, "name": "高敏", "idCard": "530102199001130133", "phone": "13588880013", "campId": 101, "bedId": 101013, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "乳糖不耐受", "paymentStatus": 1, "status": 1 },
    { "stuId": 1014, "name": "郭超", "idCard": "530102198802140144", "phone": "13588880014", "campId": 101, "bedId": 101014, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "辛辣食物", "paymentStatus": 1, "status": 1 },
    { "stuId": 1015, "name": "林娜", "idCard": "530102199303150155", "phone": "13588880015", "campId": 101, "bedId": 101015, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "无", "paymentStatus": 1, "status": 1 },
    { "stuId": 1016, "name": "黄凯", "idCard": "530102198704160166", "phone": "13588880016", "campId": 101, "bedId": 101016, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "海鲜过敏", "paymentStatus": 1, "status": 1 },
    { "stuId": 1017, "name": "赵婷", "idCard": "530102199105170177", "phone": "13588880017", "campId": 101, "bedId": 101017, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "无", "paymentStatus": 1, "status": 1 },
    { "stuId": 1018, "name": "孙杰", "idCard": "530102198906180188", "phone": "13588880018", "campId": 101, "bedId": 101018, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "乳糖不耐受", "paymentStatus": 1, "status": 1 },
    { "stuId": 1019, "name": "周敏", "idCard": "530102199407190199", "phone": "13588880019", "campId": 101, "bedId": 101019, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "辛辣食物", "paymentStatus": 1, "status": 1 },
    { "stuId": 1020, "name": "吴婷", "idCard": "530102198508200200", "phone": "13588880020", "campId": 101, "bedId": 101020, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "无", "paymentStatus": 1, "status": 1 },
    // 102营地20学员（2001-2020）补充
    { "stuId": 2001, "name": "张阳", "idCard": "520102199001010011", "phone": "13588880021", "campId": 102, "bedId": 102001, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "无", "paymentStatus": 1, "status": 1 },
    { "stuId": 2002, "name": "李婷", "idCard": "520102198902020022", "phone": "13588880022", "campId": 102, "bedId": 102002, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "海鲜过敏", "paymentStatus": 1, "status": 1 },
    { "stuId": 2003, "name": "王强", "idCard": "520102198703030033", "phone": "13588880023", "campId": 102, "bedId": 102003, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "乳糖不耐受", "paymentStatus": 1, "status": 1 },
    { "stuId": 2004, "name": "赵娜", "idCard": "520102199104040044", "phone": "13588880024", "campId": 102, "bedId": 102004, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "辛辣食物", "paymentStatus": 1, "status": 1 },
    { "stuId": 2005, "name": "孙凯", "idCard": "520102198805050055", "phone": "13588880025", "campId": 102, "bedId": 102005, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "无", "paymentStatus": 1, "status": 1 },
    { "stuId": 2006, "name": "周敏", "idCard": "520102199206060066", "phone": "13588880026", "campId": 102, "bedId": 102006, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "海鲜过敏", "paymentStatus": 1, "status": 1 },
    { "stuId": 2007, "name": "吴婷", "idCard": "520102199007070077", "phone": "13588880027", "campId": 102, "bedId": 102007, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "乳糖不耐受", "paymentStatus": 1, "status": 1 },
    { "stuId": 2008, "name": "郑超", "idCard": "520102198608080088", "phone": "13588880028", "campId": 102, "bedId": 102008, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "辛辣食物", "paymentStatus": 1, "status": 1 },
    { "stuId": 2009, "name": "马丽", "idCard": "520102199309090099", "phone": "13588880029", "campId": 102, "bedId": 102009, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "无", "paymentStatus": 1, "status": 1 },
    { "stuId": 2010, "name": "朱杰", "idCard": "520102198510100100", "phone": "13588880030", "campId": 102, "bedId": 102010, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "海鲜过敏", "paymentStatus": 1, "status": 1 },
    { "stuId": 2011, "name": "何娜", "idCard": "520102199411110111", "phone": "13588880031", "campId": 102, "bedId": 102011, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "乳糖不耐受", "paymentStatus": 1, "status": 1 },
    { "stuId": 2012, "name": "高凯", "idCard": "520102198912120122", "phone": "13588880032", "campId": 102, "bedId": 102012, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "辛辣食物", "paymentStatus": 1, "status": 1 },
    { "stuId": 2013, "name": "林敏", "idCard": "520102199101130133", "phone": "13588880033", "campId": 102, "bedId": 102013, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "无", "paymentStatus": 1, "status": 1 },
    { "stuId": 2014, "name": "黄婷", "idCard": "520102198702140144", "phone": "13588880034", "campId": 102, "bedId": 102014, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "海鲜过敏", "paymentStatus": 1, "status": 1 },
    { "stuId": 2015, "name": "周凯", "idCard": "520102199003150155", "phone": "13588880035", "campId": 102, "bedId": 102015, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "乳糖不耐受", "paymentStatus": 1, "status": 1 },
    { "stuId": 2016, "name": "吴杰", "idCard": "520102198804160166", "phone": "13588880036", "campId": 102, "bedId": 102016, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "辛辣食物", "paymentStatus": 1, "status": 1 },
    { "stuId": 2017, "name": "郑丽", "idCard": "520102199205170177", "phone": "13588880037", "campId": 102, "bedId": 102017, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "无", "paymentStatus": 1, "status": 1 },
    { "stuId": 2018, "name": "马凯", "idCard": "520102198606180188", "phone": "13588880038", "campId": 102, "bedId": 102018, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "海鲜过敏", "paymentStatus": 1, "status": 1 },
    { "stuId": 2019, "name": "朱敏", "idCard": "520102199307190199", "phone": "13588880039", "campId": 102, "bedId": 102019, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "乳糖不耐受", "paymentStatus": 1, "status": 1 },
    { "stuId": 2020, "name": "何凯", "idCard": "520102198508200200", "phone": "13588880040", "campId": 102, "bedId": 102020, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "辛辣食物", "paymentStatus": 1, "status": 1 },

    // 103营地20学员（3001-3020）
    { "stuId": 3001, "name": "刘杰", "idCard": "510102199001010011", "phone": "13588880041", "campId": 103, "bedId": 103001, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "无", "paymentStatus": 1, "status": 1 },
    { "stuId": 3002, "name": "陈明", "idCard": "510102198902020022", "phone": "13588880042", "campId": 103, "bedId": 103002, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "海鲜过敏", "paymentStatus": 1, "status": 1 },
    { "stuId": 3003, "name": "李阳", "idCard": "510102198703030033", "phone": "13588880043", "campId": 103, "bedId": 103003, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "乳糖不耐受", "paymentStatus": 1, "status": 1 },
    { "stuId": 3004, "name": "王婷", "idCard": "510102199104040044", "phone": "13588880044", "campId": 103, "bedId": 103004, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "辛辣食物", "paymentStatus": 1, "status": 1 },
    { "stuId": 3005, "name": "赵凯", "idCard": "510102198805050055", "phone": "13588880045", "campId": 103, "bedId": 103005, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "无", "paymentStatus": 1, "status": 1 },
    { "stuId": 3006, "name": "孙敏", "idCard": "510102199206060066", "phone": "13588880046", "campId": 103, "bedId": 103006, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "海鲜过敏", "paymentStatus": 1, "status": 1 },
    { "stuId": 3007, "name": "周凯", "idCard": "510102199007070077", "phone": "13588880047", "campId": 103, "bedId": 103007, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "乳糖不耐受", "paymentStatus": 1, "status": 1 },
    { "stuId": 3008, "name": "吴丽", "idCard": "510102198608080088", "phone": "13588880048", "campId": 103, "bedId": 103008, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "辛辣食物", "paymentStatus": 1, "status": 1 },
    { "stuId": 3009, "name": "郑杰", "idCard": "510102199309090099", "phone": "13588880049", "campId": 103, "bedId": 103009, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "无", "paymentStatus": 1, "status": 1 },
    { "stuId": 3010, "name": "马凯", "idCard": "510102198510100100", "phone": "13588880050", "campId": 103, "bedId": 103010, "checkinDate": "2025-10-01", "checkoutDate": null, "dietTaboo": "海鲜过敏", "paymentStatus": 1, "status": 1 },
    { "stuId": 3011, "name": "朱婷", "idCard": "510102199411110111", "phone": "13588880051", "campId": 103, "bedId": 103011, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "乳糖不耐受", "paymentStatus": 1, "status": 1 },
    { "stuId": 3012, "name": "何凯", "idCard": "510102198912120122", "phone": "13588880052", "campId": 103, "bedId": 103012, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "辛辣食物", "paymentStatus": 1, "status": 1 },
    { "stuId": 3013, "name": "高敏", "idCard": "510102199101130133", "phone": "13588880053", "campId": 103, "bedId": 103013, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "无", "paymentStatus": 1, "status": 1 },
    { "stuId": 3014, "name": "林婷", "idCard": "510102198702140144", "phone": "13588880054", "campId": 103, "bedId": 103014, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "海鲜过敏", "paymentStatus": 1, "status": 1 },
    { "stuId": 3015, "name": "黄杰", "idCard": "510102199003150155", "phone": "13588880055", "campId": 103, "bedId": 103015, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "乳糖不耐受", "paymentStatus": 1, "status": 1 },
    { "stuId": 3016, "name": "周婷", "idCard": "510102198804160166", "phone": "13588880056", "campId": 103, "bedId": 103016, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "辛辣食物", "paymentStatus": 1, "status": 1 },
    { "stuId": 3017, "name": "吴凯", "idCard": "510102199205170177", "phone": "13588880057", "campId": 103, "bedId": 103017, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "无", "paymentStatus": 1, "status": 1 },
    { "stuId": 3018, "name": "郑丽", "idCard": "510102198606180188", "phone": "13588880058", "campId": 103, "bedId": 103018, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "海鲜过敏", "paymentStatus": 1, "status": 1 },
    { "stuId": 3019, "name": "马敏", "idCard": "510102199307190199", "phone": "13588880059", "campId": 103, "bedId": 103019, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "乳糖不耐受", "paymentStatus": 1, "status": 1 },
    { "stuId": 3020, "name": "朱凯", "idCard": "510102198508200200", "phone": "13588880060", "campId": 103, "bedId": 103020, "checkinDate": "2025-10-02", "checkoutDate": null, "dietTaboo": "辛辣食物", "paymentStatus": 1, "status": 1 }
  ],

  // 新增：营地收费标准表（camp_fee_standard）- 每营3房型×2收费类型
  "campFeeStandard": [
    // 101营地（单人间10101/双人间10102/四人间10103）
    { "feeId": 101001, "campId": 101, "roomTypeId": 10101, "feeType": 1, "basePrice": 200.00, "premiumRate": 1.0, "includeServices": "含3餐+团体课+基础体测", "validStart": "2025-10-01 00:00:00", "validEnd": null },
    { "feeId": 101002, "campId": 101, "roomTypeId": 10101, "feeType": 3, "basePrice": 5500.00, "premiumRate": 1.0, "includeServices": "含3餐+团体课+1次私教体验", "validStart": "2025-10-01 00:00:00", "validEnd": null },
    { "feeId": 101003, "campId": 101, "roomTypeId": 10102, "feeType": 1, "basePrice": 150.00, "premiumRate": 1.0, "includeServices": "含3餐+团体课+基础体测", "validStart": "2025-10-01 00:00:00", "validEnd": null },
    { "feeId": 101004, "campId": 101, "roomTypeId": 10102, "feeType": 3, "basePrice": 4000.00, "premiumRate": 1.0, "includeServices": "含3餐+团体课+1次私教体验", "validStart": "2025-10-01 00:00:00", "validEnd": null },
    { "feeId": 101005, "campId": 101, "roomTypeId": 10103, "feeType": 1, "basePrice": 100.00, "premiumRate": 1.0, "includeServices": "含3餐+团体课+基础体测", "validStart": "2025-10-01 00:00:00", "validEnd": null },
    { "feeId": 101006, "campId": 101, "roomTypeId": 10103, "feeType": 3, "basePrice": 2800.00, "premiumRate": 1.0, "includeServices": "含3餐+团体课+1次私教体验", "validStart": "2025-10-01 00:00:00", "validEnd": null },

    // 102营地（单人间10201/双人间10202/四人间10203）
    { "feeId": 102001, "campId": 102, "roomTypeId": 10201, "feeType": 1, "basePrice": 190.00, "premiumRate": 1.0, "includeServices": "含3餐+团体课+基础体测", "validStart": "2025-10-01 00:00:00", "validEnd": null },
    { "feeId": 102002, "campId": 102, "roomTypeId": 10201, "feeType": 3, "basePrice": 5200.00, "premiumRate": 1.0, "includeServices": "含3餐+团体课+1次私教体验", "validStart": "2025-10-01 00:00:00", "validEnd": null },
    { "feeId": 102003, "campId": 102, "roomTypeId": 10202, "feeType": 1, "basePrice": 140.00, "premiumRate": 1.0, "includeServices": "含3餐+团体课+基础体测", "validStart": "2025-10-01 00:00:00", "validEnd": null },
    { "feeId": 102004, "campId": 102, "roomTypeId": 10202, "feeType": 3, "basePrice": 3800.00, "premiumRate": 1.0, "includeServices": "含3餐+团体课+1次私教体验", "validStart": "2025-10-01 00:00:00", "validEnd": null },
    { "feeId": 102005, "campId": 102, "roomTypeId": 10203, "feeType": 1, "basePrice": 95.00, "premiumRate": 1.0, "includeServices": "含3餐+团体课+基础体测", "validStart": "2025-10-01 00:00:00", "validEnd": null },
    { "feeId": 102006, "campId": 102, "roomTypeId": 10203, "feeType": 3, "basePrice": 2600.00, "premiumRate": 1.0, "includeServices": "含3餐+团体课+1次私教体验", "validStart": "2025-10-01 00:00:00", "validEnd": null },

    // 103营地（单人间10301/双人间10302/四人间10303）
    { "feeId": 103001, "campId": 103, "roomTypeId": 10301, "feeType": 1, "basePrice": 180.00, "premiumRate": 1.0, "includeServices": "含3餐+团体课+基础体测", "validStart": "2025-10-01 00:00:00", "validEnd": null },
    { "feeId": 103002, "campId": 103, "roomTypeId": 10301, "feeType": 3, "basePrice": 5000.00, "premiumRate": 1.0, "includeServices": "含3餐+团体课+1次私教体验", "validStart": "2025-10-01 00:00:00", "validEnd": null },
    { "feeId": 103003, "campId": 103, "roomTypeId": 10302, "feeType": 1, "basePrice": 135.00, "premiumRate": 1.0, "includeServices": "含3餐+团体课+基础体测", "validStart": "2025-10-01 00:00:00", "validEnd": null },
    { "feeId": 103004, "campId": 103, "roomTypeId": 10302, "feeType": 3, "basePrice": 3600.00, "premiumRate": 1.0, "includeServices": "含3餐+团体课+1次私教体验", "validStart": "2025-10-01 00:00:00", "validEnd": null },
    { "feeId": 103005, "campId": 103, "roomTypeId": 10303, "feeType": 1, "basePrice": 90.00, "premiumRate": 1.0, "includeServices": "含3餐+团体课+基础体测", "validStart": "2025-10-01 00:00:00", "validEnd": null },
    { "feeId": 103006, "campId": 103, "roomTypeId": 10303, "feeType": 3, "basePrice": 2500.00, "premiumRate": 1.0, "includeServices": "含3餐+团体课+1次私教体验", "validStart": "2025-10-01 00:00:00", "validEnd": null }
  ],

  // 新增：学员入住表（student_checkin）- 每个学员1条记录
  "studentCheckin": [
    // 101营地学员（1001-1020，按天入住7天）
    { "checkinId": 101001, "stuId": 1001, "campId": 101, "roomTypeId": 10101, "feeId": 101001, "checkinDate": "2025-10-01 09:00:00", "checkoutDate": null, "actualPrice": 1400.00, "paymentStatus": 1 },
    { "checkinId": 101002, "stuId": 1002, "campId": 101, "roomTypeId": 10101, "feeId": 101001, "checkinDate": "2025-10-01 09:10:00", "checkoutDate": null, "actualPrice": 1400.00, "paymentStatus": 1 },
    { "checkinId": 101003, "stuId": 1003, "campId": 101, "roomTypeId": 10101, "feeId": 101001, "checkinDate": "2025-10-01 09:20:00", "checkoutDate": null, "actualPrice": 1400.00, "paymentStatus": 1 },
    { "checkinId": 101004, "stuId": 1004, "campId": 101, "roomTypeId": 10101, "feeId": 101001, "checkinDate": "2025-10-01 09:30:00", "checkoutDate": null, "actualPrice": 1400.00, "paymentStatus": 1 },
    { "checkinId": 101005, "stuId": 1005, "campId": 101, "roomTypeId": 10101, "feeId": 101001, "checkinDate": "2025-10-01 09:40:00", "checkoutDate": null, "actualPrice": 1400.00, "paymentStatus": 1 },
    { "checkinId": 101006, "stuId": 1006, "campId": 101, "roomTypeId": 10102, "feeId": 101003, "checkinDate": "2025-10-01 09:50:00", "checkoutDate": null, "actualPrice": 1050.00, "paymentStatus": 1 },
    { "checkinId": 101007, "stuId": 1007, "campId": 101, "roomTypeId": 10102, "feeId": 101003, "checkinDate": "2025-10-01 10:00:00", "checkoutDate": null, "actualPrice": 1050.00, "paymentStatus": 1 },
    { "checkinId": 101008, "stuId": 1008, "campId": 101, "roomTypeId": 10102, "feeId": 101003, "checkinDate": "2025-10-01 10:10:00", "checkoutDate": null, "actualPrice": 1050.00, "paymentStatus": 1 },
    { "checkinId": 101009, "stuId": 1009, "campId": 101, "roomTypeId": 10102, "feeId": 101003, "checkinDate": "2025-10-01 10:20:00", "checkoutDate": null, "actualPrice": 1050.00, "paymentStatus": 1 },
    { "checkinId": 101010, "stuId": 1010, "campId": 101, "roomTypeId": 10102, "feeId": 101003, "checkinDate": "2025-10-01 10:30:00", "checkoutDate": null, "actualPrice": 1050.00, "paymentStatus": 1 },
    { "checkinId": 101011, "stuId": 1011, "campId": 101, "roomTypeId": 10103, "feeId": 101005, "checkinDate": "2025-10-02 08:00:00", "checkoutDate": null, "actualPrice": 700.00, "paymentStatus": 1 },
    { "checkinId": 101012, "stuId": 1012, "campId": 101, "roomTypeId": 10103, "feeId": 101005, "checkinDate": "2025-10-02 08:10:00", "checkoutDate": null, "actualPrice": 700.00, "paymentStatus": 1 },
    { "checkinId": 101013, "stuId": 1013, "campId": 101, "roomTypeId": 10103, "feeId": 101005, "checkinDate": "2025-10-02 08:20:00", "checkoutDate": null, "actualPrice": 700.00, "paymentStatus": 1 },
    { "checkinId": 101014, "stuId": 1014, "campId": 101, "roomTypeId": 10103, "feeId": 101005, "checkinDate": "2025-10-02 08:30:00", "checkoutDate": null, "actualPrice": 700.00, "paymentStatus": 1 },
    { "checkinId": 101015, "stuId": 1015, "campId": 101, "roomTypeId": 10103, "feeId": 101005, "checkinDate": "2025-10-02 08:40:00", "checkoutDate": null, "actualPrice": 700.00, "paymentStatus": 1 },
    { "checkinId": 101016, "stuId": 1016, "campId": 101, "roomTypeId": 10103, "feeId": 101005, "checkinDate": "2025-10-02 08:50:00", "checkoutDate": null, "actualPrice": 700.00, "paymentStatus": 1 },
    { "checkinId": 101017, "stuId": 1017, "campId": 101, "roomTypeId": 10103, "feeId": 101005, "checkinDate": "2025-10-02 09:00:00", "checkoutDate": null, "actualPrice": 700.00, "paymentStatus": 1 },
    { "checkinId": 101018, "stuId": 1018, "campId": 101, "roomTypeId": 10103, "feeId": 101005, "checkinDate": "2025-10-02 09:10:00", "checkoutDate": null, "actualPrice": 700.00, "paymentStatus": 1 },
    { "checkinId": 101019, "stuId": 1019, "campId": 101, "roomTypeId": 10103, "feeId": 101005, "checkinDate": "2025-10-02 09:20:00", "checkoutDate": null, "actualPrice": 700.00, "paymentStatus": 1 },
    { "checkinId": 101020, "stuId": 1020, "campId": 101, "roomTypeId": 10103, "feeId": 101005, "checkinDate": "2025-10-02 09:30:00", "checkoutDate": null, "actualPrice": 700.00, "paymentStatus": 1 },

    // 102营地学员（2001-2020，按月入住）
    { "checkinId": 102001, "stuId": 2001, "campId": 102, "roomTypeId": 10201, "feeId": 102002, "checkinDate": "2025-10-01 10:00:00", "checkoutDate": null, "actualPrice": 5200.00, "paymentStatus": 1 },
    { "checkinId": 102002, "stuId": 2002, "campId": 102, "roomTypeId": 10201, "feeId": 102002, "checkinDate": "2025-10-01 10:10:00", "checkoutDate": null, "actualPrice": 5200.00, "paymentStatus": 1 },
    { "checkinId": 102003, "stuId": 2003, "campId": 102, "roomTypeId": 10201, "feeId": 102002, "checkinDate": "2025-10-01 10:20:00", "checkoutDate": null, "actualPrice": 5200.00, "paymentStatus": 1 },
    { "checkinId": 102004, "stuId": 2004, "campId": 102, "roomTypeId": 10201, "feeId": 102002, "checkinDate": "2025-10-01 10:30:00", "checkoutDate": null, "actualPrice": 5200.00, "paymentStatus": 1 },
    { "checkinId": 102005, "stuId": 2005, "campId": 102, "roomTypeId": 10202, "feeId": 102004, "checkinDate": "2025-10-01 10:40:00", "checkoutDate": null, "actualPrice": 3800.00, "paymentStatus": 1 },
    { "checkinId": 102006, "stuId": 2006, "campId": 102, "roomTypeId": 10202, "feeId": 102004, "checkinDate": "2025-10-01 10:50:00", "checkoutDate": null, "actualPrice": 3800.00, "paymentStatus": 1 },
    { "checkinId": 102007, "stuId": 2007, "campId": 102, "roomTypeId": 10202, "feeId": 102004, "checkinDate": "2025-10-01 11:00:00", "checkoutDate": null, "actualPrice": 3800.00, "paymentStatus": 1 },
    { "checkinId": 102008, "stuId": 2008, "campId": 102, "roomTypeId": 10202, "feeId": 102004, "checkinDate": "2025-10-01 11:10:00", "checkoutDate": null, "actualPrice": 3800.00, "paymentStatus": 1 },
    { "checkinId": 102009, "stuId": 2009, "campId": 102, "roomTypeId": 10202, "feeId": 102004, "checkinDate": "2025-10-01 11:20:00", "checkoutDate": null, "actualPrice": 3800.00, "paymentStatus": 1 },
    { "checkinId": 102010, "stuId": 2010, "campId": 102, "roomTypeId": 10202, "feeId": 102004, "checkinDate": "2025-10-01 11:30:00", "checkoutDate": null, "actualPrice": 3800.00, "paymentStatus": 1 },
    { "checkinId": 102011, "stuId": 2011, "campId": 102, "roomTypeId": 10203, "feeId": 102006, "checkinDate": "2025-10-01 11:40:00", "checkoutDate": null, "actualPrice": 2600.00, "paymentStatus": 1 },
    { "checkinId": 102012, "stuId": 2012, "campId": 102, "roomTypeId": 10203, "feeId": 102006, "checkinDate": "2025-10-01 11:50:00", "checkoutDate": null, "actualPrice": 2600.00, "paymentStatus": 1 },
    { "checkinId": 102013, "stuId": 2013, "campId": 102, "roomTypeId": 10203, "feeId": 102006, "checkinDate": "2025-10-01 12:00:00", "checkoutDate": null, "actualPrice": 2600.00, "paymentStatus": 1 },
    { "checkinId": 102014, "stuId": 2014, "campId": 102, "roomTypeId": 10203, "feeId": 102006, "checkinDate": "2025-10-01 12:10:00", "checkoutDate": null, "actualPrice": 2600.00, "paymentStatus": 1 },
    { "checkinId": 102015, "stuId": 2015, "campId": 102, "roomTypeId": 10203, "feeId": 102006, "checkinDate": "2025-10-01 12:20:00", "checkoutDate": null, "actualPrice": 2600.00, "paymentStatus": 1 },
    { "checkinId": 102016, "stuId": 2016, "campId": 102, "roomTypeId": 10203, "feeId": 102006, "checkinDate": "2025-10-01 12:30:00", "checkoutDate": null, "actualPrice": 2600.00, "paymentStatus": 1 },
    { "checkinId": 102017, "stuId": 2017, "campId": 102, "roomTypeId": 10203, "feeId": 102006, "checkinDate": "2025-10-01 12:40:00", "checkoutDate": null, "actualPrice": 2600.00, "paymentStatus": 1 },
    { "checkinId": 102018, "stuId": 2018, "campId": 102, "roomTypeId": 10203, "feeId": 102006, "checkinDate": "2025-10-01 12:50:00", "checkoutDate": null, "actualPrice": 2600.00, "paymentStatus": 1 },
    { "checkinId": 102019, "stuId": 2019, "campId": 102, "roomTypeId": 10203, "feeId": 102006, "checkinDate": "2025-10-01 13:00:00", "checkoutDate": null, "actualPrice": 2600.00, "paymentStatus": 1 },
    { "checkinId": 102020, "stuId": 2020, "campId": 102, "roomTypeId": 10203, "feeId": 102006, "checkinDate": "2025-10-01 13:10:00", "checkoutDate": null, "actualPrice": 2600.00, "paymentStatus": 1 },

    // 103营地学员（3001-3020，按天入住14天）
    { "checkinId": 103001, "stuId": 3001, "campId": 103, "roomTypeId": 10301, "feeId": 103001, "checkinDate": "2025-10-01 14:00:00", "checkoutDate": null, "actualPrice": 2520.00, "paymentStatus": 1 },
    { "checkinId": 103002, "stuId": 3002, "campId": 103, "roomTypeId": 10301, "feeId": 103001, "checkinDate": "2025-10-01 14:10:00", "checkoutDate": null, "actualPrice": 2520.00, "paymentStatus": 1 },
    { "checkinId": 103003, "stuId": 3003, "campId": 103, "roomTypeId": 10301, "feeId": 103001, "checkinDate": "2025-10-01 14:20:00", "checkoutDate": null, "actualPrice": 2520.00, "paymentStatus": 1 },
    { "checkinId": 103004, "stuId": 3004, "campId": 103, "roomTypeId": 10301, "feeId": 103001, "checkinDate": "2025-10-01 14:30:00", "checkoutDate": null, "actualPrice": 2520.00, "paymentStatus": 1 },
    { "checkinId": 103005, "stuId": 3005, "campId": 103, "roomTypeId": 10301, "feeId": 103001, "checkinDate": "2025-10-01 14:40:00", "checkoutDate": null, "actualPrice": 2520.00, "paymentStatus": 1 },
    { "checkinId": 103006, "stuId": 3006, "campId": 103, "roomTypeId": 10301, "feeId": 103001, "checkinDate": "2025-10-01 14:50:00", "checkoutDate": null, "actualPrice": 2520.00, "paymentStatus": 1 },
    { "checkinId": 103007, "stuId": 3007, "campId": 103, "roomTypeId": 10302, "feeId": 103003, "checkinDate": "2025-10-01 15:00:00", "checkoutDate": null, "actualPrice": 1890.00, "paymentStatus": 1 },
    { "checkinId": 103008, "stuId": 3008, "campId": 103, "roomTypeId": 10302, "feeId": 103003, "checkinDate": "2025-10-01 15:10:00", "checkoutDate": null, "actualPrice": 1890.00, "paymentStatus": 1 },
    { "checkinId": 103009, "stuId": 3009, "campId": 103, "roomTypeId": 10302, "feeId": 103003, "checkinDate": "2025-10-01 15:20:00", "checkoutDate": null, "actualPrice": 1890.00, "paymentStatus": 1 },
    { "checkinId": 103010, "stuId": 3010, "campId": 103, "roomTypeId": 10302, "feeId": 103003, "checkinDate": "2025-10-01 15:30:00", "checkoutDate": null, "actualPrice": 1890.00, "paymentStatus": 1 },
    { "checkinId": 103011, "stuId": 3011, "campId": 103, "roomTypeId": 10302, "feeId": 103003, "checkinDate": "2025-10-01 15:40:00", "checkoutDate": null, "actualPrice": 1890.00, "paymentStatus": 1 },
    { "checkinId": 103012, "stuId": 3012, "campId": 103, "roomTypeId": 10302, "feeId": 103003, "checkinDate": "2025-10-01 15:50:00", "checkoutDate": null, "actualPrice": 1890.00, "paymentStatus": 1 },
    { "checkinId": 103013, "stuId": 3013, "campId": 103, "roomTypeId": 10302, "feeId": 103003, "checkinDate": "2025-10-01 16:00:00", "checkoutDate": null, "actualPrice": 1890.00, "paymentStatus": 1 },
    { "checkinId": 103014, "stuId": 3014, "campId": 103, "roomTypeId": 10302, "feeId": 103003, "checkinDate": "2025-10-01 16:10:00", "checkoutDate": null, "actualPrice": 1890.00, "paymentStatus": 1 },
    { "checkinId": 103015, "stuId": 3015, "campId": 103, "roomTypeId": 10303, "feeId": 103005, "checkinDate": "2025-10-01 16:20:00", "checkoutDate": null, "actualPrice": 1260.00, "paymentStatus": 1 },
    { "checkinId": 103016, "stuId": 3016, "campId": 103, "roomTypeId": 10303, "feeId": 103005, "checkinDate": "2025-10-01 16:30:00", "checkoutDate": null, "actualPrice": 1260.00, "paymentStatus": 1 },
    { "checkinId": 103017, "stuId": 3017, "campId": 103, "roomTypeId": 10303, "feeId": 103005, "checkinDate": "2025-10-01 16:40:00", "checkoutDate": null, "actualPrice": 1260.00, "paymentStatus": 1 },
    { "checkinId": 103018, "stuId": 3018, "campId": 103, "roomTypeId": 10303, "feeId": 103005, "checkinDate": "2025-10-01 16:50:00", "checkoutDate": null, "actualPrice": 1260.00, "paymentStatus": 1 },
    { "checkinId": 103019, "stuId": 3019, "campId": 103, "roomTypeId": 10303, "feeId": 103005, "checkinDate": "2025-10-01 17:00:00", "checkoutDate": null, "actualPrice": 1260.00, "paymentStatus": 1 },
    { "checkinId": 103020, "stuId": 3020, "campId": 103, "roomTypeId": 10303, "feeId": 103005, "checkinDate": "2025-10-01 17:10:00", "checkoutDate": null, "actualPrice": 1260.00, "paymentStatus": 1 }
  ],

  // 新增：私教课程表（private_course）- 多条课程预约记录
  "privateCourse": [
    // 101营地私教课程（关联stu_private_purchase 10001-10011）
    {
      "pcId": 1001,
      "campId": 101,
      "stuId": 1001,
      "coachId": "emp002",
      "purchaseId": 10001,
      "classDate": "2025-10-08",
      "startTime": "14:00:00",
      "endTime": "15:00:00",
      "status": 1,
      "cancelReason": null
    },
    {
      "pcId": 1002,
      "campId": 101,
      "stuId": 1001,
      "coachId": "emp002",
      "purchaseId": 10001,
      "classDate": "2025-10-11",
      "startTime": "16:30:00",
      "endTime": "17:30:00",
      "status": 0,
      "cancelReason": null
    },
    {
      "pcId": 1003,
      "campId": 101,
      "stuId": 1002,
      "coachId": "emp002",
      "purchaseId": 10011,
      "classDate": "2025-10-07",
      "startTime": "10:00:00",
      "endTime": "11:00:00",
      "status": 2,
      "cancelReason": "学员临时出差"
    },
    {
      "pcId": 1004,
      "campId": 101,
      "stuId": 1003,
      "coachId": "emp003",
      "purchaseId": 10002,
      "classDate": "2025-10-09",
      "startTime": "09:30:00",
      "endTime": "10:30:00",
      "status": 1,
      "cancelReason": null
    },
    // 102营地私教课程（关联stu_private_purchase 20001-20011）
    {
      "pcId": 2001,
      "campId": 102,
      "stuId": 2001,
      "coachId": "emp011",
      "purchaseId": 20001,
      "classDate": "2025-10-08",
      "startTime": "15:00:00",
      "endTime": "16:00:00",
      "status": 1,
      "cancelReason": null
    },
    {
      "pcId": 2002,
      "campId": 102,
      "stuId": 2002,
      "coachId": "emp011",
      "purchaseId": 20011,
      "classDate": "2025-10-06",
      "startTime": "11:00:00",
      "endTime": "12:00:00",
      "status": 2,
      "cancelReason": "全额退款后课程取消"
    },
    // 103营地私教课程（关联stu_private_purchase 30001-30010）
    {
      "pcId": 3001,
      "campId": 103,
      "stuId": 3001,
      "coachId": "emp020",
      "purchaseId": 30001,
      "classDate": "2025-10-08",
      "startTime": "14:30:00",
      "endTime": "15:30:00",
      "status": 1,
      "cancelReason": null
    }
  ],
  // 新增：学员私教购买记录表（stu_private_purchase）- 每个学员1条购买记录
  "stuPrivatePurchase": [
    // 101营地学员私教购买记录（10名学员，关联emp002-emp005教练）
    {
      "purchaseId": 10001,
      "stuId": 1001,
      "coachId": "emp002",
      "campId": 101,
      "totalClasses": 10,
      "remainingClasses": 10,
      "purchaseAmount": 5000.00,
      "purchaseTime": "2025-10-01 11:00:00",
      "expireDate": "2026-01-01",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 10002,
      "stuId": 1003,
      "coachId": "emp003",
      "campId": 101,
      "totalClasses": 20,
      "remainingClasses": 20,
      "purchaseAmount": 9600.00,
      "purchaseTime": "2025-10-01 14:30:00",
      "expireDate": "2026-04-01",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 10003,
      "stuId": 1005,
      "coachId": null,
      "campId": 101,
      "totalClasses": 15,
      "remainingClasses": 15,
      "purchaseAmount": 7200.00,
      "purchaseTime": "2025-10-02 09:15:00",
      "expireDate": "2026-03-02",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 10004,
      "stuId": 1007,
      "coachId": "emp004",
      "campId": 101,
      "totalClasses": 8,
      "remainingClasses": 8,
      "purchaseAmount": 4000.00,
      "purchaseTime": "2025-10-02 11:20:00",
      "expireDate": "2025-12-02",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 10005,
      "stuId": 1009,
      "coachId": "emp005",
      "campId": 101,
      "totalClasses": 25,
      "remainingClasses": 25,
      "purchaseAmount": 12000.00,
      "purchaseTime": "2025-10-03 15:40:00",
      "expireDate": "2026-05-03",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 10006,
      "stuId": 1011,
      "coachId": "emp002",
      "campId": 101,
      "totalClasses": 12,
      "remainingClasses": 12,
      "purchaseAmount": 5880.00,
      "purchaseTime": "2025-10-03 16:30:00",
      "expireDate": "2026-02-03",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 10007,
      "stuId": 1013,
      "coachId": null,
      "campId": 101,
      "totalClasses": 18,
      "remainingClasses": 18,
      "purchaseAmount": 8640.00,
      "purchaseTime": "2025-10-04 10:00:00",
      "expireDate": "2026-04-04",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 10008,
      "stuId": 1015,
      "coachId": "emp003",
      "campId": 101,
      "totalClasses": 10,
      "remainingClasses": 10,
      "purchaseAmount": 5200.00,
      "purchaseTime": "2025-10-04 14:10:00",
      "expireDate": "2026-01-04",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 10009,
      "stuId": 1017,
      "coachId": "emp004",
      "campId": 101,
      "totalClasses": 22,
      "remainingClasses": 22,
      "purchaseAmount": 10560.00,
      "purchaseTime": "2025-10-05 09:25:00",
      "expireDate": "2026-05-05",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 10010,
      "stuId": 1019,
      "coachId": "emp005",
      "campId": 101,
      "totalClasses": 16,
      "remainingClasses": 16,
      "purchaseAmount": 7680.00,
      "purchaseTime": "2025-10-05 15:50:00",
      "expireDate": "2026-03-05",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },

    // 102营地学员私教购买记录（10名学员，关联emp011-emp014教练）
    {
      "purchaseId": 20001,
      "stuId": 2001,
      "coachId": "emp011",
      "campId": 102,
      "totalClasses": 10,
      "remainingClasses": 10,
      "purchaseAmount": 5100.00,
      "purchaseTime": "2025-10-01 10:30:00",
      "expireDate": "2026-01-01",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 20002,
      "stuId": 2003,
      "coachId": "emp012",
      "campId": 102,
      "totalClasses": 18,
      "remainingClasses": 18,
      "purchaseAmount": 8820.00,
      "purchaseTime": "2025-10-01 15:10:00",
      "expireDate": "2026-04-01",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 20003,
      "stuId": 2005,
      "coachId": null,
      "campId": 102,
      "totalClasses": 25,
      "remainingClasses": 25,
      "purchaseAmount": 12250.00,
      "purchaseTime": "2025-10-02 09:40:00",
      "expireDate": "2026-05-02",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 20004,
      "stuId": 2007,
      "coachId": "emp013",
      "campId": 102,
      "totalClasses": 12,
      "remainingClasses": 12,
      "purchaseAmount": 5880.00,
      "purchaseTime": "2025-10-02 14:20:00",
      "expireDate": "2026-02-02",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 20005,
      "stuId": 2009,
      "coachId": "emp014",
      "campId": 102,
      "totalClasses": 8,
      "remainingClasses": 8,
      "purchaseAmount": 4000.00,
      "purchaseTime": "2025-10-03 10:15:00",
      "expireDate": "2025-12-03",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 20006,
      "stuId": 2011,
      "coachId": "emp011",
      "campId": 102,
      "totalClasses": 20,
      "remainingClasses": 20,
      "purchaseAmount": 9800.00,
      "purchaseTime": "2025-10-03 16:40:00",
      "expireDate": "2026-04-03",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 20007,
      "stuId": 2013,
      "coachId": null,
      "campId": 102,
      "totalClasses": 15,
      "remainingClasses": 15,
      "purchaseAmount": 7350.00,
      "purchaseTime": "2025-10-04 09:30:00",
      "expireDate": "2026-03-04",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 20008,
      "stuId": 2015,
      "coachId": "emp012",
      "campId": 102,
      "totalClasses": 16,
      "remainingClasses": 16,
      "purchaseAmount": 7840.00,
      "purchaseTime": "2025-10-04 15:00:00",
      "expireDate": "2026-03-04",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 20009,
      "stuId": 2017,
      "coachId": "emp013",
      "campId": 102,
      "totalClasses": 22,
      "remainingClasses": 22,
      "purchaseAmount": 10780.00,
      "purchaseTime": "2025-10-05 10:00:00",
      "expireDate": "2026-05-05",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 20010,
      "stuId": 2019,
      "coachId": "emp014",
      "campId": 102,
      "totalClasses": 10,
      "remainingClasses": 10,
      "purchaseAmount": 5100.00,
      "purchaseTime": "2025-10-05 15:30:00",
      "expireDate": "2026-01-05",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },

    // 103营地学员私教购买记录（10名学员，关联emp020-emp023教练）
    {
      "purchaseId": 30001,
      "stuId": 3001,
      "coachId": "emp020",
      "campId": 103,
      "totalClasses": 12,
      "remainingClasses": 12,
      "purchaseAmount": 6000.00,
      "purchaseTime": "2025-10-01 11:20:00",
      "expireDate": "2026-02-01",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 30002,
      "stuId": 3003,
      "coachId": "emp021",
      "campId": 103,
      "totalClasses": 20,
      "remainingClasses": 20,
      "purchaseAmount": 9800.00,
      "purchaseTime": "2025-10-01 15:40:00",
      "expireDate": "2026-04-01",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 30003,
      "stuId": 3005,
      "coachId": null,
      "campId": 103,
      "totalClasses": 18,
      "remainingClasses": 18,
      "purchaseAmount": 8820.00,
      "purchaseTime": "2025-10-02 10:00:00",
      "expireDate": "2026-04-02",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 30004,
      "stuId": 3007,
      "coachId": "emp022",
      "campId": 103,
      "totalClasses": 10,
      "remainingClasses": 10,
      "purchaseAmount": 5100.00,
      "purchaseTime": "2025-10-02 14:50:00",
      "expireDate": "2026-01-02",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 30005,
      "stuId": 3009,
      "coachId": "emp023",
      "campId": 103,
      "totalClasses": 25,
      "remainingClasses": 25,
      "purchaseAmount": 12250.00,
      "purchaseTime": "2025-10-03 10:30:00",
      "expireDate": "2026-05-03",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 30006,
      "stuId": 3011,
      "coachId": "emp020",
      "campId": 103,
      "totalClasses": 16,
      "remainingClasses": 16,
      "purchaseAmount": 7840.00,
      "purchaseTime": "2025-10-03 16:10:00",
      "expireDate": "2026-03-03",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 30007,
      "stuId": 3013,
      "coachId": null,
      "campId": 103,
      "totalClasses": 22,
      "remainingClasses": 22,
      "purchaseAmount": 10780.00,
      "purchaseTime": "2025-10-04 09:45:00",
      "expireDate": "2026-05-04",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 30008,
      "stuId": 3015,
      "coachId": "emp021",
      "campId": 103,
      "totalClasses": 8,
      "remainingClasses": 8,
      "purchaseAmount": 3920.00,
      "purchaseTime": "2025-10-04 15:20:00",
      "expireDate": "2025-12-04",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 30009,
      "stuId": 3017,
      "coachId": "emp022",
      "campId": 103,
      "totalClasses": 15,
      "remainingClasses": 15,
      "purchaseAmount": 7350.00,
      "purchaseTime": "2025-10-05 10:15:00",
      "expireDate": "2026-03-05",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },
    {
      "purchaseId": 30010,
      "stuId": 3019,
      "coachId": "emp023",
      "campId": 103,
      "totalClasses": 20,
      "remainingClasses": 20,
      "purchaseAmount": 9800.00,
      "purchaseTime": "2025-10-05 15:50:00",
      "expireDate": "2026-04-05",
      "refundStatus": 0,
      "refundAmount": 0.00,
      "refundTime": null
    },

    // 补充部分退款/全额退款场景（覆盖异常场景）
    {
      "purchaseId": 10011,
      "stuId": 1002,
      "coachId": "emp002",
      "campId": 101,
      "totalClasses": 10,
      "remainingClasses": 7,
      "purchaseAmount": 5000.00,
      "purchaseTime": "2025-10-01 12:00:00",
      "expireDate": "2026-01-01",
      "refundStatus": 1,
      "refundAmount": 1500.00,
      "refundTime": "2025-10-06 11:30:00"
    },
    {
      "purchaseId": 20011,
      "stuId": 2002,
      "coachId": "emp011",
      "campId": 102,
      "totalClasses": 15,
      "remainingClasses": 0,
      "purchaseAmount": 7350.00,
      "purchaseTime": "2025-10-01 13:00:00",
      "expireDate": "2026-03-01",
      "refundStatus": 2,
      "refundAmount": 7350.00,
      "refundTime": "2025-10-07 14:20:00"
    }
  ],
  // 新增：团体课程表（course）- 多条课程安排记录
  "course": [
    // 101营地团体课
    {
      "courseId": 10101,
      "campId": 101,
      "courseName": "动感单车",
      "coachId": "emp004",
      "venue": "1号操房",
      "startTime": "2025-10-08 08:30:00",
      "endTime": "2025-10-08 09:30:00",
      "maxCapacity": 30,
      "status": 1
    },
    {
      "courseId": 10102,
      "campId": 101,
      "courseName": "瑜伽拉伸",
      "coachId": "emp002",
      "venue": "2号操房",
      "startTime": "2025-10-08 16:00:00",
      "endTime": "2025-10-08 17:00:00",
      "maxCapacity": 20,
      "status": 1
    },
    // 102营地团体课
    {
      "courseId": 10201,
      "campId": 102,
      "courseName": "青少年体能",
      "coachId": "emp013",
      "venue": "3号操房",
      "startTime": "2025-10-08 10:00:00",
      "endTime": "2025-10-08 11:00:00",
      "maxCapacity": 25,
      "status": 1
    },
    // 103营地团体课
    {
      "courseId": 10301,
      "campId": 103,
      "courseName": "核心力量",
      "coachId": "emp022",
      "venue": "1号操房",
      "startTime": "2025-10-08 09:00:00",
      "endTime": "2025-10-08 10:00:00",
      "maxCapacity": 22,
      "status": 1
    }
  ],
//  新增：学员体测数据表（stu_body_data）- 多条体测记录
  "stuBodyData": [
    // 101营地学员数据
    {
      "dataId": 10001,
      "stuId": 1001,
      "coachId": "emp002",
      "measureTime": "2025-10-01 10:00:00",
      "measureType": "入营测量",
      "weight": 85.0,
      "bodyFatRate": 28.5,
      "muscleRate": 35.2,
      "waistCircumference": 92.5,
      "note": "基础代谢偏低，需增加力量训练"
    },
    {
      "dataId": 10002,
      "stuId": 1001,
      "coachId": "emp002",
      "measureTime": "2025-10-08 10:00:00",
      "measureType": "周测",
      "weight": 83.2,
      "bodyFatRate": 27.8,
      "muscleRate": 35.5,
      "waistCircumference": 90.8,
      "note": "减重效果明显，继续保持饮食控制"
    },
    {
      "dataId": 10003,
      "stuId": 1002,
      "coachId": "emp002",
      "measureTime": "2025-10-01 10:15:00",
      "measureType": "入营测量",
      "weight": 78.5,
      "bodyFatRate": 26.3,
      "muscleRate": 34.8,
      "waistCircumference": 88.2,
      "note": "膝盖轻微劳损，避免高冲击训练"
    },
    // 102营地学员数据
    {
      "dataId": 20001,
      "stuId": 2001,
      "coachId": "emp011",
      "measureTime": "2025-10-01 11:00:00",
      "measureType": "入营测量",
      "weight": 92.0,
      "bodyFatRate": 30.1,
      "muscleRate": 33.5,
      "waistCircumference": 95.3,
      "note": "每日需增加30分钟有氧训练"
    },
    // 103营地学员数据
    {
      "dataId": 30001,
      "stuId": 3001,
      "coachId": "emp020",
      "measureTime": "2025-10-01 15:00:00",
      "measureType": "入营测量",
      "weight": 81.5,
      "bodyFatRate": 27.2,
      "muscleRate": 35.0,
      "waistCircumference": 91.0,
      "note": "饮食需减少精制碳水摄入"
    }
  ]


}

export type CollectionName = keyof typeof mockData;
export type MockData = typeof mockData;

const _delay = (ms = 200) => new Promise<void>(resolve => setTimeout(resolve, ms));

export async function getCollection<K extends CollectionName>(
  name: K,
  options?: { page?: number; pageSize?: number; filter?: (item: any) => boolean; delayMs?: number }
) {
  await _delay(options?.delayMs ?? 200);
  let data = (mockData[name] as any[]).slice();
  if (options?.filter) data = data.filter(options.filter);
  if (options?.page && options?.pageSize) {
    const start = (options.page - 1) * options.pageSize;
    data = data.slice(start, start + options.pageSize);
  }
  return JSON.parse(JSON.stringify(data));
}

export async function getById<K extends CollectionName>(
  name: K,
  idField: string,
  idValue: any,
  delayMs = 100
) {
  await _delay(delayMs);
  const found = (mockData[name] as any[]).find(item => item[idField] === idValue) ?? null;
  return JSON.parse(JSON.stringify(found));
}

// 简单示例：前端可以直接导入 { getCollection, getById } 来模拟异步请求
export default mockData;