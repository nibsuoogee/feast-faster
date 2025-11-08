import { pool } from '../db'

export async function getMenuItems(restaurantId: number) {
  const { rows } = await pool.query(
    `
    SELECT 
      menu_item_id,
      name,
      details,
      price,
      minutes_to_prepare,
      availability
    FROM menu_items
    WHERE restaurant_id = $1
    ORDER BY menu_item_id ASC
    `,
    [restaurantId]
  )
  return rows
}
