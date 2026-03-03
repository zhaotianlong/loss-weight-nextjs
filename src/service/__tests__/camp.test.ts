/**
 * 营地服务单元测试
 */
import {
  getCampList,
  getCampDetail,
  createCamp,
  updateCamp,
  deleteCamp,
} from '../camp'
import { http } from '@/lib/request'

// Mock request module
jest.mock('@/lib/request', () => ({
  http: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('camp service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCampList', () => {
    it('应该获取营地列表', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            campId: 1,
            campName: '北京营地',
            address: '北京市朝阳区',
            capacity: 100,
            currentNum: 50,
            contactPerson: '张三',
            contactPhone: '13888880001',
            status: 1,
          },
        ],
        meta: {
          page: 1,
          pageSize: 10,
          total: 1,
          pageCount: 1,
        },
      }

      ;(http.get as jest.Mock).mockResolvedValue(mockResponse)

      const result = await getCampList({ page: 1, pageSize: 10 })

      expect(http.get).toHaveBeenCalledWith('/camps', {
        params: { page: 1, pageSize: 10 },
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该支持筛选参数', async () => {
      const mockResponse = {
        success: true,
        data: [],
        meta: {
          page: 1,
          pageSize: 10,
          total: 0,
          pageCount: 0,
        },
      }

      ;(http.get as jest.Mock).mockResolvedValue(mockResponse)

      await getCampList({
        page: 1,
        pageSize: 10,
        campName: '北京',
        status: 1,
      })

      expect(http.get).toHaveBeenCalledWith('/camps', {
        params: {
          page: 1,
          pageSize: 10,
          campName: '北京',
          status: 1,
        },
      })
    })
  })

  describe('getCampDetail', () => {
    it('应该获取营地详情', async () => {
      const mockResponse = {
        success: true,
        data: {
          campId: 1,
          campName: '北京营地',
          address: '北京市朝阳区',
          capacity: 100,
          currentNum: 50,
          contactPerson: '张三',
          contactPhone: '13888880001',
          status: 1,
        },
      }

      ;(http.get as jest.Mock).mockResolvedValue(mockResponse)

      const result = await getCampDetail(1)

      expect(http.get).toHaveBeenCalledWith('/camps/1')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('createCamp', () => {
    it('应该创建营地', async () => {
      const campData = {
        campName: '新营地',
        address: '北京市海淀区',
        capacity: 200,
        currentNum: 0,
        contactPerson: '李四',
        contactPhone: '13888880002',
        status: 1,
      }

      const mockResponse = {
        success: true,
        data: {
          campId: 2,
          ...campData,
        },
      }

      ;(http.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await createCamp(campData)

      expect(http.post).toHaveBeenCalledWith('/camps', campData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateCamp', () => {
    it('应该更新营地', async () => {
      const updateData = {
        campName: '更新后的营地',
        capacity: 150,
      }

      const mockResponse = {
        success: true,
        data: {
          campId: 1,
          campName: '更新后的营地',
          capacity: 150,
        },
      }

      ;(http.put as jest.Mock).mockResolvedValue(mockResponse)

      const result = await updateCamp(1, updateData)

      expect(http.put).toHaveBeenCalledWith('/camps/1', updateData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteCamp', () => {
    it('应该删除营地', async () => {
      const mockResponse = {
        success: true,
        data: undefined,
      }

      ;(http.delete as jest.Mock).mockResolvedValue(mockResponse)

      const result = await deleteCamp(1)

      expect(http.delete).toHaveBeenCalledWith('/camps/1')
      expect(result).toEqual(mockResponse)
    })
  })
})
