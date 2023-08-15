import { handlerPath } from "@libs/handlerResolver";

export const ping = {
  handler: `${handlerPath(__dirname)}/handler.ping`,
  events: [
    {
      http: {
        method: "get",
        path: "healthcheck/ping",
        cors: true,
      },
    },
  ],
};
