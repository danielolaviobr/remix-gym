import { createCookie } from "@remix-run/node";
import { addDays } from "date-fns";

export const exerciseCookies = createCookie("exercises", {
  expires: addDays(new Date(), 1),
});
