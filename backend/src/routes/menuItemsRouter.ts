
import { Elysia } from 'elysia'
import { getMenuItems } from '../models/menu_items'

export const menuItemsRouter = new Elysia({ prefix: '/menu-items' })
  .get('/', async ({ query, set }) => {
    const restaurant_id = Number(query.restaurant_id)

    if (!restaurant_id || Number.isNaN(restaurant_id)) {
      set.status = 400
      return { error: 'restaurant_id is required and must be a number' }
    }

    try {
      const items = await getMenuItems(restaurant_id)
      return items
    } catch (err) {
      console.error('Error fetching menu items:', err)
      set.status = 500
      return { error: 'Internal server error' }
    }
  })
