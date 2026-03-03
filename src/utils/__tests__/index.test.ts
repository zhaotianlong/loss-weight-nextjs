/**
 * 工具函数单元测试
 */
import {
  formatDate,
  formatMoney,
  calculateOccupancyRate,
  debounce,
  throttle,
} from '../index'

describe('utils', () => {
  describe('formatDate', () => {
    it('应该格式化日期为 YYYY-MM-DD', () => {
      const date = new Date('2024-01-15')
      expect(formatDate(date)).toBe('2024-01-15')
    })

    it('应该格式化日期字符串', () => {
      expect(formatDate('2024-01-15')).toBe('2024-01-15')
    })

    it('应该格式化日期为 YYYY-MM-DD HH:mm:ss', () => {
      const date = new Date('2024-01-15T10:30:45')
      expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2024-01-15 10:30:45')
    })

    it('应该返回 "-" 当日期为 null', () => {
      expect(formatDate(null)).toBe('-')
    })

    it('应该返回 "-" 当日期为 undefined', () => {
      expect(formatDate(undefined)).toBe('-')
    })

    it('应该返回 "-" 当日期无效', () => {
      expect(formatDate('invalid-date')).toBe('-')
    })
  })

  describe('formatMoney', () => {
    it('应该格式化金额', () => {
      expect(formatMoney(1234.56)).toBe('¥1,234.56')
    })

    it('应该格式化大金额', () => {
      expect(formatMoney(1234567.89)).toBe('¥1,234,567.89')
    })

    it('应该返回 "-" 当金额为 null', () => {
      expect(formatMoney(null)).toBe('-')
    })

    it('应该返回 "-" 当金额为 undefined', () => {
      expect(formatMoney(undefined)).toBe('-')
    })

    it('应该格式化零金额', () => {
      expect(formatMoney(0)).toBe('¥0.00')
    })
  })

  describe('calculateOccupancyRate', () => {
    it('应该计算占用率', () => {
      expect(calculateOccupancyRate(50, 100)).toBe(50)
    })

    it('应该返回 0 当总数为 0', () => {
      expect(calculateOccupancyRate(50, 0)).toBe(0)
    })

    it('应该计算小数占用率', () => {
      expect(calculateOccupancyRate(33, 100)).toBe(33)
    })

    it('应该计算满员占用率', () => {
      expect(calculateOccupancyRate(100, 100)).toBe(100)
    })

    it('应该计算超过容量的占用率', () => {
      expect(calculateOccupancyRate(150, 100)).toBe(150)
    })
  })

  describe('debounce', () => {
    jest.useFakeTimers()

    it('应该延迟执行函数', () => {
      const func = jest.fn()
      const debouncedFunc = debounce(func, 100)

      debouncedFunc()
      expect(func).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)
      expect(func).toHaveBeenCalledTimes(1)
    })

    it('应该取消之前的调用', () => {
      const func = jest.fn()
      const debouncedFunc = debounce(func, 100)

      debouncedFunc()
      debouncedFunc()
      debouncedFunc()

      jest.advanceTimersByTime(100)
      expect(func).toHaveBeenCalledTimes(1)
    })

    it('应该传递参数', () => {
      const func = jest.fn()
      const debouncedFunc = debounce(func, 100)

      debouncedFunc('arg1', 'arg2')
      jest.advanceTimersByTime(100)

      expect(func).toHaveBeenCalledWith('arg1', 'arg2')
    })

    afterEach(() => {
      jest.clearAllTimers()
    })
  })

  describe('throttle', () => {
    jest.useFakeTimers()

    it('应该限制函数执行频率', () => {
      const func = jest.fn()
      const throttledFunc = throttle(func, 100)

      throttledFunc()
      expect(func).toHaveBeenCalledTimes(1)

      throttledFunc()
      expect(func).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(100)
      throttledFunc()
      expect(func).toHaveBeenCalledTimes(2)
    })

    it('应该传递参数', () => {
      const func = jest.fn()
      const throttledFunc = throttle(func, 100)

      throttledFunc('arg1', 'arg2')
      expect(func).toHaveBeenCalledWith('arg1', 'arg2')
    })

    afterEach(() => {
      jest.clearAllTimers()
    })
  })
})
