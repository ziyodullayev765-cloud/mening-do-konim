export type ActionState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  /** Changes on every submission so clients can react to repeated results. */
  ts?: number;
};

export function success(message?: string): ActionState {
  return { ok: true, message, ts: Date.now() };
}

export function failure(message: string, errors?: Record<string, string[]>): ActionState {
  return { ok: false, message, errors, ts: Date.now() };
}
