import Elysia, { t } from "elysia";
import { jwtConfig } from "../config/jwtConfig";
import { authorizationMiddleware } from "../middleware/authorization";

export const calendarRouter = new Elysia()
  .use(jwtConfig)
  .derive(authorizationMiddleware)
  .guard(
    {
      beforeHandle: async ({ headers, jwt_auth, status }) => {
        const { user } = await authorizationMiddleware({ headers, jwt_auth });
        if (!user) return status(401, "Not Authorized");

        return { user };
      },
    },
    (app) =>
      app
        .post(
          "/settings",
          async ({ body, user, status }) => {
            // 1) create a new calendar for the user
            // const calendarForCreation: CalendarModelForCreation = {
            //   owner_user_id: user.id,
            //   ...body,
            // };
            // const [calendar, errCalendar] = await tryCatch(
            //   CalendarDTO.createCalendar(calendarForCreation)
            // );
            // if (errCalendar) return status(500, errCalendar.message);
            // if (!calendar) return status(500, "Failed to create calendar");
            // // 2) use membershipModel to create a new membership
            // const membershipForCreation: MembershipModelForCreation = {
            //   calendar_id: calendar.id,
            //   user_id: user.id,
            //   role: "owner",
            //   color: getRandomColor(),
            // };
            // const [membership, errMembership] = await tryCatch(
            //   MembershipDTO.createMembership(membershipForCreation)
            // );
            // if (errMembership) return status(500, errMembership.message);
            // if (!membership) return status(500, "Failed to create membership");
            // return { calendar, membership };
          }
          // {
          //   body: calendarCreateBody,
          //   response: {
          //     200: t.Object({
          //       calendar: calendarModel,
          //       membership: membershipModel,
          //     }),
          //     500: t.String(),
          //   },
          // }
        )
        .patch(
          "/settings",
          async ({ body, user, status }) => {
            // 1) check if the user owns the calendar
            // const [isCalendarOwner, errOwner] = await tryCatch(
            //   CalendarDTO.isCalendarOwner(body.id, user.id)
            // );
            // if (errOwner) return status(500, errOwner.message);
            // if (!isCalendarOwner)
            //   return status(401, "No authorized access to calendar");
            // // 2) Update the calendar
            // const { id, ...calendarForUpdate } = body;
            // const [calendar, errCalendar] = await tryCatch(
            //   CalendarDTO.updateCalendar(id, calendarForUpdate)
            // );
            // if (errCalendar) return status(500, errCalendar.message);
            // if (!calendar) return status(500, "Failed to update calendar");
            // return calendar;
          }
          // {
          //   body: calendarUpdateBody,
          //   response: {
          //     200: calendarModel,
          //     401: t.String(),
          //     500: t.String(),
          //   },
          // }
        )
  );
