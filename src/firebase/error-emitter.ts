import { EventEmitter } from 'events';

/**
 * A central event emitter for surfacing Firebase-related errors globally.
 */
class ErrorEmitter extends EventEmitter {}

export const errorEmitter = new ErrorEmitter();