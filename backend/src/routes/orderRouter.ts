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
        if (!user) {
          console.log("Unauthorized access attempt");
          return status(401, "Not Authorized");
        }
      },
    },
    (app) =>
      app.post(
        "/orders",
        async ({ body, user, status }) => {
          console.log("POST /orders body received:", body);

          try {
            const { restaurantId, stationId, items, isPaid } = body;

            const restaurant_id = Number(restaurantId.replace(/\D/g, ""));
            const charger_id = Number(stationId.replace(/\D/g, ""));
            if (!restaurant_id || !charger_id) {
              return status(400, "Invalid restaurantId or stationId");
            }

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

            // 3 Insert reservation AFTER order and items
            // reservation_start is mocked to current time
            // reservation_end is mocked to 30 mins after reservation_start time
            // time_of_payment is defaulted to current_time if isPaid is true.
            const now = new Date();
            const reservation_end = new Date(now.getTime() + 30 * 60 * 1000); // +30 mins

            const [newReservation] = await sql`
              INSERT INTO reservations 
                (order_id, charger_id, reservation_start, reservation_end, time_of_payment, final_price_of_charge)
              VALUES 
                (
                  ${newOrder.order_id},
                  ${charger_id},
                  ${now},
                  ${reservation_end},
                  ${isPaid ? now : null},
                  ${isPaid ? total_price : null}
                )
              RETURNING *
            `;

            console.log("Reservation created:", newReservation);

            return { message: "Order and reservation created successfully", order: newOrder, reservation: newReservation };
          } catch (err: any) {
            console.error("Error creating order:", err);
            return status(500, "Internal server error");
          }
        },
        {
          body: t.Object({
            restaurantId: t.String(),
            stationId: t.String(),
            items: t.Array(
              t.Object({
                menuItem: t.Object({
                  id: t.String(),
                  name: t.String(),
                  description: t.Optional(t.String()),
                  price: t.Any(),
                }),
                quantity: t.Optional(t.Any()), //  fixed parenthesis
              })
            ),
            isPaid: t.Boolean(),
          }),
          response: {
            200: t.Object({
              message: t.String(),
              order: t.Any(),
              reservation: t.Any(),
            }),
            400: t.String(),
            401: t.String(),
            500: t.String(),
          },
        }
      )
  );
