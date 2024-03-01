import http from "http";

type Response = {
  json: (data: any) => void;
};

const express = () => {
  let mapping: Record<string, any> = {};

  const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    if (mapping[req.url!]) {
      return res.end(JSON.stringify(mapping[req.url!]));
    }
    res.end(
      JSON.stringify({
        data: "invalid url",
      })
    );
  });

  return {
    get: (
      url: string,
      requestListenerFunction: (req: unknown, res: Response) => void
    ) => {
      requestListenerFunction(null, {
        json: (data) => {
          mapping[url] = data;
        },
      });
    },
    listen: (port: number) => {
      server.listen(port);
    },
  };
};

export default express;
