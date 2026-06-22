const { Server } = require("rpc-websockets");

const PORT = 4000;
const server = new Server({ port: PORT, host: "localhost" });

console.log(`11-05 RPC WS server started on ws://localhost:${PORT}`);

server.setAuth(({ login, password }) => login === "student" && password === "student");

function normalizeParams(params) {
  if (params === undefined || params === null) return [];
  return Array.isArray(params) ? params : [params];
}

function square(params) {
  const args = normalizeParams(params);
  if (args.length === 1) {
    const r = Number(args[0]);
    return Math.PI * r * r;
  }
  if (args.length === 2) {
    const a = Number(args[0]);
    const b = Number(args[1]);
    return a * b;
  }
  throw new Error("square expects 1 or 2 arguments");
}

function sum(params) {
  return normalizeParams(params).map(Number).reduce((acc, v) => acc + v, 0);
}

function mul(params) {
  return normalizeParams(params).map(Number).reduce((acc, v) => acc * v, 1);
}

function fib(params) {
  const n = Number(normalizeParams(params)[0]);
  if (n < 0) throw new Error("n must be >= 0");
  if (n === 0) return [];
  if (n === 1) return [0];
  const arr = [0, 1];
  while (arr.length < n) arr.push(arr[arr.length - 1] + arr[arr.length - 2]);
  return arr;
}

function fact(params) {
  const n = Number(normalizeParams(params)[0]);
  if (n < 0) throw new Error("n must be >= 0");
  let r = 1;
  for (let i = 2; i <= n; i += 1) r *= i;
  return r;
}

server.register("square", square);
server.register("sum", sum);
server.register("mul", mul);

server.register("fib", fib).protected();
server.register("fact", fact).protected();

server.on("connection", () => console.log("RPC client connected"));

