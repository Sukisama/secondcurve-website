import { supabase } from './supabase/client'

/**
 * 上传图片到 Supabase Storage
 * @param {File} file - 要上传的文件
 * @param {string} folder - 存储文件夹 (avatars, cases, etc.)
 * @returns {Promise<{url: string, error: Error}>}
 */
export async function uploadImage(file, folder = 'images') {
  try {
    // 生成唯一文件名
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // 上传文件
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      return { url: null, error }
    }

    // 获取公开URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)

    return { url: publicUrl, error: null }
  } catch (error) {
    return { url: null, error }
  }
}

/**
 * 上传多张图片
 * @param {FileList} files - 文件列表
 * @param {string} folder - 存储文件夹
 * @param {number} maxFiles - 最大文件数量
 * @returns {Promise<{urls: string[], errors: Error[]}>}
 */
export async function uploadMultipleImages(files, folder = 'images', maxFiles = 5) {
  const urls = []
  const errors = []

  const fileArray = Array.from(files).slice(0, maxFiles)

  for (const file of fileArray) {
    const { url, error } = await uploadImage(file, folder)
    if (url) {
      urls.push(url)
    }
    if (error) {
      errors.push(error)
    }
  }

  return { urls, errors }
}

/**
 * 删除图片
 * @param {string} url - 图片URL
 * @returns {Promise<{success: boolean, error: Error}>}
 */
export async function deleteImage(url) {
  try {
    // 从URL中提取文件路径
    const pathMatch = url.match(/\/storage\/v1\/object\/public\/images\/(.+)$/)
    if (!pathMatch) {
      return { success: false, error: new Error('Invalid URL format') }
    }

    const filePath = pathMatch[1]

    const { error } = await supabase.storage
      .from('images')
      .remove([filePath])

    if (error) {
      return { success: false, error }
    }

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error }
  }
}

/**
 * 压缩图片（如果需要）
 * @param {File} file - 原始文件
 * @param {number} maxWidth - 最大宽度
 * @param {number} quality - 压缩质量 (0-1)
 * @returns {Promise<File>}
 */
export async function compressImage(file, maxWidth = 1920, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          },
          file.type,
          quality
        )
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}