const channel = "nativefragments.worker";
const transferMarker = Symbol("nativefragments.transfer");

const post = (target, message, transfer = []) => {
  target.postMessage(message, transfer);
};

const serializeError = (error) => ({
  message: error?.message ?? String(error),
  name: error?.name ?? "Error",
});

const toError = (error) => {
  const next = new Error(error?.message ?? "Worker call failed");
  next.name = error?.name ?? "Error";
  return next;
};

const isWorkerUrl = (value) =>
  typeof value === "string" || value instanceof URL;

const isTransferResult = (value) =>
  Boolean(value?.[transferMarker]);

/**
 * Wrap a worker response with Transferable objects.
 *
 * @template T
 * @param {T} payload Response payload.
 * @param {Transferable[]} [transfer=[]] Transferable objects to move.
 * @returns {{ payload: T, transfer: Transferable[], [transferMarker]: true }}
 */
export const transferResult = (payload, transfer = []) => ({
  [transferMarker]: true,
  payload,
  transfer,
});

/**
 * @typedef {object} WorkerClientOptions
 * @property {number} [timeout=30000] Request timeout in milliseconds.
 */

/**
 * @typedef {object} NativeWorkerClient
 * @property {(type: string, payload?: unknown, transfer?: Transferable[]) => Promise<unknown>} call
 * Call a named worker handler.
 * @property {() => void} dispose Reject pending calls and remove listeners.
 * @property {Worker} worker The wrapped Worker instance.
 */

/**
 * Create a tiny RPC client for a dedicated Web Worker.
 *
 * @param {Worker} worker Worker instance.
 * @param {WorkerClientOptions} [options={}] Client options.
 * @returns {NativeWorkerClient} Worker client.
 */
export const workerClient = (worker, { timeout = 30_000 } = {}) => {
  let lastId = 0;
  const pending = new Map();

  const clear = (id) => {
    const request = pending.get(id);
    if (!request) return null;
    clearTimeout(request.timer);
    pending.delete(id);
    return request;
  };

  const onMessage = (event) => {
    const message = event.data;
    if (message?.channel !== channel || !message.id) return;

    const request = clear(message.id);
    if (!request) return;

    if (message.ok) {
      request.resolve(message.payload);
    } else {
      request.reject(toError(message.error));
    }
  };

  worker.addEventListener("message", onMessage);

  return {
    worker,
    call(type, payload, transfer = []) {
      const id = ++lastId;

      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`Worker call timed out: ${type}`));
        }, timeout);

        pending.set(id, { resolve, reject, timer });
        post(worker, { channel, id, type, payload }, transfer);
      });
    },
    dispose() {
      worker.removeEventListener("message", onMessage);
      for (const [id, request] of pending) {
        clearTimeout(request.timer);
        request.reject(new Error("Worker client disposed"));
        pending.delete(id);
      }
    },
  };
};

/**
 * Create a module worker and wrap it with `workerClient`.
 *
 * @param {string | URL | Worker} workerOrUrl Existing Worker or worker module URL.
 * @param {WorkerClientOptions & { workerOptions?: WorkerOptions }} [options={}]
 * Client and Worker constructor options.
 * @returns {NativeWorkerClient} Worker client.
 */
export const createWorkerClient = (
  workerOrUrl,
  { workerOptions = { type: "module" }, ...clientOptions } = {},
) => {
  const worker = isWorkerUrl(workerOrUrl)
    ? new Worker(workerOrUrl, workerOptions)
    : workerOrUrl;
  return workerClient(worker, clientOptions);
};

/**
 * Expose named handlers inside a dedicated Web Worker.
 *
 * @param {Record<string, (payload: unknown, context: { event: MessageEvent, type: string }) => unknown | Promise<unknown>>} handlers
 * Worker handlers keyed by message type.
 * @param {DedicatedWorkerGlobalScope} [scope=globalThis] Worker global scope.
 * @returns {() => void} Cleanup function.
 */
export const exposeWorker = (handlers, scope = globalThis) => {
  const onMessage = async (event) => {
    const message = event.data;
    if (message?.channel !== channel || !message.id) return;

    try {
      const handler = handlers[message.type];
      if (!handler) throw new Error(`Unknown worker handler: ${message.type}`);

      const result = await handler(message.payload, { event, type: message.type });
      const response = isTransferResult(result)
        ? { payload: result.payload, transfer: result.transfer }
        : { payload: result, transfer: [] };

      post(scope, {
        channel,
        id: message.id,
        ok: true,
        payload: response.payload,
      }, response.transfer);
    } catch (error) {
      post(scope, {
        channel,
        id: message.id,
        ok: false,
        error: serializeError(error),
      });
    }
  };

  scope.addEventListener("message", onMessage);
  return () => scope.removeEventListener("message", onMessage);
};
