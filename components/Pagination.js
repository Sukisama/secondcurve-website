import { useState } from 'react'

/**
 * 通用分页组件
 * @param {number} total - 总数据量
 * @param {number} pageSize - 每页显示数量
 * @param {number} currentPage - 当前页码
 * @param {function} onPageChange - 页码变化回调
 */
export default function Pagination({ total, pageSize = 10, currentPage = 1, onPageChange }) {
  const totalPages = Math.ceil(total / pageSize)

  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages = []
    const showPages = 5 // 显示的页码数量

    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2))
    let endPage = Math.min(totalPages, startPage + showPages - 1)

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      {/* 上一页 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        上一页
      </button>

      {/* 页码 */}
      <div className="flex items-center space-x-1">
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
              currentPage === page
                ? 'bg-gray-900 text-white'
                : 'border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* 下一页 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        下一页
      </button>

      {/* 页码信息 */}
      <span className="text-sm text-gray-500">
        第 {currentPage} / {totalPages} 页，共 {total} 条
      </span>
    </div>
  )
}