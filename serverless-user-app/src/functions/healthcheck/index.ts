import { handlerPath } from "@libs/handlerResolver";

export const hello = {
  handler: `${handlerPath(__dirname)}/handler.hello`,
  events: [
    {
      http: {
        method: "get",
        path: "hello",
      },
    },
  ],
};
