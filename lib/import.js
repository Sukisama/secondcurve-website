// ========================================
// 数据导入工具库
// 支持导入 CSV、Excel 文件到 Supabase
// ========================================

import { supabase } from './supabase/client'

/**
 * 解析 CSV 文件
 */
export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target.result
        const lines = text.split('\n').filter(line => line.trim())

        if (lines.length === 0) {
          reject(new Error('文件为空'))
          return
        }

        // 解析表头
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))

        // 解析数据行
        const data = []
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
          if (values.length === headers.length) {
            const row = {}
            headers.forEach((header, index) => {
              row[header] = values[index]
            })
            data.push(row)
          }
        }

        resolve({
          headers,
          data,
          total: data.length
        })
      } catch (error) {
        reject(new Error('CSV解析失败：' + error.message))
      }
    }

    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

/**
 * 解析 Excel 文件 (简化版，只支持 CSV)
 * 注：完整 Excel 支持需要安装 xlsx 库
 */
export async function parseExcel(file) {
  // 如果是 CSV 文件，直接解析
  if (file.name.endsWith('.csv')) {
    return await parseCSV(file)
  }

  throw new Error('暂只支持 CSV 格式文件，请将 Excel 转换为 CSV 后上传')
}

/**
 * 字段映射配置
 */
export const fieldMappings = {
  // 案例字段映射
  cases: {
    '标题': 'title',
    '标题名称': 'title',
    '名称': 'title',
    '分类': 'category',
    '类别': 'category',
    '描述': 'description',
    '简介': 'description',
    '内容': 'description',
    '作者': 'author_name',
    '作者姓名': 'author_name',
    '标签': 'tags',
    '关键词': 'tags',
    '封面图': 'cover_image',
    '封面图片': 'cover_image',
    '公司': 'company',
    '公司名称': 'company',
    '行业': 'industry',
    '行业领域': 'industry',
    '网站': 'website',
    '网址': 'website',
    '阅读量': 'views',
    '浏览量': 'views'
  },

  // 活动字段映射
  events: {
    '标题': 'title',
    '活动名称': 'title',
    '名称': 'title',
    '描述': 'description',
    '简介': 'description',
    '内容': 'description',
    '地点': 'location',
    '地址': 'location',
    '活动地点': 'location',
    '日期': 'event_date',
    '活动日期': 'event_date',
    '时间': 'event_date',
    '开始时间': 'start_time',
    '结束时间': 'end_time',
    '价格': 'price',
    '费用': 'price',
    'VIP价格': 'vip_price',
    'VIP费用': 'vip_price',
    '名额': 'capacity',
    '人数限制': 'capacity',
    '标签': 'tags',
    '关键词': 'tags',
    '封面图': 'cover_image',
    '状态': 'status',
    '活动状态': 'status'
  },

  // 用户字段映射
  profiles: {
    '姓名': 'name',
    '名字': 'name',
    '邮箱': 'email',
    '邮箱地址': 'email',
    '公司': 'company',
    '公司名称': 'company',
    '职位': 'position',
    '职务': 'position',
    '简介': 'bio',
    '个人简介': 'bio',
    '地点': 'location',
    '城市': 'location',
    '技能': 'skills',
    '技能标签': 'skills',
    '兴趣': 'interests',
    '兴趣爱好': 'interests',
    '微信': 'wechat',
    '微信号': 'wechat',
    '微博': 'weibo',
    '微博ID': 'weibo',
    'GitHub': 'github',
    'Twitter': 'twitter',
    'LinkedIn': 'linkedin',
    '网站': 'website',
    '个人网站': 'website',
    '角色': 'role',
    '用户角色': 'role'
  },

  // 帖子字段映射
  posts: {
    '标题': 'title',
    '内容': 'content',
    '正文': 'content',
    '分类': 'category',
    '标签': 'tags',
    '关键词': 'tags'
  }
}

/**
 * 智能映射字段
 */
export function mapFields(data, tableName) {
  const mapping = fieldMappings[tableName]
  if (!mapping) {
    throw new Error(`不支持的表：${tableName}`)
  }

  return data.map(row => {
    const mappedRow = {}

    Object.keys(row).forEach(key => {
      const mappedKey = mapping[key]
      if (mappedKey) {
        // 特殊处理：数组字段
        if (['tags', 'skills', 'interests'].includes(mappedKey)) {
          mappedRow[mappedKey] = row[key] ? row[key].split(/[,，、;；]/).map(s => s.trim()).filter(s => s) : []
        }
        // 特殊处理：数字字段
        else if (['views', 'price', 'vip_price', 'capacity'].includes(mappedKey)) {
          const num = parseInt(row[key])
          if (!isNaN(num)) {
            mappedRow[mappedKey] = num
          }
        }
        // 特殊处理：日期字段
        else if (['event_date'].includes(mappedKey)) {
          if (row[key]) {
            const date = new Date(row[key])
            if (!isNaN(date.getTime())) {
              mappedRow[mappedKey] = date.toISOString()
            }
          }
        }
        // 普通字段
        else {
          mappedRow[mappedKey] = row[key] || ''
        }
      }
    })

    return mappedRow
  })
}

