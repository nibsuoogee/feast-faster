import { Elysia, t } from "elysia";
import { sql } from "bun";
import { jwtConfig } from "../config/jwtConfig";
import { authorizationMiddleware } from "../middleware/authorization";

export const orderRouter = new Elysia()
  .use(jwtConfig)
  .derive(authorizationMiddleware)
  .guard(
    {
      beforeHandle: async ({ headers, jwt_auth, status }) => {
        const { user } = await authorizationMiddleware({ headers, jwt_auth });
        console.log("in here");
        if (!user) {
          console.log("Unauthorized access attempt");
          return status(401, "Not Authorized");
        }
        //return { user };

      },
    },
    (app) =>
      app.post(
        "/orders",
        async ({ body, user, status }) => {
          console.log("POST /orders body received:", body);

          try {
            const { restaurantId, items } = body;

            // Convert restaurantId like "r1" → 1
            const restaurant_id = Number(restaurantId.replace(/\D/g, ""));
            if (!restaurant_id) {
              return status(400, "Invalid restaurantId");
            }

            // Compute total price
            const total_price = items.reduce(
              (sum: number, i: any) =>
                sum + (Number(i.menuItem.price) || 0) * (i.quantity || 1),
              0
            );

            // 1 Insert order
            const [newOrder] = await sql`
              INSERT INTO orders (customer_id, restaurant_id, total_price)
              VALUES (${user.id}, ${restaurant_id}, ${total_price})
              RETURNING *
            `;

            if (!newOrder) {
              console.error("Failed to create order for user:", user.id);
              return status(500, "Failed to create order");
            }

            console.log("Order created:", newOrder);

            // 2 Insert order items
            for (const item of items) {
              // Convert menu_item_id if it comes as "m123"
              const menu_item_id = Number(item.menuItem.id.replace(/\D/g, "")) || 0;

              await sql`
                INSERT INTO order_items (order_id, menu_item_id, name, details, price)
                VALUES (
                  ${newOrder.order_id},
                  ${menu_item_id},
                  ${item.menuItem.name},
                  ${item.menuItem.description || ""},
                  ${Number(item.menuItem.price) || 0}
                )
              `;
              console.log(
                `Inserted item ${item.menuItem.name} into order ${newOrder.order_id}`
              );
            }

            return { message: "Order created successfully", order: newOrder };
          } catch (err: any) {
            console.error("Error creating order:", err);
            return status(500, "Internal server error");
          }
        },
        {
          body: t.Object({
            restaurantId: t.String(),
            items: t.Array(
              t.Object({
                menuItem: t.Object({
                  id: t.String(),
                  name: t.String(),
                  description: t.Optional(t.String()),
                  price: t.Any(),
                }),
                quantity: t.Optional(t.Any()),
              })
            ),
          }),
          response: {
            200: t.Object({
              message: t.String(),
              order: t.Any(),
            }),
            400: t.String(),
            401: t.String(),
            500: t.String(),
          },
        }
      )
  );
