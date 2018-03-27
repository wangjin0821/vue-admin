import request from '@/utils/request'

export function getMenuList() {
  return request({
    url: '/system/menu/list',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