/**
 * 验证导入数据
 */
export function validateData(data, tableName) {
  const errors = []
  const validData = []

  data.forEach((row, index) => {
    const rowErrors = []

    switch (tableName) {
      case 'cases':
        if (!row.title) rowErrors.push('缺少标题')
        if (!row.category) rowErrors.push('缺少分类')
        if (!row.description) rowErrors.push('缺少描述')
        break

      case 'events':
        if (!row.title) rowErrors.push('缺少标题')
        if (!row.location) rowErrors.push('缺少地点')
        if (!row.event_date) rowErrors.push('缺少日期')
        break

      case 'posts':
        if (!row.title) rowErrors.push('缺少标题')
        if (!row.content) rowErrors.push('缺少内容')
        break

      case 'profiles':
        if (!row.name) rowErrors.push('缺少姓名')
        break
    }

    if (rowErrors.length > 0) {
      errors.push({
        row: index + 1,
        data: row,
        errors: rowErrors
      })
    } else {
      validData.push(row)
    }
  })

  return { errors, validData }
}

/**
 * 导入数据到 Supabase
 */
export async function importToDatabase(tableName, data, options = {}) {
  const results = {
    success: 0,
    failed: 0,
    errors: []
  }

  // 分批导入（每批100条）
  const batchSize = options.batchSize || 100

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)

    try {
      const { error } = await supabase
        .from(tableName)
        .insert(batch)

      if (error) {
        results.failed += batch.length
        results.errors.push({
          batch: Math.floor(i / batchSize) + 1,
          error: error.message
        })
      } else {
        results.success += batch.length
      }
    } catch (err) {
      results.failed += batch.length
      results.errors.push({
        batch: Math.floor(i / batchSize) + 1,
        error: err.message
      })
    }
  }

  return results
}

/**
 * 下载导入模板
 */
export function downloadTemplate(tableName) {
  let csvContent = ''

  switch (tableName) {
    case 'cases':
      csvContent = '标题,分类,描述,作者,公司,行业,标签,封面图,网站\n'
      csvContent += 'AI智能客服系统实战,技术应用,详细描述内容...,张三,字节跳动,互联网,"AI,NLP,客服",https://example.com/cover.jpg,https://example.com\n'
      break

    case 'events':
      csvContent = '标题,描述,地点,日期,开始时间,结束时间,价格,VIP价格,名额,标签\n'
      csvContent += 'AI技术分享会,探讨最新的AI技术应用,成都高新区,2024-04-15,14:00,17:00,50,30,50,"AI,技术分享"\n'
      break

    case 'profiles':
      csvContent = '姓名,公司,职位,简介,地点,技能,兴趣,微信,GitHub\n'
      csvContent += '张三,字节跳动,高级工程师,专注于AI应用开发,成都,"Python,React,AI","AI,创业,阅读",zhangsan123,zhangsan\n'
      break

    case 'posts':
      csvContent = '标题,内容,分类,标签\n'
      csvContent += '如何学习AI技术,这是一篇关于AI学习路线的文章...,技术讨论,"AI,学习"\n'
      break
  }

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${tableName}_import_template.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

/**
 * 完整的导入流程
 */
export async function processImport(file, tableName, options = {}) {
  try {
    // 1. 解析文件
    const parsed = await parseExcel(file)

    if (parsed.data.length === 0) {
      return {
        success: false,
        error: '文件中没有有效数据'
      }
    }

    // 2. 映射字段
    const mappedData = mapFields(parsed.data, tableName)

    // 3. 验证数据
    const { errors, validData } = validateData(mappedData, tableName)

    if (validData.length === 0) {
      return {
        success: false,
        error: '没有有效数据可导入',
        validationErrors: errors
      }
    }

    // 4. 导入数据库
    const results = await importToDatabase(tableName, validData, options)

    return {
      success: true,
      total: parsed.data.length,
      valid: validData.length,
      imported: results.success,
      failed: results.failed,
      errors: [...errors, ...results.errors]
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}