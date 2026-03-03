/**
 * 房间管理相关接口
 */
import { http, ApiResponse } from '@/lib/request';
import type { Student } from './student';

export interface RoomType {
  roomTypeId: number;
  campId: number;
  roomName: string;
  bedCount: number;
  bedType: number; // 0: 普通床位, 1: 上下床
  roomStatus: number;
  price?: number;        // 普通床位价格
  upperPrice?: number;   // 上床价格
  lowerPrice?: number;   // 下床价格
  createTime?: string;
  updateTime?: string;
}

export interface Room {
  roomId: number;
  campId: number;
  typeId: number;
  roomNum: string;
  bedCount: number;
  status: number;
  createTime?: string;
  updateTime?: string;
}

export interface Bed {
  bedId: number;
  roomId: number;
  roomTypeId: number;
  bedNum: string;
  stuId?: number | null;
  status: number;
}

export interface RoomTypeListParams {
  page?: number;
  pageSize?: number;
  campId?: number;
  roomName?: string;
  bedCount?: number; // 床位数：1=单人间, 2=双人间, 3=三人间等
  bedType?: number;
  roomStatus?: number;
}

export interface RoomListParams {
  page?: number;
  pageSize?: number;
  campId?: number;
  typeId?: number;
  roomNum?: string;
  status?: number;
}

export interface RoomDetail extends Room {
  roomType?: RoomType;
  beds: Array<Bed & { student?: Student }>;
}

export interface RoomDetailListParams {
  page?: number;
  pageSize?: number;
  campId?: number;
  typeId?: number;
  bedCount?: number; // 床位数：1=单人间, 2=双人间, 3=三人间等
  roomName?: string; // 房间类型名称
  studentName?: string;
  roomNum?: string;
  status?: number;
  bedType?: number; // 床位类型：0=普通床位, 1=上下床
}

/**
 * 获取房间类型列表
 */
export const getRoomTypeList = (params?: RoomTypeListParams): Promise<ApiResponse<RoomType[]>> => {
  return http.get<RoomType[]>('/room-types', { params });
};

/**
 * 创建房间类型
 */
export const createRoomType = (data: Omit<RoomType, 'roomTypeId'>): Promise<ApiResponse<RoomType>> => {
  return http.post<RoomType>('/room-types', data);
};

/**
 * 更新房间类型
 */
export const updateRoomType = (id: number, data: Partial<RoomType>): Promise<ApiResponse<RoomType>> => {
  return http.put<RoomType>(`/room-types/${id}`, data);
};

/**
 * 删除房间类型
 */
export const deleteRoomType = (id: number): Promise<ApiResponse<void>> => {
  return http.delete<void>(`/room-types/${id}`);
};

/**
 * 获取房间列表
 */
export const getRoomList = (params?: RoomListParams): Promise<ApiResponse<Room[]>> => {
  return http.get<Room[]>('/rooms', { params });
};

/**
 * 创建房间
 */
export const createRoom = (data: Omit<Room, 'roomId'>): Promise<ApiResponse<Room>> => {
  return http.post<Room>('/rooms', data);
};

/**
 * 更新房间
 */
export const updateRoom = (id: number, data: Partial<Room>): Promise<ApiResponse<Room>> => {
  return http.put<Room>(`/rooms/${id}`, data);
};

/**
 * 删除房间
 */
export const deleteRoom = (id: number): Promise<ApiResponse<void>> => {
  return http.delete<void>(`/rooms/${id}`);
};

/**
 * 获取房间详情列表（聚合接口：包含床位和学员信息）
 */
export const getRoomDetailList = (params?: RoomDetailListParams & { _t?: number }): Promise<ApiResponse<RoomDetail[]>> => {
  // 添加时间戳参数避免缓存，确保获取最新数据
  const finalParams = {
    ...params,
    _t: params?._t || Date.now(), // 时间戳参数
  };
  return http.get<RoomDetail[]>('/rooms/with-beds-students', { params: finalParams });
};

/**
 * 申请入住学员参数
 */
export interface ApplyCheckinParams {
  bedId: number;
  bedNum?: string; // 当bedId为0时，需要提供bedNum
  roomId?: number; // 当bedId为0时，需要提供roomId
  roomTypeId?: number; // 当bedId为0时，需要提供roomTypeId
  stuId: number;
  checkinDate: string; // YYYY-MM-DD
  originalAmount: number;
  actualAmount: number;
  salespersonId?: string;
}

/**
 * 申请入住学员
 */
export const applyCheckinStudent = (params: ApplyCheckinParams): Promise<ApiResponse<void>> => {
  return http.post<void>('/rooms/apply-checkin', params);
};

/**
 * 申请更换床位参数
 */
export interface ApplyChangeBedParams {
  currentBedId: number;
  newBedId: number;
  stuId: number;
  originalAmount: number;
  actualAmount: number;
}

/**
 * 申请更换床位
 */
export const applyChangeBed = (params: ApplyChangeBedParams): Promise<ApiResponse<void>> => {
  return http.post<void>('/rooms/apply-change-bed', params);
};

/**
 * 学员离营参数
 */
export interface CheckoutStudentParams {
  bedId: number;
  stuId: number;
  checkoutDate: string; // YYYY-MM-DD
}

/**
 * 学员离营
 */
export const checkoutStudent = (params: CheckoutStudentParams): Promise<ApiResponse<void>> => {
  return http.post<void>('/rooms/checkout-student', params);
};
